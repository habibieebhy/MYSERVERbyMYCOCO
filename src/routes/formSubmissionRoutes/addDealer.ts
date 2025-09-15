// server/src/routes/postRoutes/dealers.ts
// Dealers POST endpoints using createAutoCRUD patterns

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers, insertDealerSchema } from '../../db/schema';
import { z } from 'zod';
import { InferInsertModel, eq } from 'drizzle-orm';

// --- Define input schema with Zod (loosely typed to avoid infinite inference) ---
// export const insertDealerSchema = z.object({
//   userId: z.number().optional(),
//   type: z.string().min(1),
//   parentDealerId: z.string().optional().nullable(),
//   name: z.string().min(1),
//   region: z.string().min(1),
//   area: z.string().min(1),
//   phoneNo: z.string().min(1),
//   address: z.string().min(1),
//   pinCode: z.string().optional().nullable(),
//   latitude: z.number().optional().nullable(),
//   longitude: z.number().optional().nullable(),
//   dateOfBirth: z.string().optional().nullable(),
//   anniversaryDate: z.string().optional().nullable(),
//   totalPotential: z.number(),
//   bestPotential: z.number(),
//   brandSelling: z.array(z.string()),
//   feedbacks: z.string().min(1),
//   remarks: z.string().optional().nullable(),
// });

// Type for insert payload
type DealerInsert = InferInsertModel<typeof dealers>;

// Auto CRUD creator
function createAutoCRUD(
  app: Express,
  config: {
    endpoint: string;
    table: typeof dealers;
    schema: z.ZodSchema<any>;
    tableName: string;
    autoFields?: Record<string, () => any>;
  }
) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  // CREATE NEW RECORD
  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // Call all autoFields
      const autoValues = Object.fromEntries(
        Object.entries(autoFields).map(([k, fn]) => [k, fn()])
      );

      const finalData = schema.parse({
        ...req.body,
        ...autoValues,
      }) as DealerInsert;

      // Coordinates are NOT part of your dealers schema; read them from the raw body
      const raw = req.body as any;

      const lat = Number(
        raw.latitude ??
        raw.lat ??
        raw.locationLat ??
        raw.locationLatitude ??
        raw.location?.latitude
      );
      const lon = Number(
        raw.longitude ??
        raw.lng ??
        raw.lon ??
        raw.locationLng ??
        raw.locationLongitude ??
        raw.location?.longitude
      );

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({
          success: false,
          error: 'Dealer latitude and longitude are required (not stored in DB, used for geofence)'
        });
      }

      // Insert dealer first to get its UUID primary key
      const [dealer] = await db.insert(table).values(finalData).returning();

      // Build Radar PUT exactly like docs: PUT /v1/geofences/:tag/:externalId
      const tag = 'dealer';
      const externalId = `dealer:${dealer.id}`;
      const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;

      // Description: from dealers.name (schema), fallback to "Dealer <id>"
      const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);

      // Radius: allow client override in body, clamp to [10, 10000]; default 25m
      const radius = Math.min(10000, Math.max(10, Number(raw.radius ?? 25)));

      // Form-encoded body per Radar sample
      const form = new URLSearchParams();
      form.set('description', description);
      form.set('type', 'circle');
      form.set('coordinates', JSON.stringify([lon, lat])); // [longitude, latitude]
      form.set('radius', String(radius));

      // Optional metadata (must be string/number/boolean)
      const metadata: Record<string, any> = {
        dealerId: dealer.id,
        userId: dealer.userId,
        region: dealer.region,
        area: dealer.area,
        phoneNo: dealer.phoneNo
      };
      Object.keys(metadata).forEach(k => metadata[k] == null && delete metadata[k]);
      if (Object.keys(metadata).length) {
        form.set('metadata', JSON.stringify(metadata));
      }

      // PUT to Radar with your SECRET key
      const upRes = await fetch(radarUrl, {
        method: 'PUT',
        headers: {
          Authorization: process.env.RADAR_SECRET_KEY as string,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form.toString()
      });
      const upJson = await upRes.json().catch(() => ({} as any));

      if (!upRes.ok || upJson?.meta?.code !== 200 || !upJson?.geofence) {
        // Roll back the dealer insert if Radar failed
        await db.delete(table).where(eq(table.id, dealer.id));
        return res.status(400).json({
          success: false,
          error: upJson?.meta?.message || upJson?.message || 'Failed to upsert dealer geofence in Radar'
        });
      }

      // If you later add columns (radarGeofenceId/tag/externalId) this patch will auto-fill them:
      try {
        if (table.radarGeofenceId || table.radarTag || table.radarExternalId) {
          const patch: any = {};
          if (table.radarGeofenceId) patch.radarGeofenceId = upJson.geofence._id;
          if (table.radarTag) patch.radarTag = upJson.geofence.tag;
          if (table.radarExternalId) patch.radarExternalId = upJson.geofence.externalId;
          if (Object.keys(patch).length) {
            await db.update(table).set(patch).where(eq(table.id, dealer.id));
          }
        }
      } catch { /* ignore if those columns don't exist */ }

      // Success
      return res.json({
        success: true,
        data: dealer,
        message: `${tableName} created and geofence upserted`,
        geofenceRef: {
          id: upJson.geofence._id,
          tag: upJson.geofence.tag,
          externalId: upJson.geofence.externalId,
          radiusMeters: upJson.geofence.geometryRadius ?? radius
        }
      });

    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Setup dealer routes
export default function setupDealersPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealers',
    table: dealers,
    schema: insertDealerSchema,
    tableName: 'Dealer',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date(),
    },
  });

  console.log('✅ Dealers POST endpoints setup complete');
}