// server/src/routes/postRoutes/dvr.ts
// Daily Visit Reports POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema for Daily Visit Report
const dailyVisitReportSchema = z.object({
  userId: z.number().int().positive(),

  // Accept string or date; preprocess converts to Date
  reportDate: z.preprocess((arg) => (arg ? new Date(String(arg)) : undefined), z.date()),

  outletName: z.string().max(255),
  contactPerson: z.string().max(255).optional().nullable().or(z.literal("")),
  phoneNo: z.string().max(20),
  emailId: z.string().max(255).optional().nullable().or(z.literal("")),
  purposeOfVisit: z.string().max(500).optional().nullable().or(z.literal("")),

  brandSelling: z.array(z.string()).min(1),

  // Required fields (adjust types if your DB differs)
  dealerType: z.string().max(100),
  location: z.string().max(255),
  latitude: z.preprocess((v) => (typeof v === 'string' ? parseFloat(v) : v), z.number()),
  longitude: z.preprocess((v) => (typeof v === 'string' ? parseFloat(v) : v), z.number()),
  visitType: z.string().max(50),
  dealerTotalPotential: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? null : Number(v), z.number().nullable()),
  dealerBestPotential: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? null : Number(v), z.number().nullable()),
  todayOrderMt: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? null : Number(v), z.number().nullable()),
  todayCollectionRupees: z.preprocess((v) => (v === "" || v === null || typeof v === 'undefined') ? null : Number(v), z.number().nullable()),

  // feedbacks: accept array or comma string; always transform to array
  feedbacks: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : [];
  }),

  clientsRemarks: z.string().max(500).optional().nullable().or(z.literal("")),
  salespersonRemarks: z.string().max(500).optional().nullable().or(z.literal("")),

  // Accept strings and convert to Date. checkOutTime may be empty/null -> null
  checkInTime: z.preprocess((arg) => (arg ? new Date(String(arg)) : undefined), z.date()),
  checkOutTime: z.preprocess((arg) => (arg === "" || arg === null || typeof arg === 'undefined') ? null : new Date(String(arg)), z.date().nullable()),

  inTimeImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  outTimeImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  salesValue: z.string().optional().nullable().or(z.literal("")),
  followUpRequired: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  contactPerson: data.contactPerson === "" ? null : data.contactPerson,
  emailId: data.emailId === "" ? null : data.emailId,
  purposeOfVisit: data.purposeOfVisit === "" ? null : data.purposeOfVisit,
  clientsRemarks: data.clientsRemarks === "" ? null : data.clientsRemarks,
  salespersonRemarks: data.salespersonRemarks === "" ? null : data.salespersonRemarks,
  inTimeImageUrl: data.inTimeImageUrl === "" ? null : data.inTimeImageUrl,
  outTimeImageUrl: data.outTimeImageUrl === "" ? null : data.outTimeImageUrl,
  salesValue: data.salesValue === "" ? null : data.salesValue,
}));

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

      // Normalize brandSelling if it arrives as comma string
      if (typeof payload.brandSelling === 'string') {
        payload.brandSelling = payload.brandSelling.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // If client sent feedbacks as comma string -> schema transform will handle it,
      // but keep this normalization to be defensive (no harm).
      if (typeof payload.feedbacks === 'string') {
        payload.feedbacks = payload.feedbacks.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      // Validate and coerce with Zod (preprocessors convert strings -> Date/numbers)
      const parsed = schema.parse(payload);

      // parsed.reportDate, parsed.checkInTime, parsed.checkOutTime are Date objects (or null)
      const generatedId = randomUUID().replace(/-/g, '').substring(0, 25);

      const insertData = {
        id: generatedId,
        ...parsed,
        // ensure DB gets Date / null as appropriate (parsed already coerced)
        reportDate: parsed.reportDate,
        checkInTime: parsed.checkInTime,
        checkOutTime: parsed.checkOutTime ?? null,
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

  console.log('✅ Daily Visit Reports POST endpoints setup complete');
}
