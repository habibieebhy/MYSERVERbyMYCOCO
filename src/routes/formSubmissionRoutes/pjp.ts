// server/src/routes/postRoutes/permanentJourneyPlans.ts
// Permanent Journey Plans POST — schema-accurate, coercions, app-generated id

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// --- helpers ---
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
const nullableString = z.string().transform(s => (s.trim() === '' ? null : s)).optional().nullable();

// --- input schema (matches table + coercions) ---
const pjpInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  planDate: z.coerce.date(),                         // normalize to YYYY-MM-DD
  areaToBeVisited: z.string().max(500),
  description: nullableString,                       // "" -> null
  status: z.string().max(50).optional().default('pending'),
}).strict();

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof permanentJourneyPlans,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // 1) validate + coerce
      const input = pjpInputSchema.parse(req.body);

      // 2) map to insert — generate ID in app (no DB default needed)
      const insertData = {
        id: randomUUID(), // <= critical change
        userId: input.userId,
        createdById: input.createdById,
        planDate: toDateOnly(input.planDate), // DATE only
        areaToBeVisited: input.areaToBeVisited,
        description: input.description ?? null,
        status: input.status ?? 'pending',
        // createdAt / updatedAt come from DB defaults if present; if not, omit safely
      };

      // 3) insert + return
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
