// server/src/routes/postRoutes/tvr.ts
// --- FULLY REBUILT ---
// Technical Visit Reports POST — schema-accurate, coercions, app-generated id

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { technicalVisitReports, insertTechnicalVisitReportSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ---- helpers ----
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return [];
    return s.includes(',') ? s.split(',').map(t => t.trim()).filter(Boolean) : [s];
  }
  return [];
};

const nullableString = z
  .string()
  .transform((s) => (s.trim() === '' ? null : s))
  .optional()
  .nullable();

// --- Zod schema that EXACTLY matches the DB table ---
const tvrInputSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
    reportDate: z.coerce.date(),
    visitType: z.string().max(50),
    siteNameConcernedPerson: z.string().max(255),
    phoneNo: z.string().max(20),
    emailId: nullableString,
    clientsRemarks: z.string().max(500),
    salespersonRemarks: z.string().max(500),
    checkInTime: z.coerce.date(),
    checkOutTime: z.coerce.date().nullable().optional(),
    inTimeImageUrl: nullableString,
    outTimeImageUrl: nullableString,
    
    // Array fields
    siteVisitBrandInUse: z.preprocess(toStringArray, z.array(z.string()).min(1, "siteVisitBrandInUse requires at least one brand")),
    influencerType: z.preprocess(toStringArray, z.array(z.string()).min(1, "influencerType requires at least one type")),

    // Nullable text fields
    siteVisitStage: nullableString,
    conversionFromBrand: nullableString,
    conversionQuantityUnit: nullableString,
    associatedPartyName: nullableString,
    serviceType: nullableString,
    qualityComplaint: nullableString,
    promotionalActivity: nullableString,
    channelPartnerVisit: nullableString,

    // Nullable numeric
    conversionQuantityValue: z.coerce.number().nullable().optional(),

    siteVisitType: nullableString,
    dhalaiVerificationCode: nullableString,
    isVerificationStatus: nullableString,
    meetingId: nullableString,
    pjpId: nullableString,

    timeSpentinLoc: nullableString,
    purposeOfVisit: nullableString,
    sitePhotoUrl: nullableString,
    
    firstVisitTime: z.coerce.date().nullable().optional(),
    lastVisitTime: z.coerce.date().nullable().optional(),
    
    firstVisitDay: nullableString,
    lastVisitDay: nullableString,

    siteVisitsCount: z.coerce.number().int().nullable().optional(),
    otherVisitsCount: z.coerce.number().int().nullable().optional(),
    totalVisitsCount: z.coerce.number().int().nullable().optional(),

    region: nullableString,
    area: nullableString,

    latitude: z.coerce.number().nullable().optional(),
    longitude: z.coerce.number().nullable().optional(),
    
    masonId: nullableString,
  })
  .strict();

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof technicalVisitReports,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // 1) validate + coerce
      const input = tvrInputSchema.parse(req.body);

      // 2) map to insert
      const insertData = {
        id: randomUUID(), // App-generated UUID
        userId: input.userId,
        reportDate: toDateOnly(input.reportDate), // Normalize to YYYY-MM-DD
        visitType: input.visitType,
        siteNameConcernedPerson: input.siteNameConcernedPerson,
        phoneNo: input.phoneNo,
        emailId: input.emailId ?? null,
        clientsRemarks: input.clientsRemarks,
        salespersonRemarks: input.salespersonRemarks,
        checkInTime: input.checkInTime, // Full timestamp
        checkOutTime: input.checkOutTime ?? null,
        inTimeImageUrl: input.inTimeImageUrl ?? null,
        outTimeImageUrl: input.outTimeImageUrl ?? null,
        siteVisitBrandInUse: input.siteVisitBrandInUse,
        influencerType: input.influencerType,
        siteVisitStage: input.siteVisitStage ?? null,
        conversionFromBrand: input.conversionFromBrand ?? null,
        
        // --- ✅ TS FIX ---
        // Convert number|null to string|null for Drizzle 'numeric' type
        conversionQuantityValue: input.conversionQuantityValue !== null && input.conversionQuantityValue !== undefined 
                                  ? String(input.conversionQuantityValue) 
                                  : null,
        // --- END FIX ---

        conversionQuantityUnit: input.conversionQuantityUnit ?? null,
        associatedPartyName: input.associatedPartyName ?? null,
        serviceType: input.serviceType ?? null,
        qualityComplaint: input.qualityComplaint ?? null,
        promotionalActivity: input.promotionalActivity ?? null,
        channelPartnerVisit: input.channelPartnerVisit ?? null,
        siteVisitType: input.siteVisitType ?? null,
        dhalaiVerificationCode: input.dhalaiVerificationCode ?? null,
        isVerificationStatus: input.isVerificationStatus ?? null,
        meetingId: input.meetingId ?? null,
        pjpId: input.pjpId ?? null,

        timeSpentinLoc: input.timeSpentinLoc ?? null,
        purposeOfVisit: input.purposeOfVisit ?? null,
        sitePhotoUrl: input.sitePhotoUrl ?? null,
        
        firstVisitTime: input.firstVisitTime ?? null,
        lastVisitTime: input.lastVisitTime ?? null,
        
        firstVisitDay: input.firstVisitDay ?? null,
        lastVisitDay: input.lastVisitDay ?? null,

        siteVisitsCount: input.siteVisitsCount ?? null,
        otherVisitsCount: input.otherVisitsCount ?? null,
        totalVisitsCount: input.totalVisitsCount ?? null,

        region: input.region ?? null,
        area: input.area ?? null,

        // Convert number|null to string|null for Drizzle 'numeric' type
        latitude: input.latitude !== null && input.latitude !== undefined 
                    ? String(input.latitude) 
                    : null,
        longitude: input.longitude !== null && input.longitude !== undefined 
                    ? String(input.longitude) 
                    : null,
        
        masonId: input.masonId ?? null,
      };

      // 3) insert + return
      const [record] = await db.insert(table).values(insertData).returning();

      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: record,
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });
}

export default function setupTechnicalVisitReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'technical-visit-reports',
    table: technicalVisitReports,
    tableName: 'Technical Visit Report',
  });
  
  console.log('✅ Technical Visit Reports POST endpoints setup complete (Schema-Accurate)');
}