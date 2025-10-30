// server/src/routes/updateRoutes/dealers.ts
// --- FULLY REBUILT ---
// Endpoint for partially updating a dealer and its Radar geofence.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// -------- Import helpers & schema from POST route --------
// (Assuming POST route is in ../postRoutes/dealers.ts and helpers are exported)
// For simplicity, we'll redefine the core helpers and schema here.

const strOrNull = z.preprocess((val) => {
  if (val === '') return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return val;
}, z.string().nullable().optional());

const dateOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  try { return new Date(String(val)); } catch { return null; }
}, z.date().nullable().optional());

const numOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z.number().nullable().optional());

const intOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z.number().int().nullable().optional());

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') { const t = v.trim(); if (!t) return []; return t.includes(',') ? t.split(',').map(s => s.trim()).filter(Boolean) : [t]; }
  return [];
};

const toDateOnlyString = (d: Date | null | undefined): string | null => {
  if (!d) return null;
  try { return d.toISOString().slice(0, 10); } catch { return null; }
};

// --- Base schema (mirrors POST) ---
const dealerBaseSchema = z.object({
  userId: intOrNull,
  type: z.string().min(1),
  parentDealerId: strOrNull,
  name: z.string().min(1),
  region: z.string().min(1),
  area: z.string().min(1),
  phoneNo: z.string().min(1),
  address: z.string().min(1),
  pinCode: strOrNull,
  latitude: numOrNull,
  longitude: numOrNull,
  dateOfBirth: dateOrNull,
  anniversaryDate: dateOrNull,
  totalPotential: z.coerce.number(),
  bestPotential: z.coerce.number(),
  brandSelling: z.preprocess(toStringArray, z.array(z.string()).min(1)),
  feedbacks: z.string().min(1),
  remarks: strOrNull,
  dealerDevelopmentStatus: strOrNull,
  dealerDevelopmentObstacle: strOrNull,
  salesGrowthPercentage: numOrNull,
  noOfPJP: intOrNull,
  verificationStatus: z.enum(['PENDING', 'VERIFIED']).optional(),
  whatsappNo: strOrNull,
  emailId: z.preprocess((val) => (val === '' ? null : val), z.string().email().nullable().optional()),
  businessType: strOrNull,
  gstinNo: strOrNull,
  panNo: strOrNull,
  tradeLicNo: strOrNull,
  aadharNo: strOrNull,
  godownSizeSqFt: intOrNull,
  godownCapacityMTBags: strOrNull,
  godownAddressLine: strOrNull,
  godownLandMark: strOrNull,
  godownDistrict: strOrNull,
  godownArea: strOrNull,
  godownRegion: strOrNull,
  godownPinCode: strOrNull,
  residentialAddressLine: strOrNull,
  residentialLandMark: strOrNull,
  residentialDistrict: strOrNull,
  residentialArea: strOrNull,
  residentialRegion: strOrNull,
  residentialPinCode: strOrNull,
  bankAccountName: strOrNull,
  bankName: strOrNull,
  bankBranchAddress: strOrNull,
  bankAccountNumber: strOrNull,
  bankIfscCode: strOrNull,
  brandName: strOrNull,
  monthlySaleMT: numOrNull,
  noOfDealers: intOrNull,
  areaCovered: strOrNull,
  projectedMonthlySalesBestCementMT: numOrNull,
  noOfEmployeesInSales: intOrNull,
  declarationName: strOrNull,
  declarationPlace: strOrNull,
  declarationDate: dateOrNull,
  tradeLicencePicUrl: strOrNull,
  shopPicUrl: strOrNull,
  dealerPicUrl: strOrNull,
  blankChequePicUrl: strOrNull,
  partnershipDeedPicUrl: strOrNull,
});

// --- ✅ USE THE CORRECT PARTIAL SCHEMA ---
const dealerUpdateSchema = dealerBaseSchema.partial().extend({
  // Geofence radius
  radius: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(10).max(10000).optional()),
}).strict();

type DealerUpdateInput = z.infer<typeof dealerUpdateSchema>;

