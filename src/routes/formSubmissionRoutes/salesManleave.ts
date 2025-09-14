//  server/src/routes/postRoutes/salesManleave.ts 
// Salesman Leave Applications POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesmanLeaveApplications, insertSalesmanLeaveApplicationSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema
// const salesmanLeaveApplicationSchema = z.object({
//   userId: z.number().int().positive(),
//   leaveType: z.string().max(100),
//   startDate: z.string().or(z.date()),
//   endDate: z.string().or(z.date()),
//   reason: z.string().max(500),
//   status: z.string().max(50),
//   adminRemarks: z.string().max(500).optional().nullable().or(z.literal("")),
// }).transform((data) => ({
//   ...data,
//   adminRemarks: data.adminRemarks === "" ? null : data.adminRemarks,
// }));

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
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
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

export default function setupSalesmanLeaveApplicationsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'leave-applications',
    table: salesmanLeaveApplications,
    schema: insertSalesmanLeaveApplicationSchema,
    tableName: 'Salesman Leave Application',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Salesman Leave Applications POST endpoints setup complete');
}