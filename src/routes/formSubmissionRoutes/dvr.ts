// server/src/routes/postRoutes/dvr.ts
// Daily Visit Reports POST endpoints using createAutoCRUD pattern
// Manual validation strictly matching the daily_visit_reports table schema.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema matching your DB table exactly
const dailyVisitReportSchema = z.object({
  userId: z.number().int().positive(),

  // DB: date not null
  reportDate: z.preprocess((arg) => (arg ? new Date(String(arg)) : undefined), z.date()),

  dealerType: z.string().max(50),
  dealerName: z.string().max(255).optional().nullable(),
  subDealerName: z.string().max(255).optional().nullable(),

  location: z.string().max(500),

  // numeric(10,7)
  latitude: z.preprocess((v) => (typeof v === 'string' ? parseFloat(v) : v), z.number()),
  longitude: z.preprocess((v) => (typeof v === 'string' ? parseFloat(v) : v), z.number()),

  visitType: z.string().max(50),

  // numeric(10,2) not null
  dealerTotalPotential: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? undefined : Number(v), z.number()),
  dealerBestPotential: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? undefined : Number(v), z.number()),

  // text array not null
  brandSelling: z.array(z.string()).min(1),

  contactPerson: z.string().max(255).optional().nullable(),
  contactPersonPhoneNo: z.string().max(20).optional().nullable(),

  // numeric not null
  todayOrderMt: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? undefined : Number(v), z.number()),
  todayCollectionRupees: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? undefined : Number(v), z.number()),

  overdueAmount: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? null : Number(v), z.number().nullable()),

  // DB: varchar(500) not null
  feedbacks: z.string().max(500).nonempty(),

  solutionBySalesperson: z.string().max(500).optional().nullable(),
  anyRemarks: z.string().max(500).optional().nullable(),

  // timestamps: not null / nullable
  checkInTime: z.preprocess((arg) => (arg ? new Date(String(arg)) : undefined), z.date()),
  checkOutTime: z.preprocess((arg) => (arg === "" || arg === null || typeof arg === 'undefined') ? null : new Date(String(arg)), z.date().nullable()),

  inTimeImageUrl: z.string().max(500).optional().nullable(),
  outTimeImageUrl: z.string().max(500).optional().nullable(),

  // createdAt/updatedAt are autoFields; not expected in request
}).strict(); // no extra/unknown fields allowed

// Handler that uses the schema above
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

      // Small, deliberate convenience: if brandSelling arrives as comma string, convert to array.
      // This does NOT change the required schema — brandSelling must become an array before validation.
      if (typeof payload.brandSelling === 'string') {
        payload.brandSelling = payload.brandSelling.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // NOTE: feedbacks is a required string in DB — do NOT accept array here.
      // If a client sends an array for feedbacks, validation will fail (intentional).

      // Execute autoFields
      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      // Strict validation against DB-matching schema
      const parsed = schema.parse(payload);

      // Generate id consistent with your other routes
      const generatedId = randomUUID().replace(/-/g, '').substring(0, 25);

      // Prepare insert object. parsed has coerced values (dates, numbers)
      const insertData: any = {
        id: generatedId,
        userId: parsed.userId,
        reportDate: parsed.reportDate,
        dealerType: parsed.dealerType,
        dealerName: parsed.dealerName ?? null,
        subDealerName: parsed.subDealerName ?? null,
        location: parsed.location,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        visitType: parsed.visitType,
        dealerTotalPotential: parsed.dealerTotalPotential,
        dealerBestPotential: parsed.dealerBestPotential,
        brandSelling: parsed.brandSelling,
        contactPerson: parsed.contactPerson ?? null,
        contactPersonPhoneNo: parsed.contactPersonPhoneNo ?? null,
        todayOrderMt: parsed.todayOrderMt,
        todayCollectionRupees: parsed.todayCollectionRupees,
        overdueAmount: parsed.overdueAmount ?? null,
        feedbacks: parsed.feedbacks,
        solutionBySalesperson: parsed.solutionBySalesperson ?? null,
        anyRemarks: parsed.anyRemarks ?? null,
        checkInTime: parsed.checkInTime,
        checkOutTime: parsed.checkOutTime ?? null,
        inTimeImageUrl: parsed.inTimeImageUrl ?? null,
        outTimeImageUrl: parsed.outTimeImageUrl ?? null,
        ...executedAutoFields,
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
            received: (err as any).received
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
    schema: dailyVisitReportSchema,
    tableName: 'Daily Visit Report',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });

  console.log('✅ Daily Visit Reports POST endpoints (DB-schema exact) setup complete');
}
