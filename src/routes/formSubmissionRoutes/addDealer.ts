// server/src/routes/postRoutes/dealers.ts
// Dealers POST endpoint (create + Radar geofence) with robust empty-string/null coercion

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers } from '../../db/schema';
import { z } from 'zod';
import { InferInsertModel, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto'; // Use crypto for UUID

type DealerInsert = InferInsertModel<typeof dealers>;

// -------- helpers --------
export const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return [];
    return t.includes(',') ? t.split(',').map(s => s.trim()).filter(Boolean) : [t];
  }
  return [];
};

// empty string -> null for strings
export const strOrNull = z.preprocess((val) => {
  if (val === '') return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return val;
}, z.string().nullable().optional());

// empty string -> null for dates (and coerce)
export const dateOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  try {
    return new Date(String(val));
  } catch {
    return null;
  }
}, z.date().nullable().optional());

// number (coerced) nullable, empty string -> null
export const numOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z.number().nullable().optional());

// int (coerced) nullable
export const intOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z.number().int().nullable().optional());

// --- ✅ NEW HELPER ---
// Converts Date | null to "YYYY-MM-DD" | null
export const toDateOnlyString = (d: Date | null | undefined): string | null => {
  if (!d) return null;
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

// -------- input schema (coercing everything safely) --------
export const dealerInputSchema = z.object({
  userId: intOrNull,
  type: z.string().min(1),

  parentDealerId: strOrNull,           // "" -> null (fixes FK violation)
  name: z.string().min(1),
  region: z.string().min(1),
  area: z.string().min(1),
  phoneNo: z.string().min(1),
  address: z.string().min(1),
  pinCode: strOrNull,

  latitude: numOrNull,                 // accepts number or "22.57"
  longitude: numOrNull,

  dateOfBirth: dateOrNull,
  anniversaryDate: dateOrNull,

  totalPotential: z.coerce.number(), // Required
  bestPotential: z.coerce.number(),  // Required
  brandSelling: z.preprocess(toStringArray, z.array(z.string()).min(1, "brandSelling is required")), // Required

  feedbacks: z.string().min(1),
  remarks: strOrNull,

  // --- ADDED FOR PRISMA PARITY ---
  dealerDevelopmentStatus: strOrNull,
  dealerDevelopmentObstacle: strOrNull,
  salesGrowthPercentage: numOrNull,
  noOfPJP: intOrNull,
  // -----------------------------

  verificationStatus: z.enum(['PENDING', 'VERIFIED']).default('PENDING').optional(),

  // IDs & contacts
  whatsappNo: strOrNull,
  emailId: z.preprocess((val) => (val === '' ? null : val), z.string().email().nullable().optional()),
  businessType: strOrNull,
  
  // --- ✅ NEW FIELDS ADDED ---
  nameOfFirm: strOrNull,
  underSalesPromoterName: strOrNull,
  // --- END NEW FIELDS ---

  gstinNo: strOrNull,
  panNo: strOrNull,
  tradeLicNo: strOrNull,
  aadharNo: strOrNull,

  // Godown
  godownSizeSqFt: intOrNull,
  godownCapacityMTBags: strOrNull,
  godownAddressLine: strOrNull,
  godownLandMark: strOrNull,
  godownDistrict: strOrNull,
  godownArea: strOrNull,
  godownRegion: strOrNull,
  godownPinCode: strOrNull,

  // Residential
  residentialAddressLine: strOrNull,
  residentialLandMark: strOrNull,
  residentialDistrict: strOrNull,
  residentialArea: strOrNull,
  residentialRegion: strOrNull,
  residentialPinCode: strOrNull,

  // Bank
  bankAccountName: strOrNull,
  bankName: strOrNull,
  bankBranchAddress: strOrNull,
  bankAccountNumber: strOrNull,
  bankIfscCode: strOrNull,

  // Sales & promoter
  brandName: strOrNull,
  monthlySaleMT: numOrNull,
  noOfDealers: intOrNull,
  areaCovered: strOrNull,
  projectedMonthlySalesBestCementMT: numOrNull,
  noOfEmployeesInSales: intOrNull,

  // Declaration
  declarationName: strOrNull,
  declarationPlace: strOrNull,
  declarationDate: dateOrNull,

  // Document URLs
  tradeLicencePicUrl: strOrNull,
  shopPicUrl: strOrNull,
  dealerPicUrl: strOrNull,
  blankChequePicUrl: strOrNull,
  partnershipDeedPicUrl: strOrNull,

  // Geofence (not part of DB, just for Radar)
  radius: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(10).max(10000).optional()),
}).strict(); // Use .strict() to catch extra fields

