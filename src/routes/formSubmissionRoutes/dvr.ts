//  server/src/routes/postRoutes/dvr.ts 
// Daily Visit Reports POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports, insertDailyVisitReportSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

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
      const payload: any = { ...req.body };
      
      if (typeof payload.brandSelling === 'string') {
        payload.brandSelling = payload.brandSelling.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      const parsed = schema.parse(payload);
      const generatedId = randomUUID();

      const insertData = {
        id: generatedId,
        ...parsed,
        reportDate: new Date(parsed.reportDate),
        checkInTime: new Date(parsed.checkInTime),
        checkOutTime: parsed.checkOutTime ? new Date(parsed.checkOutTime) : null,
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

export default function setupDailyVisitReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-visit-reports',
    table: dailyVisitReports,
    schema: insertDailyVisitReportSchema,
    tableName: 'Daily Visit Report',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Daily Visit Reports POST endpoints setup complete');
}