// server/src/routes/geoTrackingRoutes/geoTracking.ts
// All endpoints (GET, POST, PATCH) for managing geo-tracking data.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { geoTracking, insertGeoTrackingSchema } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import crypto from "crypto";

// Create a partial schema for PATCH validation. This allows any subset of fields to be updated.
const geoTrackingUpdateSchema = insertGeoTrackingSchema.partial();

export default function setupGeoTrackingRoutes(app: Express) {

  // -------------------------
  // GET Endpoints
  // -------------------------

  // GET all tracking points for a specific user, ordered by most recent
  app.get('/api/geotracking/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID.' });
      }
      
      const records = await db.select()
        .from(geoTracking)
        .where(eq(geoTracking.userId, userId))
        .orderBy(desc(geoTracking.recordedAt));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error('Get Geo-tracking by User ID error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch tracking data.' });
    }
  });

  // GET all tracking points for a specific journey, ordered by time
  app.get('/api/geotracking/journey/:journeyId', async (req: Request, res: Response) => {
    try {
      const { journeyId } = req.params;
      
      const records = await db.select()
        .from(geoTracking)
        .where(eq(geoTracking.journeyId, journeyId))
        .orderBy(desc(geoTracking.recordedAt));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error('Get Geo-tracking by Journey ID error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch journey data.' });
    }
  });

  // -------------------------
  // POST Endpoint
  // -------------------------

  // POST a new tracking data point (the main endpoint for the mobile app)
app.post('/api/geotracking', async (req: Request, res: Response) => {
  try {
    // 0) Defensive deep clone of incoming body
    const incomingRaw = JSON.parse(JSON.stringify(req.body || {})) as Record<string, any>;

    // 1) Remove any id/uuid keys ASAP so schema won't reintroduce them
    for (const badKey of ['id', 'ID', 'Id', '_id', 'uuid', 'UUID', 'Uuid']) {
      if (badKey in incomingRaw) delete incomingRaw[badKey];
    }

    // 2) Coerce numeric fields to strings if your Zod expects strings.
    //    This handles both camelCase and snake_case variants.
    const COERCE_TO_STRING_KEYS = [
      'latitude', 'longitude',
      'dest_lat', 'dest_lng',
      'destLat', 'destLng',
      'total_distance_travelled', 'totalDistanceTravelled',
      'latitude_str', 'longitude_str' // in case weird keys exist
    ];

    for (const key of COERCE_TO_STRING_KEYS) {
      if (key in incomingRaw && typeof incomingRaw[key] === 'number') {
        // convert number -> string (preserve precision)
        incomingRaw[key] = incomingRaw[key].toString();
      }
      // also convert numeric strings like "40.7127" left intact; we only convert numbers
    }

    // 3) Validate with Zod on the coerced payload
    const parsed = insertGeoTrackingSchema.safeParse(incomingRaw);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid body', details: parsed.error.flatten() });
    }
    const data = parsed.data as Record<string, any>;

    // 4) Map/normalize to Drizzle keys exactly (and set id + timestamps)
    const now = new Date();
    const payload: Record<string, any> = {
      id: crypto.randomUUID(),
      userId: data.userId ?? data.user_id,
      latitude: typeof data.latitude === 'string' ? Number(data.latitude) : (data.latitude ?? (data.lat ? Number(data.lat) : undefined)),
      longitude: typeof data.longitude === 'string' ? Number(data.longitude) : (data.longitude ?? (data.lng ? Number(data.lng) : undefined)),
      recordedAt: data.recorded_at ? new Date(data.recorded_at) : now,
      locationType: data.location_type ?? data.locationType,
      appState: data.app_state ?? data.appState,
      totalDistanceTravelled: data.total_distance_travelled ?? data.totalDistanceTravelled,
      journeyId: data.journey_id ?? data.journeyId ?? data.journey,
      isActive: typeof data.is_active === 'boolean' ? data.is_active : (typeof data.isActive === 'boolean' ? data.isActive : true),
      destLat: data.dest_lat ?? data.destLat,
      destLng: data.dest_lng ?? data.destLng,
      createdAt: now,
      updatedAt: now,
    };

    // 5) Clean payload: remove undefined/null/empty-string so ORM doesn't insert explicit NULLs
    for (const k of Object.keys(payload)) {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    }

    console.log('🔁 FINAL INSERT PAYLOAD:', payload);

    // 6) Insert and return row
    const [inserted] = await db.insert(geoTracking).values(payload).returning();
    return res.status(201).json({ success: true, data: inserted });
  } catch (err: any) {
    if (err?.issues) { // just in case zod error slipped through
      return res.status(400).json({ success: false, error: 'Validation failed', details: err.issues });
    }
    console.error('[geotracking] error', err);
    return res.status(500).json({ success: false, error: 'Failed to create tracking point', details: err?.message ?? String(err) });
  }
});
  // -------------------------
  // PATCH Endpoint
  // -------------------------

  // PATCH an existing tracking record, e.g., to mark a journey as inactive
  app.patch('/api/geotracking/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const validatedData = geoTrackingUpdateSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update were provided.' });
      }

      const [existingRecord] = await db.select().from(geoTracking).where(eq(geoTracking.id, id)).limit(1);

      if (!existingRecord) {
        return res.status(404).json({ success: false, error: `Tracking record with ID '${id}' not found.` });
      }

      const [updatedRecord] = await db
        .update(geoTracking)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(geoTracking.id, id))
        .returning();

      res.json({ success: true, message: 'Tracking record updated successfully', data: updatedRecord });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error('Update Geo-tracking error:', error);
      res.status(500).json({ success: false, error: 'Failed to update tracking record.' });
    }
  });

  console.log('✅ Geo-Tracking GET, POST, and PATCH endpoints setup complete');
}
