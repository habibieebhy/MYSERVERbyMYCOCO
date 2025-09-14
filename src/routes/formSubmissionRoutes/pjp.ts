//  server/src/routes/postRoutes/permanentJourneyPlans.ts 
// Permanent Journey Plans POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans, insertPermanentJourneyPlanSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema
const permanentJourneyPlanSchema = z.object({
  userId: z.number().int().positive(),
  createdById: z.number().int().positive(),
  planDate: z.string().or(z.date()),
  areaToBeVisited: z.string().max(500),
  description: z.string().max(500).optional().nullable().or(z.literal("")),
  status: z.string().max(50),
}).transform((data) => ({
  ...data,
  description: data.description === "" ? null : data.description,
}));

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: any,
  schema: z.ZodSchema,
  tableName: string,
  autoFields?: { [key: string]: () => any }
}) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      const parsed = schema.parse(req.body);
      const generatedId = randomUUID();

      const insertData = {
        id: generatedId,
        ...parsed,
        planDate: new Date(parsed.planDate),
        ...executedAutoFields
      };

      const [newRecord] = await db.insert(table).values(insertData).returning();

      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error: any) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

export default function setupPermanentJourneyPlansPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'pjp',
    table: permanentJourneyPlans,
    schema: insertPermanentJourneyPlanSchema,
    tableName: 'Permanent Journey Plan',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Permanent Journey Plans POST endpoints setup complete');
}