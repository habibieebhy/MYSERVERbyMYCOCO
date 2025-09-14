// server/src/routes/geoTrackingRoutes/geoTracking.ts
// All endpoints (GET, POST, PATCH) for managing geo-tracking data.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { geoTracking, insertGeoTrackingSchema } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

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
      // All fields are sent from the device, so we use the full insert schema
      const validatedData = insertGeoTrackingSchema.parse(req.body);

      const [newRecord] = await db.insert(geoTracking).values(validatedData).returning();

      res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error('Create Geo-tracking error:', error);
      res.status(500).json({ success: false, error: 'Failed to create tracking point.' });
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
