//  server/src/routes/postRoutes/ddp.ts 
// DDP POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { ddp, insertDdpSchema } from '../../db/schema';
import { z } from 'zod';

// Manual Zod schema EXACTLY matching the table schema
// const ddpSchema = z.object({
//   userId: z.number().int().positive(),
//   dealerId: z.string().max(255).min(1),
//   creationDate: z.string().or(z.date()),
//   status: z.string().min(1),
//   obstacle: z.string().optional().nullable().or(z.literal("")),
// }).transform((data) => ({
//   ...data,
//   obstacle: data.obstacle === "" ? null : data.obstacle,
//}));

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

      // Prepare data for insertion - NO ID needed (serial auto-increment)
      const insertData = {
        ...parsed,
        creationDate: new Date(parsed.creationDate),
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

export default function setupDdpPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'ddp',
    table: ddp,
    schema: insertDdpSchema,
    tableName: 'Dealer Development Process'
  });
  
  console.log('✅ DDP POST endpoints setup complete');
}