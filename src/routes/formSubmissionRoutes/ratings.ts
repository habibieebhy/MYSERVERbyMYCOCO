//  server/src/routes/postRoutes/ratings.ts 
// Ratings POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { ratings, insertRatingSchema } from '../../db/schema';
import { z } from 'zod';

// Manual Zod schema EXACTLY matching the table schema
// const ratingSchema = z.object({
//   userId: z.number().int().positive(),
//   area: z.string().min(1),
//   region: z.string().min(1),
//   rating: z.number().int().min(1).max(5),
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

      const insertData = {
        ...parsed,
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

export default function setupRatingsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'ratings',
    table: ratings,
    schema: insertRatingSchema,
    tableName: 'Rating'
  });
  
  console.log('✅ Ratings POST endpoints setup complete');
}