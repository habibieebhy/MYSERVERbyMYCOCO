//  server/src/routes/postRoutes/collectionReports.ts 
// Collection Reports POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { collectionReports, insertCollectionReportSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema matching the exact table schema
// const collectionReportSchema = z.object({
//   dvrId: z.string(),
//   dealerId: z.string(),
//   collectedAmount: z.string(),
//   collectedOnDate: z.string().or(z.date()),
//   weeklyTarget: z.string().optional(),
//   tillDateAchievement: z.string().optional(),
//   yesterdayTarget: z.string().optional(),
//   yesterdayAchievement: z.string().optional(),
// });

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: any,
  schema: z.ZodSchema,
  tableName: string,
  autoFields?: { [key: string]: () => any }
}) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  // CREATE NEW RECORD
  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // Execute autoFields functions
      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      // Validate the payload
      const parsed = schema.parse(req.body);

      // Generate ID manually (fix for the database default issue)
      const generatedId = randomUUID().replace(/-/g, '').substring(0, 25);

      // Prepare data for insertion
      const insertData = {
        id: generatedId,
        ...parsed,
        collectedOnDate: new Date(parsed.collectedOnDate),
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
          details: error.errors
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

export default function setupCollectionReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'collection-reports',
    table: collectionReports,
    schema: insertCollectionReportSchema,
    tableName: 'Collection Report',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Collection Reports POST endpoints setup complete');
}