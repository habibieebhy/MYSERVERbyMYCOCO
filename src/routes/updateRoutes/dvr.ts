// server/src/routes/updateRoutes/dvr.ts
// Daily Visit Reports PATCH — coercions, partial updates, safe nulls

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// ---- helpers (mirrored from POST) ----
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

// ---- patch schema (all fields optional) ----
const dvrPatchSchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    reportDate: z.coerce.date().optional(),
    dealerType: z.string().max(50).optional(),
    dealerName: nullableString,
    subDealerName: nullableString,
    location: z.string().max(500).optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    visitType: z.string().max(50).optional(),
    dealerTotalPotential: z.coerce.number().optional(),
    dealerBestPotential: z.coerce.number().optional(),
    brandSelling: z.preprocess(toStringArray, z.array(z.string()).min(1)).optional(),
    contactPerson: nullableString,
    contactPersonPhoneNo: nullableString,
    todayOrderMt: z.coerce.number().optional(),
    todayCollectionRupees: z.coerce.number().optional(),
    overdueAmount: z.coerce.number().nullable().optional(),
    feedbacks: z.string().max(500).min(1).optional(),
    solutionBySalesperson: nullableString,
    anyRemarks: nullableString,
    checkInTime: z.coerce.date().optional(),
    checkOutTime: z.coerce.date().nullable().optional(),
    inTimeImageUrl: nullableString,
    outTimeImageUrl: nullableString,
    pjpId: z.string().max(255).nullable().optional(),
  })
  .strict();

export default function setupDailyVisitReportsPatchRoutes(app: Express) {
  
  app.patch('/api/daily-visit-reports/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 1) validate + coerce
      const input = dvrPatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update were provided.' });
      }

      // 2) ensure exists
      const [existing] = await db
        .select({ id: dailyVisitReports.id })
        .from(dailyVisitReports)
        .where(eq(dailyVisitReports.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `Daily Visit Report with ID '${id}' not found.`,
        });
      }
      
      // 3) build patch object safely
      // We explicitly build the patch object to avoid sending 'undefined'
      // for fields that weren't in the input.
      const patch: any = {};
      
      if (input.userId !== undefined) patch.userId = input.userId;
      if (input.reportDate !== undefined) patch.reportDate = input.reportDate;
      if (input.dealerType !== undefined) patch.dealerType = input.dealerType;
      if (input.dealerName !== undefined) patch.dealerName = input.dealerName;
      if (input.subDealerName !== undefined) patch.subDealerName = input.subDealerName;
      if (input.location !== undefined) patch.location = input.location;
      if (input.latitude !== undefined) patch.latitude = input.latitude;
      if (input.longitude !== undefined) patch.longitude = input.longitude;
      if (input.visitType !== undefined) patch.visitType = input.visitType;
      if (input.dealerTotalPotential !== undefined) patch.dealerTotalPotential = input.dealerTotalPotential;
      if (input.dealerBestPotential !== undefined) patch.dealerBestPotential = input.dealerBestPotential;
      if (input.brandSelling !== undefined) patch.brandSelling = input.brandSelling;
      if (input.contactPerson !== undefined) patch.contactPerson = input.contactPerson;
      if (input.contactPersonPhoneNo !== undefined) patch.contactPersonPhoneNo = input.contactPersonPhoneNo;
      if (input.todayOrderMt !== undefined) patch.todayOrderMt = input.todayOrderMt;
      if (input.todayCollectionRupees !== undefined) patch.todayCollectionRupees = input.todayCollectionRupees;
      if (input.overdueAmount !== undefined) patch.overdueAmount = input.overdueAmount;
      if (input.feedbacks !== undefined) patch.feedbacks = input.feedbacks;
      if (input.solutionBySalesperson !== undefined) patch.solutionBySalesperson = input.solutionBySalesperson;
      if (input.anyRemarks !== undefined) patch.anyRemarks = input.anyRemarks;
      if (input.checkInTime !== undefined) patch.checkInTime = input.checkInTime;
      if (input.checkOutTime !== undefined) patch.checkOutTime = input.checkOutTime;
      if (input.inTimeImageUrl !== undefined) patch.inTimeImageUrl = input.inTimeImageUrl;
      if (input.outTimeImageUrl !== undefined) patch.outTimeImageUrl = input.outTimeImageUrl;
      if (input.pjpId !== undefined) patch.pjpId = input.pjpId;
      
      patch.updatedAt = new Date(); // always touch updatedAt

      // 4) update
      const [updated] = await db
        .update(dailyVisitReports)
        .set(patch)
        .where(eq(dailyVisitReports.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'Daily Visit Report updated successfully',
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
      console.error('Update DVR error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update Daily Visit Report',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ Daily Visit Reports PATCH endpoint setup complete');
}