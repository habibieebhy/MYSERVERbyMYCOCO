// Dealer Reports and Scores POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealerReportsAndScores, insertDealerReportsAndScoresSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema
// const dealerReportsAndScoresSchema = z.object({
//   dealerId: z.string().max(255),
//   dealerScore: z.string(),
//   trustWorthinessScore: z.string(),
//   creditWorthinessScore: z.string(),
//   orderHistoryScore: z.string(),
//   visitFrequencyScore: z.string(),
//   lastUpdatedDate: z.string().or(z.date()),
// });

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
      const generatedId = randomUUID().replace(/-/g, '').substring(0, 25);

      const insertData = {
        id: generatedId,
        ...parsed,
        lastUpdatedDate: new Date(parsed.lastUpdatedDate),
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

export default function setupDealerReportsAndScoresPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealer-reports-scores',
    table: dealerReportsAndScores,
    schema: insertDealerReportsAndScoresSchema,
    tableName: 'Dealer Reports and Scores',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Dealer Reports and Scores POST endpoints setup complete');
}