function createAutoCRUD(
  app: Express,
  config: { endpoint: string; table: typeof dealers; tableName: string }
) {
  const { endpoint, table, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      if (!process.env.RADAR_SECRET_KEY) {
        return res.status(500).json({ success: false, error: 'RADAR_SECRET_KEY is not configured on the server' });
      }

      // 1) Validate & coerce input
      const input = dealerInputSchema.parse(req.body);

      // Require lat/lng for geofence
      if (input.latitude == null || input.longitude == null) {
        return res.status(400).json({
          success: false,
          error: 'latitude and longitude are required to create the geofence',
          details: [{ field: 'latitude', message: 'Required' }, { field: 'longitude', message: 'Required' }]
        });
      }

      // 2) Map to DB insert object
      // --- ✅ FIXED: Convert numbers/Dates to strings for Drizzle ---
      const finalData: Omit<DealerInsert, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: input.userId ?? null,
        type: input.type,
        parentDealerId: input.parentDealerId ?? null,
        name: input.name,
        region: input.region,
        area: input.area,
        phoneNo: input.phoneNo,
        address: input.address,
        pinCode: input.pinCode ?? null,

        latitude: String(input.latitude!),
        longitude: String(input.longitude!),

        dateOfBirth: toDateOnlyString(input.dateOfBirth),
        anniversaryDate: toDateOnlyString(input.anniversaryDate),

        totalPotential: String(input.totalPotential),
        bestPotential: String(input.bestPotential),
        brandSelling: input.brandSelling,

        feedbacks: input.feedbacks,
        remarks: input.remarks ?? null,

        // --- ADDED FOR PRISMA PARITY ---
        dealerDevelopmentStatus: input.dealerDevelopmentStatus ?? null,
        dealerDevelopmentObstacle: input.dealerDevelopmentObstacle ?? null,
        salesGrowthPercentage: input.salesGrowthPercentage ? String(input.salesGrowthPercentage) : null,
        noOfPJP: input.noOfPJP ?? null,
        // -----------------------------

        verificationStatus: input.verificationStatus ?? 'PENDING',
        whatsappNo: input.whatsappNo ?? null,
        emailId: input.emailId ?? null,
        businessType: input.businessType ?? null,

        // --- ✅ NEW FIELDS ADDED ---
        nameOfFirm: input.nameOfFirm ?? null,
        underSalesPromoterName: input.underSalesPromoterName ?? null,
        // --- END NEW FIELDS ---

        gstinNo: input.gstinNo ?? null,
        panNo: input.panNo ?? null,
        tradeLicNo: input.tradeLicNo ?? null,
        aadharNo: input.aadharNo ?? null,

        // Godown
        godownSizeSqFt: input.godownSizeSqFt ?? null,
        godownCapacityMTBags: input.godownCapacityMTBags ?? null,
        godownAddressLine: input.godownAddressLine ?? null,
        godownLandMark: input.godownLandMark ?? null,
        godownDistrict: input.godownDistrict ?? null,
        godownArea: input.godownArea ?? null,
        godownRegion: input.godownRegion ?? null,
        godownPinCode: input.godownPinCode ?? null,

        // Residential
        residentialAddressLine: input.residentialAddressLine ?? null,
        residentialLandMark: input.residentialLandMark ?? null,
        residentialDistrict: input.residentialDistrict ?? null,
        residentialArea: input.residentialArea ?? null,
        residentialRegion: input.residentialRegion ?? null,
        residentialPinCode: input.residentialPinCode ?? null,

        // Bank
        bankAccountName: input.bankAccountName ?? null,
        bankName: input.bankName ?? null,
        bankBranchAddress: input.bankBranchAddress ?? null,
        bankAccountNumber: input.bankAccountNumber ?? null,
        bankIfscCode: input.bankIfscCode ?? null,

        // Sales & promoter
        brandName: input.brandName ?? null,
        monthlySaleMT: input.monthlySaleMT ? String(input.monthlySaleMT) : null,
        noOfDealers: input.noOfDealers ?? null,
        areaCovered: input.areaCovered ?? null,
        projectedMonthlySalesBestCementMT: input.projectedMonthlySalesBestCementMT 
          ? String(input.projectedMonthlySalesBestCementMT) 
          : null,
        noOfEmployeesInSales: input.noOfEmployeesInSales ?? null,

        // Declaration
        declarationName: input.declarationName ?? null,
        declarationPlace: input.declarationPlace ?? null,
        declarationDate: toDateOnlyString(input.declarationDate),

        // Docs
        tradeLicencePicUrl: input.tradeLicencePicUrl ?? null,
        shopPicUrl: input.shopPicUrl ?? null,
        dealerPicUrl: input.dealerPicUrl ?? null,
        blankChequePicUrl: input.blankChequePicUrl ?? null,
        partnershipDeedPicUrl: input.partnershipDeedPicUrl ?? null,
      };

      // 3) Insert (need ID for Radar externalId)
      // Use app-generated UUID
      const dealerId = randomUUID();
      const [dealer] = await db
        .insert(table)
        .values({ ...finalData, id: dealerId })
        .returning();

      // 4) Radar upsert
      const tag = 'dealer';
      const externalId = `dealer:${dealer.id}`;
      const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;

      const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
      const radius = input.radius ?? 25; // Default 25m radius

      const form = new URLSearchParams();
      form.set('description', description);
      form.set('type', 'circle');
      form.set('coordinates', JSON.stringify([dealer.longitude, dealer.latitude])); // [lng, lat]
      form.set('radius', String(radius));

      const metadata: Record<string, any> = {
        dealerId: dealer.id,
        userId: dealer.userId,
        region: dealer.region,
        area: dealer.area,
        phoneNo: dealer.phoneNo,
        verificationStatus: dealer.verificationStatus,
      };
      Object.keys(metadata).forEach(k => metadata[k] == null && delete metadata[k]);
      if (Object.keys(metadata).length) form.set('metadata', JSON.stringify(metadata));

      const upRes = await fetch(radarUrl, {
        method: 'PUT',
        headers: {
          Authorization: process.env.RADAR_SECRET_KEY as string,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });

      const upJson = await upRes.json().catch(() => ({} as any));
      if (!upRes.ok || upJson?.meta?.code !== 200 || !upJson?.geofence) {
        // --- Rollback DB insert on Radar failure ---
        await db.delete(table).where(eq(table.id, dealer.id)); 
        return res.status(502).json({ // 502 Bad Gateway
          success: false,
          error: upJson?.meta?.message || upJson?.message || 'Failed to upsert dealer geofence in Radar',
          details: 'Database insert was rolled back.'
        });
      }

      // 5) OK
      return res.status(201).json({
        success: true,
        data: dealer, 
        message: `${tableName} created and geofence upserted`,
        geofenceRef: {
          id: upJson.geofence._id,
          tag: upJson.geofence.tag,
          externalId: upJson.geofence.externalId,
          radiusMeters: upJson.geofence.geometryRadius ?? radius,
        },
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
          })) 
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

export default function setupDealersPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealers',
    table: dealers,
    tableName: 'Dealer',
  });
  console.log('✅ Dealers POST endpoint with Radar geofence ready (empty-string→null safe)');
}
