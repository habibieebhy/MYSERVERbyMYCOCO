// server/src/routes/postRoutes/dealers.ts
// Dealers POST endpoint (create + Radar geofence) with robust empty-string/null coercion

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers } from '../../db/schema';
import { z } from 'zod';
import { InferInsertModel, eq } from 'drizzle-orm';

type DealerInsert = InferInsertModel<typeof dealers>;

// -------- helpers --------
const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return [];
    return t.includes(',') ? t.split(',').map(s => s.trim()).filter(Boolean) : [t];
  }
  return [];
};

// empty string -> null for strings
const strOrNull = z.preprocess((val) => {
  if (val === '') return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return val;
}, z.string().nullable().optional());

// empty string -> null for dates (and coerce)
const dateOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return val;
}, z.coerce.date().nullable().optional());

// number (coerced) nullable, empty string -> null
const numOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return val;
}, z.coerce.number().nullable().optional());

// int (coerced) nullable
const intOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return val;
}, z.coerce.number().int().nullable().optional());

// -------- input schema (coercing everything safely) --------
const dealerInputSchema = z.object({
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

  totalPotential: z.coerce.number(),
  bestPotential: z.coerce.number(),
  brandSelling: z.preprocess(toStringArray, z.array(z.string()).default([])),

  feedbacks: z.string().min(1),
  remarks: strOrNull,

  verificationStatus: z.enum(['PENDING', 'VERIFIED']).optional(),

  // IDs & contacts
  whatsappNo: strOrNull,
  emailId: z.preprocess((val) => (val === '' ? null : val), z.string().email().nullable().optional()).or(z.literal(undefined)),
  businessType: strOrNull,
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

  // Geofence
  radius: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(10).max(10000).optional()),
});

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
        });
      }

      // 2) Map to DB insert object
      const now = new Date();
      const finalData: DealerInsert = {
        userId: input.userId ?? null,
        type: input.type,
        parentDealerId: input.parentDealerId ?? null,
        name: input.name,
        region: input.region,
        area: input.area,
        phoneNo: input.phoneNo,
        address: input.address,
        pinCode: input.pinCode ?? null,

        latitude: input.latitude!,
        longitude: input.longitude!,

        dateOfBirth: input.dateOfBirth ?? null,
        anniversaryDate: input.anniversaryDate ?? null,

        totalPotential: input.totalPotential,
        bestPotential: input.bestPotential,
        brandSelling: input.brandSelling,

        feedbacks: input.feedbacks,
        remarks: input.remarks ?? null,

        verificationStatus: input.verificationStatus ?? 'PENDING',
        whatsappNo: input.whatsappNo ?? null,
        emailId: (input as any).emailId ?? null,
        businessType: input.businessType ?? null,
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
        monthlySaleMT: input.monthlySaleMT ?? null,
        noOfDealers: input.noOfDealers ?? null,
        areaCovered: input.areaCovered ?? null,
        projectedMonthlySalesBestCementMT: input.projectedMonthlySalesBestCementMT ?? null,
        noOfEmployeesInSales: input.noOfEmployeesInSales ?? null,

        // Declaration
        declarationName: input.declarationName ?? null,
        declarationPlace: input.declarationPlace ?? null,
        declarationDate: input.declarationDate ?? null,

        // Docs
        tradeLicencePicUrl: input.tradeLicencePicUrl ?? null,
        shopPicUrl: input.shopPicUrl ?? null,
        dealerPicUrl: input.dealerPicUrl ?? null,
        blankChequePicUrl: input.blankChequePicUrl ?? null,
        partnershipDeedPicUrl: input.partnershipDeedPicUrl ?? null,

        createdAt: now as any,
        updatedAt: now as any,
      };

      // 3) Insert (need ID for Radar externalId)
      const [dealer] = await db.insert(table).values(finalData).returning();

      // 4) Radar upsert
      const tag = 'dealer';
      const externalId = `dealer:${dealer.id}`;
      const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;

      const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
      const radius = input.radius ?? 25;

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
        await db.delete(table).where(eq(table.id, dealer.id)); // rollback
        return res.status(400).json({
          success: false,
          error: upJson?.meta?.message || upJson?.message || 'Failed to upsert dealer geofence in Radar',
        });
      }

      // 5) OK
      return res.json({
        success: true,
        data: dealer, // includes verificationStatus
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
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
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
