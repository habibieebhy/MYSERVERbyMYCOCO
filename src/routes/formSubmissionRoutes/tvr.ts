// server/src/routes/postRoutes/tvr.ts
// Technical Visit Reports POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { technicalVisitReports } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Manual Zod schema EXACTLY matching the table schema (robust to numbers/strings for some fields)
const technicalVisitReportSchema = z.object({
  userId: z.number().int().positive(),

  // Accept string or date; preprocess converts to Date
  reportDate: z.preprocess((arg) => (arg ? new Date(String(arg)) : undefined), z.date()),

  visitType: z.string().max(50),
  siteNameConcernedPerson: z.string().max(255),
  phoneNo: z.string().max(20),
  emailId: z.string().max(255).optional().nullable().or(z.literal("")),
  clientsRemarks: z.string().max(500),
  salespersonRemarks: z.string().max(500),

  // Accept string or date; preprocess converts to Date
  checkInTime: z.preprocess((arg) => (arg ? new Date(String(arg)) : undefined), z.date()),
  checkOutTime: z.preprocess((arg) => (arg === "" || arg === null || typeof arg === 'undefined') ? null : new Date(String(arg)), z.date().nullable()),

  inTimeImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  outTimeImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  siteVisitBrandInUse: z.array(z.string()).min(1),
  siteVisitStage: z.string().optional().nullable().or(z.literal("")),
  conversionFromBrand: z.string().optional().nullable().or(z.literal("")),

  // Accept number or string or empty literal or null; always transform to string | null
  conversionQuantityValue: z.union([z.number(), z.string(), z.literal(""), z.null()]).transform((val) => {
    if (val === null) return null;
    if (val === "") return null;
    // numbers -> string; strings -> trimmed string; ensure empty -> null
    return String(val).trim() === "" ? null : String(val);
  }),

  conversionQuantityUnit: z.string().max(20).optional().nullable().or(z.literal("")),
  associatedPartyName: z.string().optional().nullable().or(z.literal("")),
  influencerType: z.array(z.string()).min(1),
  serviceType: z.string().optional().nullable().or(z.literal("")),
  qualityComplaint: z.string().optional().nullable().or(z.literal("")),
  promotionalActivity: z.string().optional().nullable().or(z.literal("")),
  channelPartnerVisit: z.string().optional().nullable().or(z.literal("")),
}).transform((data) => ({
  ...data,
  emailId: data.emailId === "" ? null : data.emailId,
  checkOutTime: data.checkOutTime === "" ? null : data.checkOutTime,
  inTimeImageUrl: data.inTimeImageUrl === "" ? null : data.inTimeImageUrl,
  outTimeImageUrl: data.outTimeImageUrl === "" ? null : data.outTimeImageUrl,
  siteVisitStage: data.siteVisitStage === "" ? null : data.siteVisitStage,
  conversionFromBrand: data.conversionFromBrand === "" ? null : data.conversionFromBrand,
  conversionQuantityValue: data.conversionQuantityValue === "" ? null : data.conversionQuantityValue,
  conversionQuantityUnit: data.conversionQuantityUnit === "" ? null : data.conversionQuantityUnit,
  associatedPartyName: data.associatedPartyName === "" ? null : data.associatedPartyName,
  serviceType: data.serviceType === "" ? null : data.serviceType,
  qualityComplaint: data.qualityComplaint === "" ? null : data.qualityComplaint,
  promotionalActivity: data.promotionalActivity === "" ? null : data.promotionalActivity,
  channelPartnerVisit: data.channelPartnerVisit === "" ? null : data.channelPartnerVisit,
}));

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
      // Process the request body for array conversion if needed
      const payload: any = { ...req.body };
      
      // If siteVisitBrandInUse comes as comma string, coerce to array
      if (typeof payload.siteVisitBrandInUse === 'string') {
        payload.siteVisitBrandInUse = payload.siteVisitBrandInUse.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // If influencerType comes as comma string, coerce to array
      if (typeof payload.influencerType === 'string') {
        payload.influencerType = payload.influencerType.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // If conversionQuantityValue arrives as number it's fine; schema handles number|string|null
      const executedAutoFields: any = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }

      // Let Zod preprocessors coerce strings -> Dates / numbers -> strings as configured
      const parsed = technicalVisitReportSchema.parse(payload);

      // Generate ID manually (fix for the database default issue)
      const generatedId = randomUUID().replace(/-/g, '').substring(0, 25);

      // Prepare data for insertion
      const insertData = {
        id: generatedId,
        ...parsed,
        reportDate: parsed.reportDate instanceof Date ? parsed.reportDate : new Date(parsed.reportDate),
        checkInTime: parsed.checkInTime instanceof Date ? parsed.checkInTime : new Date(parsed.checkInTime),
        checkOutTime: parsed.checkOutTime ? (parsed.checkOutTime instanceof Date ? parsed.checkOutTime : new Date(parsed.checkOutTime)) : null,
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

export default function setupTechnicalVisitReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'technical-visit-reports',
    table: technicalVisitReports,
    schema: technicalVisitReportSchema,
    tableName: 'Technical Visit Report',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date()
    }
  });
  
  console.log('✅ Technical Visit Reports POST endpoints setup complete');
}
