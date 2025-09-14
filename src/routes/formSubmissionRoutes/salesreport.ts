//  server/src/routes/postRoutes/salesReport.ts 
// Sales Report POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesReport, insertSalesReportSchema } from '../../db/schema';
import { z } from 'zod';

// Manual Zod schema EXACTLY matching the table schema with strict validation
// const salesReportSchema = z.object({
//   date: z.string().or(z.date()),
//   monthlyTarget: z.string().min(1, "Monthly target is required"),
//   tillDateAchievement: z.string().min(1, "Till date achievement is required"),
//   yesterdayTarget: z.string().optional().nullable().or(z.literal("")),
//   yesterdayAchievement: z.string().optional().nullable().or(z.literal("")),
//   salesPersonId: z.number().int().positive("Sales person ID must be a positive integer"),
//   dealerId: z.string().max(255).min(1, "Dealer ID is required"),
// }).transform((data) => ({
//   ...data,
//   yesterdayTarget: data.yesterdayTarget === "" ? null : data.yesterdayTarget,
//   yesterdayAchievement: data.yesterdayAchievement === "" ? null : data.yesterdayAchievement,
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

      // Validate the payload with enhanced error handling
      const parsed = schema.parse(req.body);

      // Prepare data for insertion - NO ID needed (serial auto-increment)
      const insertData = {
        ...parsed,
        date: new Date(parsed.date),
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
            received: err.received,
            expected: err.expected
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

export default function setupSalesReportPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'sales-reports',
    table: salesReport,
    schema: insertSalesReportSchema,
    tableName: 'Sales Report'
  });
  
  console.log('✅ Sales Report POST endpoints setup complete');
}