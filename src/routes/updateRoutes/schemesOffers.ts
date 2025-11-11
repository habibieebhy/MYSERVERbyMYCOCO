// server/src/routes/updateRoutes/schemesOffers.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { schemesOffers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// -------- Helpers (from previous routes) --------

// empty string -> null for strings
const strOrNull = z.preprocess((val) => {
  if (val === '' || val === undefined) return null;
  if (val === null) return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return val;
}, z.string().nullable().optional());

// empty string -> null for dates (and coerce)
const dateOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  try {
    const d = new Date(String(val));
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}, z.date().nullable().optional());

// -------- Base Schema --------

// This defines the structure of a complete Scheme/Offer record
const schemeOfferBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: strOrNull.optional(), // Make optional here to allow PATCH to omit it
  startDate: dateOrNull.optional(),
  endDate: dateOrNull.optional(),
});

// -------- PATCH Schema (Partial Update) --------

// Allows only a subset of fields to be updated. All fields are optional.
const schemeOfferPatchSchema = schemeOfferBaseSchema.partial().strict();

// -------- PUT Schema (Full Replacement) --------

// All fields are required to be present for a full replacement (PUT).
// We must un-optionalize the base schema fields by combining them with a
// non-optional version, but keep the coercing helpers.
const schemeOfferPutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: strOrNull.transform(val => val ?? null), // Transform to null if missing/empty string
  startDate: dateOrNull.transform(val => val ?? null),
  endDate: dateOrNull.transform(val => val ?? null),
}).strict();

// -------- Route Setup --------

export default function setupSchemesOffersPatchRoutes(app: Express) {
  
  const tableName = 'Scheme/Offer';

  /**
   * PATCH route for partial update
   */
  app.patch('/api/schemes-offers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Scheme ID format. Expected UUID.' });
      }

      // 1. Validate the incoming data against the partial schema
      const validatedData = schemeOfferPatchSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update were provided.' });
      }

      // 2. Check if the record exists
      const [existingRecord] = await db.select({ id: schemesOffers.id })
        .from(schemesOffers)
        .where(eq(schemesOffers.id, id))
        .limit(1);

      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }

      // 3. Perform the update
      const [updatedRecord] = await db
        .update(schemesOffers)
        .set(validatedData)
        .where(eq(schemesOffers.id, id))
        .returning();

      return res.json({
        success: true,
        message: `${tableName} updated successfully (PATCH)`,
        data: updatedRecord,
      });

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: err.issues });
      }
      console.error(`PATCH ${tableName} error:`, err);
      return res.status(500).json({ success: false, error: `Failed to update ${tableName}`, details: err?.message ?? 'Unknown error' });
    }
  });


  /**
   * PUT route for full replacement
   */
  app.put('/api/schemes-offers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Scheme ID format. Expected UUID.' });
      }

      // 1. Validate the incoming data against the full replacement schema
      const validatedData = schemeOfferPutSchema.parse(req.body);

      // 2. Check if the record exists
      const [existingRecord] = await db.select({ id: schemesOffers.id })
        .from(schemesOffers)
        .where(eq(schemesOffers.id, id))
        .limit(1);

      if (!existingRecord) {
        // According to REST principles, PUT should usually create if it doesn't exist,
        // but for a simple CRUD endpoint, 404 is often preferred if the client
        // is expected to know the ID for an update. We will return 404 here.
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found for replacement.` });
      }

      // 3. Perform the full replacement update
      const [updatedRecord] = await db
        .update(schemesOffers)
        .set(validatedData)
        .where(eq(schemesOffers.id, id))
        .returning();

      return res.json({
        success: true,
        message: `${tableName} replaced successfully (PUT)`,
        data: updatedRecord,
      });

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: err.issues });
      }
      console.error(`PUT ${tableName} error:`, err);
      return res.status(500).json({ success: false, error: `Failed to replace ${tableName}`, details: err?.message ?? 'Unknown error' });
    }
  });

  console.log('✅ Schemes/Offers PATCH and PUT endpoints setup complete');
}