// --- Radar Upsert Helper ---
async function upsertRadarGeofence(dealer: typeof dealers.$inferSelect, radius?: number) {
  if (!process.env.RADAR_SECRET_KEY) {
    throw new Error('RADAR_SECRET_KEY is not configured');
  }
  if (!dealer.latitude || !dealer.longitude) {
    throw new Error('Dealer latitude/longitude missing for geofence update');
  }

  const tag = 'dealer';
  const externalId = `dealer:${dealer.id}`;
  const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;

  const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
  const finalRadius = radius ?? 25; // Default 25m

  const form = new URLSearchParams();
  form.set('description', description);
  form.set('type', 'circle');
  form.set('coordinates', JSON.stringify([dealer.longitude, dealer.latitude])); // [lng, lat]
  form.set('radius', String(finalRadius));

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
     throw new Error(upJson?.meta?.message || upJson?.message || 'Failed to upsert dealer geofence in Radar');
  }
  return upJson.geofence;
}

// --- Route ---
export default function setupDealersPatchRoutes(app: Express) {
  
  app.patch('/api/dealers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate the incoming data
      const input: DealerUpdateInput = dealerUpdateSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      // 2. Check if the dealer exists
      const [existingDealer] = await db.select().from(dealers).where(eq(dealers.id, id)).limit(1);

      if (!existingDealer) {
        return res.status(404).json({ success: false, error: `Dealer with ID '${id}' not found.` });
      }

      // 3. Build the patch object, converting types as needed
      const patch: any = {};

      // --- ✅ Manually build patch to handle string conversions ---
      if (input.userId !== undefined) patch.userId = input.userId;
      if (input.type !== undefined) patch.type = input.type;
      if (input.parentDealerId !== undefined) patch.parentDealerId = input.parentDealerId;
      if (input.name !== undefined) patch.name = input.name;
      if (input.region !== undefined) patch.region = input.region;
      if (input.area !== undefined) patch.area = input.area;
      if (input.phoneNo !== undefined) patch.phoneNo = input.phoneNo;
      if (input.address !== undefined) patch.address = input.address;
      if (input.pinCode !== undefined) patch.pinCode = input.pinCode;
      if (input.latitude !== undefined) patch.latitude = String(input.latitude);
      if (input.longitude !== undefined) patch.longitude = String(input.longitude);
      if (input.dateOfBirth !== undefined) patch.dateOfBirth = toDateOnlyString(input.dateOfBirth);
      if (input.anniversaryDate !== undefined) patch.anniversaryDate = toDateOnlyString(input.anniversaryDate);
      if (input.totalPotential !== undefined) patch.totalPotential = String(input.totalPotential);
      if (input.bestPotential !== undefined) patch.bestPotential = String(input.bestPotential);
      if (input.brandSelling !== undefined) patch.brandSelling = input.brandSelling;
      if (input.feedbacks !== undefined) patch.feedbacks = input.feedbacks;
      if (input.remarks !== undefined) patch.remarks = input.remarks;
      if (input.dealerDevelopmentStatus !== undefined) patch.dealerDevelopmentStatus = input.dealerDevelopmentStatus;
      if (input.dealerDevelopmentObstacle !== undefined) patch.dealerDevelopmentObstacle = input.dealerDevelopmentObstacle;
      if (input.salesGrowthPercentage !== undefined) patch.salesGrowthPercentage = input.salesGrowthPercentage ? String(input.salesGrowthPercentage) : null;
      if (input.noOfPJP !== undefined) patch.noOfPJP = input.noOfPJP;
      if (input.verificationStatus !== undefined) patch.verificationStatus = input.verificationStatus;
      if (input.whatsappNo !== undefined) patch.whatsappNo = input.whatsappNo;
      if (input.emailId !== undefined) patch.emailId = input.emailId;
      if (input.businessType !== undefined) patch.businessType = input.businessType;
      if (input.gstinNo !== undefined) patch.gstinNo = input.gstinNo;
      if (input.panNo !== undefined) patch.panNo = input.panNo;
      if (input.tradeLicNo !== undefined) patch.tradeLicNo = input.tradeLicNo;
      if (input.aadharNo !== undefined) patch.aadharNo = input.aadharNo;
      if (input.godownSizeSqFt !== undefined) patch.godownSizeSqFt = input.godownSizeSqFt;
      if (input.godownCapacityMTBags !== undefined) patch.godownCapacityMTBags = input.godownCapacityMTBags;
      if (input.godownAddressLine !== undefined) patch.godownAddressLine = input.godownAddressLine;
      if (input.godownLandMark !== undefined) patch.godownLandMark = input.godownLandMark;
      if (input.godownDistrict !== undefined) patch.godownDistrict = input.godownDistrict;
      if (input.godownArea !== undefined) patch.godownArea = input.godownArea;
      if (input.godownRegion !== undefined) patch.godownRegion = input.godownRegion;
      if (input.godownPinCode !== undefined) patch.godownPinCode = input.godownPinCode;
      if (input.residentialAddressLine !== undefined) patch.residentialAddressLine = input.residentialAddressLine;
      if (input.residentialLandMark !== undefined) patch.residentialLandMark = input.residentialLandMark;
      if (input.residentialDistrict !== undefined) patch.residentialDistrict = input.residentialDistrict;
      if (input.residentialArea !== undefined) patch.residentialArea = input.residentialArea;
      if (input.residentialRegion !== undefined) patch.residentialRegion = input.residentialRegion;
      if (input.residentialPinCode !== undefined) patch.residentialPinCode = input.residentialPinCode;
      if (input.bankAccountName !== undefined) patch.bankAccountName = input.bankAccountName;
      if (input.bankName !== undefined) patch.bankName = input.bankName;
      if (input.bankBranchAddress !== undefined) patch.bankBranchAddress = input.bankBranchAddress;
      if (input.bankAccountNumber !== undefined) patch.bankAccountNumber = input.bankAccountNumber;
      if (input.bankIfscCode !== undefined) patch.bankIfscCode = input.bankIfscCode;
      if (input.brandName !== undefined) patch.brandName = input.brandName;
      if (input.monthlySaleMT !== undefined) patch.monthlySaleMT = input.monthlySaleMT ? String(input.monthlySaleMT) : null;
      if (input.noOfDealers !== undefined) patch.noOfDealers = input.noOfDealers;
      if (input.areaCovered !== undefined) patch.areaCovered = input.areaCovered;
      if (input.projectedMonthlySalesBestCementMT !== undefined) patch.projectedMonthlySalesBestCementMT = input.projectedMonthlySalesBestCementMT ? String(input.projectedMonthlySalesBestCementMT) : null;
      if (input.noOfEmployeesInSales !== undefined) patch.noOfEmployeesInSales = input.noOfEmployeesInSales;
      if (input.declarationName !== undefined) patch.declarationName = input.declarationName;
      if (input.declarationPlace !== undefined) patch.declarationPlace = input.declarationPlace;
      if (input.declarationDate !== undefined) patch.declarationDate = toDateOnlyString(input.declarationDate);
      if (input.tradeLicencePicUrl !== undefined) patch.tradeLicencePicUrl = input.tradeLicencePicUrl;
      if (input.shopPicUrl !== undefined) patch.shopPicUrl = input.shopPicUrl;
      if (input.dealerPicUrl !== undefined) patch.dealerPicUrl = input.dealerPicUrl;
      if (input.blankChequePicUrl !== undefined) patch.blankChequePicUrl = input.blankChequePicUrl;
      if (input.partnershipDeedPicUrl !== undefined) patch.partnershipDeedPicUrl = input.partnershipDeedPicUrl;

      // --- ✅ 4. Check if Radar Geofence needs update ---
      const radarUpdateNeeded = 
        input.latitude !== undefined || 
        input.longitude !== undefined || 
        input.name !== undefined ||
        input.radius !== undefined;

      let geofenceRef: any = undefined;

      if (radarUpdateNeeded) {
        // Prepare the 'next version' of the dealer object for Radar
        const updatedDealerForRadar = {
          ...existingDealer,
          ...patch, // Apply string-converted values
          // Ensure lat/lng are correct for Radar (it needs numbers, but patch has strings)
          latitude: input.latitude ?? Number(existingDealer.latitude),
          longitude: input.longitude ?? Number(existingDealer.longitude),
        };
        
        try {
          geofenceRef = await upsertRadarGeofence(updatedDealerForRadar, input.radius);
        } catch (radarError: any) {
          return res.status(502).json({
            success: false,
            error: 'Failed to update Radar geofence',
            details: (radarError as Error)?.message ?? 'Unknown Radar error',
          });
        }
      }

      // --- 5. Perform the DB update ---
      patch.updatedAt = new Date(); // Always touch updatedAt
      
      const [updatedDealer] = await db
        .update(dealers)
        .set(patch)
        .where(eq(dealers.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Dealer updated successfully',
        data: updatedDealer,
        geofenceRef: geofenceRef ? {
          id: geofenceRef._id,
          tag: geofenceRef.tag,
          externalId: geofenceRef.externalId,
        } : 'not_updated',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      
      console.error('Update Dealer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update dealer',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ Dealers PATCH endpoints + Radar update logic setup complete');
}