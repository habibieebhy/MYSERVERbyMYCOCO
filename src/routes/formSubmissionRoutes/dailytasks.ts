//  server/src/routes/postRoutes/dailyTasks.ts 
// Daily Tasks POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyTasks, insertDailyTaskSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema with empty string handling
// const dailyTaskSchema = z.object({
//   userId: z.number().int().positive(),
//   assignedByUserId: z.number().int().positive(),
//   taskDate: z.string().or(z.date()),
//   visitType: z.string().max(50),
//   relatedDealerId: z.string().max(255).optional().or(z.literal("")),
//   siteName: z.string().max(255).optional().or(z.literal("")),
//   description: z.string().max(500).optional().or(z.literal("")),
//   status: z.string().max(50).default("Assigned"),
//   pjpId: z.string().max(255).optional().or(z.literal("")),
// }).transform((data) => ({
//   ...data,
//   relatedDealerId: data.relatedDealerId === "" ? null : data.relatedDealerId,
//   siteName: data.siteName === "" ? null : data.siteName,
//   description: data.description === "" ? null : data.description,
//   pjpId: data.pjpId === "" ? null : data.pjpId,
// }));

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
        taskDate: new Date(parsed.taskDate),
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
            code: err.code
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

export default function setupDailyTasksPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-tasks',
    table: dailyTasks,
    schema: insertDailyTaskSchema,
    tableName: 'Daily Task',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Daily Tasks POST endpoints setup complete');
}