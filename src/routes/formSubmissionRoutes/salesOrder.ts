//  server/src/routes/postRoutes/salesOrders.ts 
// Sales Orders POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders, insertSalesOrderSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema - ACCEPTS NUMBERS OR STRINGS
// const salesOrderSchema = z.object({
//   salesmanId: z.number().int().positive().optional().nullable(),
//   dealerId: z.string().max(255).optional().nullable().or(z.literal("")),
//   quantity: z.union([z.string(), z.number()]).transform(val => String(val)),
//   unit: z.string().max(50).min(1, "Unit is required"),
//   orderTotal: z.union([z.string(), z.number()]).transform(val => String(val)),
//   advancePayment: z.union([z.string(), z.number()]).transform(val => String(val)),
//   pendingPayment: z.union([z.string(), z.number()]).transform(val => String(val)),
//   estimatedDelivery: z.string().or(z.date()),
//   remarks: z.string().max(500).optional().nullable().or(z.literal("")),
// }).transform((data) => ({
//   ...data,
//   dealerId: data.dealerId === "" ? null : data.dealerId,
//   remarks: data.remarks === "" ? null : data.remarks,
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
      const generatedId = randomUUID();

      // Prepare data for insertion
      const insertData = {
        id: generatedId,
        ...parsed,
        estimatedDelivery: new Date(parsed.estimatedDelivery),
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
          details: error.errors ? error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            received: err.received,
            expected: err.expected
          })) : []
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

export default function setupSalesOrdersPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'sales-orders',
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: 'Sales Order',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Sales Orders POST endpoints setup complete');
}