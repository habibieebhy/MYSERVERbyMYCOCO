// server/src/routes/postRoutes/permanentJourneyPlans.ts
// Permanent Journey Plans POST — schema-accurate, coercions, app-generated id

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// --- helpers ---
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
// Helper for strings that can be empty ("") or null, and should be stored as null.
const toNullableString = (s: string) => (s.trim() === '' ? null : s);

// --- input schema (matches table + coercions) ---
const pjpInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  planDate: z.coerce.date(),                         // normalize to YYYY-MM-DD
  areaToBeVisited: z.string().max(500),
  
  // --- FIXED: Explicit definitions for nullable strings ---
  description: z.string().max(500).transform(toNullableString).optional().nullable(),
  status: z.string().max(50).optional().default('pending'),

  // --- ADDED MISSING FIELDS (and fixed) ---
  visitDealerName: z.string().max(255).transform(toNullableString).optional().nullable(),
  verificationStatus: z.string().max(50).transform(toNullableString).optional().nullable(),
  additionalVisitRemarks: z.string().max(500).transform(toNullableString).optional().nullable(),

}).strict();

// --- FIXED: Use z.infer to get the output type ---
type PjpInput = z.infer<typeof pjpInputSchema>;

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof permanentJourneyPlans,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // 1) validate + coerce
      // --- FIXED: Explicitly type the parsed input ---
      const input: PjpInput = pjpInputSchema.parse(req.body);

      // 2) map to insert — generate ID in app
      // --- FIXED: All types now match correctly ---
      const insertData = {
        id: randomUUID(), // App-generated UUID
        userId: input.userId,
        createdById: input.createdById,
        planDate: toDateOnly(input.planDate), // input.planDate is Date
        areaToBeVisited: input.areaToBeVisited,
        description: input.description ?? null,
        status: input.status ?? 'pending',
        
        // --- ADDED ---
        visitDealerName: input.visitDealerName ?? null,
        verificationStatus: input.verificationStatus ?? null,
        additionalVisitRemarks: input.additionalVisitRemarks ?? null,
      };

      // 3) insert + return
      // --- FIXED: insertData now correctly matches the insert overload ---
      const [record] = await db.insert(table).values(insertData).returning();

      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: record,
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });
}

export default function setupPermanentJourneyPlansPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'pjp',
    table: permanentJourneyPlans,
    tableName: 'Permanent Journey Plan',
  });
  console.log('✅ Permanent Journey Plans POST endpoint ready (app-generated IDs)');
}

