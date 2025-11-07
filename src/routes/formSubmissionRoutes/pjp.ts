// server/src/routes/postRoutes/permanentJourneyPlans.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// helpers
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);

const strOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return String(val).trim();
}, z.string().nullable().optional());

// ---------- input schemas ----------
const pjpInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  dealerId: strOrNull,                         // nullable FK -> dealers.id
  planDate: z.coerce.date(),
  areaToBeVisited: z.string().max(500).min(1),
  description: strOrNull,
  status: z.string().max(50).min(1).default('PENDING'),
  verificationStatus: strOrNull,
  additionalVisitRemarks: strOrNull,
  idempotencyKey: z.string().max(120).optional(), // harmless to keep, not used in conflict now
}).strict();

const bulkSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  dealerIds: z.array(z.string().min(1)).min(1),
  baseDate: z.coerce.date(),
  batchSizePerDay: z.coerce.number().int().min(1).max(500).default(8),
  areaToBeVisited: z.string().max(500).min(1),
  description: strOrNull,
  status: z.string().max(50).default('PENDING'),
  bulkOpId: z.string().max(50).optional(),
  idempotencyKey: z.string().max(120).optional(),
}).strict();

export default function setupPermanentJourneyPlansPostRoutes(app: Express) {
  // SINGLE CREATE
  app.post('/api/pjp', async (req: Request, res: Response) => {
    try {
      const input = pjpInputSchema.parse(req.body);

      const [record] = await db
        .insert(permanentJourneyPlans)
        .values({
          id: randomUUID(),
          userId: input.userId,
          createdById: input.createdById,
          dealerId: input.dealerId ?? null,
          planDate: toDateOnly(input.planDate),
          areaToBeVisited: input.areaToBeVisited,
          description: input.description ?? null,
          status: input.status,
          verificationStatus: input.verificationStatus ?? null,
          additionalVisitRemarks: input.additionalVisitRemarks ?? null,
          idempotencyKey: input.idempotencyKey,
        })
        .onConflictDoNothing({
          // use the composite unique that definitely exists
          target: [
            permanentJourneyPlans.userId,
            permanentJourneyPlans.dealerId,
            permanentJourneyPlans.planDate,
          ],
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: record ? 'Permanent Journey Plan created successfully' : 'Skipped (already exists for user+dealer+date)',
        data: record ?? null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error('Create PJP error:', error);
      return res.status(500).json({ success: false, error: 'Failed to create PJP' });
    }
  });

  // BULK CREATE (unchanged; already targets composite unique)
  app.post('/api/bulkpjp', async (req: Request, res: Response) => {
    try {
      const input = bulkSchema.parse(req.body);

      const {
        userId, createdById, dealerIds, baseDate,
        batchSizePerDay, areaToBeVisited, description, status, bulkOpId, idempotencyKey
      } = input;

      const rows = dealerIds.map((dealerId, i) => {
        const dayOffset = Math.floor(i / batchSizePerDay);
        const planDate = toDateOnly(addDays(baseDate, dayOffset));
        return {
          id: randomUUID(),
          userId,
          createdById,
          dealerId,
          planDate,
          areaToBeVisited,
          description: description ?? null,
          status,
          bulkOpId,
          idempotencyKey,
        };
      });

      let totalCreated = 0;
      const CHUNK = 200;

      for (let i = 0; i < rows.length; i += CHUNK) {
        const result = await db
          .insert(permanentJourneyPlans)
          .values(rows.slice(i, i + CHUNK))
          .onConflictDoNothing({
            target: [
              permanentJourneyPlans.userId,
              permanentJourneyPlans.dealerId,
              permanentJourneyPlans.planDate,
            ],
          })
          .returning({ id: permanentJourneyPlans.id });

        totalCreated += result.length;
      }

      return res.status(201).json({
        success: true,
        message: 'Bulk PJP creation complete',
        requestedDealers: dealerIds.length,
        totalRowsCreated: totalCreated,
        totalRowsSkipped: dealerIds.length - totalCreated,
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
