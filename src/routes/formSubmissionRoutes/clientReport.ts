//  server/src/routes/postRoutes/clientReports.ts 
// Client Reports POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { clientReports, insertClientReportSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema matching the exact table schema
// const clientReportSchema = z.object({
//   dealerType: z.string(),
//   dealerSubDealerName: z.string(),
//   location: z.string(),
//   typeBestNonBest: z.string(),
//   dealerTotalPotential: z.string(),
//   dealerBestPotential: z.string(),
//   brandSelling: z.array(z.string()),
//   contactPerson: z.string(),
//   contactPersonPhoneNo: z.string(),
//   todayOrderMT: z.string(),
//   todayCollection: z.string(),
//   feedbacks: z.string(),
//   solutionsAsPerSalesperson: z.string(),
//   anyRemarks: z.string(),
//   checkOutTime: z.string().or(z.date()),
//   userId: z.number(),
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
      // Process the request body for array conversion
      const payload: any = { ...req.body };
      
      // Handle brandSelling array conversion if needed
      if (typeof payload.brandSelling === 'string') {
        payload.brandSelling = payload.brandSelling.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // Execute autoFields functions
      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      // Validate the payload
      const parsed = schema.parse(payload);

      // Generate ID manually (fix for the database default issue)
      const generatedId = randomUUID().replace(/-/g, '').substring(0, 25);

      // Prepare data for insertion
      const insertData = {
        id: generatedId,
        ...parsed,
        checkOutTime: new Date(parsed.checkOutTime),
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

export default function setupClientReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'client-reports',
    table: clientReports,
    schema: insertClientReportSchema,
    tableName: 'Client Report',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Client Reports POST endpoints setup complete');
}