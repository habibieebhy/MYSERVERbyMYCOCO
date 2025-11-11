// server/src/routes/updateRoutes/tvr.ts
// --- NEW FILE ---
// Technical Visit Reports PATCH — coercions, partial updates, safe nulls

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { technicalVisitReports } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

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

// --- Zod schema for PATCH (all fields optional) ---
const tvrPatchSchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    reportDate: z.coerce.date().optional(),
    visitType: z.string().max(50).optional(),
    siteNameConcernedPerson: z.string().max(255).optional(),
    phoneNo: z.string().max(20).optional(),
    emailId: nullableString,
    clientsRemarks: z.string().max(500).optional(),
    salespersonRemarks: z.string().max(500).optional(),
    checkInTime: z.coerce.date().optional(),
    checkOutTime: z.coerce.date().nullable().optional(),
    inTimeImageUrl: nullableString,
    outTimeImageUrl: nullableString,
    
    // Array fields
    siteVisitBrandInUse: z.preprocess(toStringArray, z.array(z.string()).min(1)).optional(),
    influencerType: z.preprocess(toStringArray, z.array(z.string()).min(1)).optional(),

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


export default function setupTechnicalVisitReportsPatchRoutes(app: Express) {
  
  app.patch('/api/technical-visit-reports/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 1) validate + coerce
      const input = tvrPatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update were provided.' });
      }

      // 2) ensure exists
      const [existing] = await db
        .select({ id: technicalVisitReports.id })
        .from(technicalVisitReports)
        .where(eq(technicalVisitReports.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `Technical Visit Report with ID '${id}' not found.`,
        });
      }
      
      // 3) build patch object safely
      // We manually build 'patch' to avoid 'undefined' values
      const patch: any = {};
      
      // Manually map fields to handle date normalization and explicit nulls
      if (input.userId !== undefined) patch.userId = input.userId;
      if (input.reportDate !== undefined) patch.reportDate = toDateOnly(input.reportDate);
      if (input.visitType !== undefined) patch.visitType = input.visitType;
      if (input.siteNameConcernedPerson !== undefined) patch.siteNameConcernedPerson = input.siteNameConcernedPerson;
      if (input.phoneNo !== undefined) patch.phoneNo = input.phoneNo;
      if (input.emailId !== undefined) patch.emailId = input.emailId;
      if (input.clientsRemarks !== undefined) patch.clientsRemarks = input.clientsRemarks;
      if (input.salespersonRemarks !== undefined) patch.salespersonRemarks = input.salespersonRemarks;
      if (input.checkInTime !== undefined) patch.checkInTime = input.checkInTime;
      if (input.checkOutTime !== undefined) patch.checkOutTime = input.checkOutTime;
      if (input.inTimeImageUrl !== undefined) patch.inTimeImageUrl = input.inTimeImageUrl;
      if (input.outTimeImageUrl !== undefined) patch.outTimeImageUrl = input.outTimeImageUrl;
      if (input.siteVisitBrandInUse !== undefined) patch.siteVisitBrandInUse = input.siteVisitBrandInUse;
      if (input.influencerType !== undefined) patch.influencerType = input.influencerType;
      if (input.siteVisitStage !== undefined) patch.siteVisitStage = input.siteVisitStage;
      if (input.conversionFromBrand !== undefined) patch.conversionFromBrand = input.conversionFromBrand;
      if (input.conversionQuantityValue !== undefined) patch.conversionQuantityValue = input.conversionQuantityValue;
      if (input.conversionQuantityUnit !== undefined) patch.conversionQuantityUnit = input.conversionQuantityUnit;
      if (input.associatedPartyName !== undefined) patch.associatedPartyName = input.associatedPartyName;
      if (input.serviceType !== undefined) patch.serviceType = input.serviceType;
      if (input.qualityComplaint !== undefined) patch.qualityComplaint = input.qualityComplaint;
      if (input.promotionalActivity !== undefined) patch.promotionalActivity = input.promotionalActivity;
      if (input.channelPartnerVisit !== undefined) patch.channelPartnerVisit = input.channelPartnerVisit;
      if (input.siteVisitType !== undefined) patch.siteVisitType = input.siteVisitType;
      if (input.dhalaiVerificationCode !== undefined) patch.dhalaiVerificationCode = input.dhalaiVerificationCode;
      if (input.isVerificationStatus !== undefined) patch.isVerificationStatus = input.isVerificationStatus;
      if (input.meetingId !== undefined) patch.meetingId = input.meetingId;
      if (input.pjpId !== undefined) patch.pjpId = input.pjpId;

      if (input.timeSpentinLoc !== undefined) patch.timeSpentinLoc = input.timeSpentinLoc;
      if (input.purposeOfVisit !== undefined) patch.purposeOfVisit = input.purposeOfVisit;
      if (input.sitePhotoUrl !== undefined) patch.sitePhotoUrl = input.sitePhotoUrl;
      if (input.firstVisitTime !== undefined) patch.firstVisitTime = input.firstVisitTime;
      if (input.lastVisitTime !== undefined) patch.lastVisitTime = input.lastVisitTime;
      if (input.firstVisitDay !== undefined) patch.firstVisitDay = input.firstVisitDay;
      if (input.lastVisitDay !== undefined) patch.lastVisitDay = input.lastVisitDay;
      if (input.siteVisitsCount !== undefined) patch.siteVisitsCount = input.siteVisitsCount;
      if (input.otherVisitsCount !== undefined) patch.otherVisitsCount = input.otherVisitsCount;
      if (input.totalVisitsCount !== undefined) patch.totalVisitsCount = input.totalVisitsCount;
      if (input.region !== undefined) patch.region = input.region;
      if (input.area !== undefined) patch.area = input.area;
      if (input.masonId !== undefined) patch.masonId = input.masonId;

      // Handle numeric-to-string conversion for patch
      if (input.conversionQuantityValue !== undefined) {
        patch.conversionQuantityValue = input.conversionQuantityValue !== null 
          ? String(input.conversionQuantityValue) 
          : null;
      }
      if (input.latitude !== undefined) {
        patch.latitude = input.latitude !== null 
          ? String(input.latitude) 
          : null;
      }
      if (input.longitude !== undefined) {
        patch.longitude = input.longitude !== null 
          ? String(input.longitude) 
          : null;
      }

      patch.updatedAt = new Date(); // always touch updatedAt

      // 4) update
      const [updated] = await db
        .update(technicalVisitReports)
        .set(patch)
        .where(eq(technicalVisitReports.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'Technical Visit Report updated successfully',
        data: updated,
      });

    } catch (error) {
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
      console.error('Update TVR error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update Technical Visit Report',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ Technical Visit Reports PATCH endpoint setup complete');
}