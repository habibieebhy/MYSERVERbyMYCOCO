// server/src/routes/postRoutes/permanentJourneyPlans.ts
// --- UPDATED to use dealerId ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';

// --- helpers ---
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
const strOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return String(val).trim();
}, z.string().nullable().optional());
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);

// --- input schema UPDATED ---
const pjpInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  
  // --- ✅ FIX ---
  dealerId: strOrNull, // Replaced visitDealerName
  // --- END FIX ---
  
  planDate: z.coerce.date(),
  areaToBeVisited: z.string().max(500).min(1),
  description: strOrNull,
  status: z.string().max(50).min(1).default('PENDING'),
  verificationStatus: strOrNull,
  additionalVisitRemarks: strOrNull,
}).strict();

const bulkSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  dealerIds: z.array(z.string().min(1)).min(1),
  baseDate: z.coerce.date(),                  // selected calendar date
  batchSizePerDay: z.coerce.number().int().min(1).max(500).default(8),
  areaToBeVisited: z.string().max(500).min(1),
  description: strOrNull,
  status: z.string().max(50).default('PENDING'),
  // optional: pass a client-supplied bulkOpId if you want to track this batch
  bulkOpId: z.string().max(50).optional()
}).strict();


export default function setupPermanentJourneyPlansPostRoutes(app: Express) {

  // --------------------------------------------------
  // SINGLE CREATE
  // --------------------------------------------------
  app.post('/api/pjp', async (req: Request, res: Response) => {
    try {
      // 1) validate
      const input = pjpInputSchema.parse(req.body);

      // 2) map to insert
      const insertData = {
        id: randomUUID(),
        userId: input.userId,
        createdById: input.createdById,
        
        // --- ✅ FIX ---
        dealerId: input.dealerId ?? null, // Use the new dealerId
        // --- END FIX ---

        planDate: toDateOnly(input.planDate),
        areaToBeVisited: input.areaToBeVisited,
        description: input.description ?? null,
        status: input.status,
        verificationStatus: input.verificationStatus ?? null,
        additionalVisitRemarks: input.additionalVisitRemarks ?? null,
      };

      // 3) insert
      const [record] = await db.insert(permanentJourneyPlans).values(insertData).returning();
      
      return res.status(201).json({
        success: true,
        message: 'Permanent Journey Plan created successfully',
        data: record,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      console.error('Create PJP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create PJP',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // --------------------------------------------------
  // BULK CREATE
  // --------------------------------------------------
  app.post('/api/bulkpjp', async (req: Request, res: Response) => {
    try {
      const input = bulkSchema.parse(req.body);

      const {
        userId, createdById, dealerIds, baseDate,
        batchSizePerDay, areaToBeVisited, description, status
      } = input;

      const rows: any[] = [];
      for (let i = 0; i < dealerIds.length; i++) {
        const dayOffset = Math.floor(i / batchSizePerDay);
        const planDate = toDateOnly(addDays(baseDate, dayOffset));
        rows.push({
          user_id: userId,
          created_by_id: createdById,
          dealer_id: dealerIds[i],
          plan_date: planDate,
          area_to_be_visited: areaToBeVisited,
          description: description ?? null,
          status,
          created_at: sql`now()`,
          updated_at: sql`now()`,
        });
      }

      const CHUNK = 200;
      let totalCreated = 0;

      for (let i = 0; i < rows.length; i += CHUNK) {
        const batch = rows.slice(i, i + CHUNK);

        const valuesSql = batch.map(r => {
          const esc = (s: string | null) =>
            s == null ? 'NULL' : `'${s.replace(/'/g, "''")}'`;
          return `(${r.user_id}, ${r.created_by_id}, ${esc(r.dealer_id)}, '${r.plan_date}', ${esc(r.area_to_be_visited)}, ${esc(r.description)}, '${r.status}', now(), now())`;
        }).join(",\n");

        const insertSql = `
          INSERT INTO permanent_journey_plans
            (user_id, created_by_id, dealer_id, plan_date, area_to_be_visited, description, status, created_at, updated_at)
          VALUES
            ${valuesSql}
          ON CONFLICT (user_id, dealer_id, plan_date) DO NOTHING
          RETURNING id;
        `;

        const result: any = await db.execute(sql.raw(insertSql));
        totalCreated += result?.rows?.length ?? 0;
      }

      return res.status(201).json({
        success: true,
        message: 'Bulk PJP creation complete',
        requestedDealers: dealerIds.length,
        totalRowsCreated: totalCreated,
        totalRowsSkipped: (dealerIds.length - totalCreated),
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error('Bulk PJP error:', error);
      return res.status(500).json({ success: false, error: 'Failed to process bulk PJP' });
    }
  });

  console.log('✅ PJP POST endpoints (using dealerId) setup complete');
}