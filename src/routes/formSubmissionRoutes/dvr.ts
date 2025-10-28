// server/src/routes/postRoutes/dvr.ts
// Daily Visit Reports POST — schema-accurate, coercions, CSV->array, optional pjpId
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ---- helpers ----
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

// ---- input schema (matches DB + coercions) ----
const dvrInputSchema = z
  .object({
    userId: z.coerce.number().int().positive(),

    reportDate: z.coerce.date(),

    dealerType: z.string().max(50),
    dealerName: nullableString,
    subDealerName: nullableString,

    location: z.string().max(500),

    latitude: z.coerce.number(),   // numeric(10,7)
    longitude: z.coerce.number(),  // numeric(10,7)

    visitType: z.string().max(50),

    dealerTotalPotential: z.coerce.number(),  // numeric(10,2)
    dealerBestPotential: z.coerce.number(),   // numeric(10,2)

    brandSelling: z.preprocess(toStringArray, z.array(z.string()).min(1)),

    contactPerson: nullableString,
    contactPersonPhoneNo: nullableString,

    todayOrderMt: z.coerce.number(),          // numeric(10,2)
    todayCollectionRupees: z.coerce.number(), // numeric(10,2)
    overdueAmount: z.coerce.number().nullable().optional(),

    feedbacks: z.string().max(500).min(1),

    solutionBySalesperson: nullableString,
    anyRemarks: nullableString,

    checkInTime: z.coerce.date(),
    checkOutTime: z.coerce.date().nullable().optional(),

    inTimeImageUrl: nullableString,
    outTimeImageUrl: nullableString,

    // NEW link (nullable)
    pjpId: z.string().max(255).optional().nullable(),
  })
  .strict();

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof dailyVisitReports,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // 1) validate + coerce
      const input = dvrInputSchema.parse(req.body);

      // 2) map to insert — EXPLICIT ID so we don't depend on DB defaults
      const insertData = {
        id: randomUUID(), // <— key fix
        userId: input.userId,
        reportDate: input.reportDate,
        dealerType: input.dealerType,
        dealerName: input.dealerName ?? null,
        subDealerName: input.subDealerName ?? null,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        visitType: input.visitType,
        dealerTotalPotential: input.dealerTotalPotential,
        dealerBestPotential: input.dealerBestPotential,
        brandSelling: input.brandSelling,
        contactPerson: input.contactPerson ?? null,
        contactPersonPhoneNo: input.contactPersonPhoneNo ?? null,
        todayOrderMt: input.todayOrderMt,
        todayCollectionRupees: input.todayCollectionRupees,
        overdueAmount: input.overdueAmount ?? null,
        feedbacks: input.feedbacks,
        solutionBySalesperson: input.solutionBySalesperson ?? null,
        anyRemarks: input.anyRemarks ?? null,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime ?? null,
        inTimeImageUrl: input.inTimeImageUrl ?? null,
        outTimeImageUrl: input.outTimeImageUrl ?? null,
        pjpId: input.pjpId ?? null,
        // createdAt/updatedAt: DB defaults
      };

      // 3) insert
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

export default function setupDailyVisitReportsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-visit-reports',
    table: dailyVisitReports,
    tableName: 'Daily Visit Report',
  });
  console.log('✅ Daily Visit Reports POST (schema-accurate, app-id) ready');
}
