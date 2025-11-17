// server/src/routes/updateRoutes/technicalSites.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
// 🟢 NEW: Import table and schemas
import { technicalSites, insertTechnicalSiteSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// --- Helper Functions (Copied from dealers.ts for data type handling) ---

const strOrNull = z.preprocess((val) => {
  if (val === '' || val === undefined) return null;
  if (val === null) return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return String(val);
}, z.string().nullable().optional());

const dateOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}, z.date().nullable().optional());

const numOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z.number().nullable().optional());

const boolOrNull = z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    if (val === '' || val === null || val === undefined) return null;
    return undefined; // Let Zod handle if type is wrong
}, z.boolean().nullable().optional());

// --- Core Schema for Site Update (used by both PUT/PATCH) ---
// Note: This mirrors the structure of the InsertSchema but ensures date/numeric handling.
const technicalSiteBaseSchema = z.object({
  siteName: z.string().min(1).max(255).optional(),
  concernedPerson: z.string().min(1).max(255).optional(),
  phoneNo: z.string().min(1).max(20).optional(),
  address: strOrNull,
  latitude: numOrNull,
  longitude: numOrNull,
  siteType: strOrNull,
  area: strOrNull,
  region: strOrNull,

  keyPersonName: strOrNull,
  keyPersonPhoneNum: strOrNull,
  stageOfConstruction: strOrNull,
  
  // Dates are coerced to Date objects here, then converted back to string/Date in the handler
  constructionStartDate: dateOrNull,
  constructionEndDate: dateOrNull,
  firstVistDate: dateOrNull,
  lastVisitDate: dateOrNull,

  convertedSite: boolOrNull,
  needFollowUp: boolOrNull,

  // Foreign Keys (must be UUID string or null)
  relatedDealerID: strOrNull, // z.string().uuid().nullable().optional() equivalent
  relatedMasonpcID: strOrNull,
});

// --- Schema for PATCH (Partial Update) ---
const technicalSitePatchSchema = technicalSiteBaseSchema.partial().strict();

// --- Schema for PUT (Full Replacement) ---
const technicalSitePutSchema = technicalSiteBaseSchema.extend({
    // Make required fields mandatory for PUT operations
    siteName: z.string().min(1).max(255),
    concernedPerson: z.string().min(1).max(255),
    phoneNo: z.string().min(1).max(20),
});

// --- Date Conversion Helper (for Drizzle's `date` or `timestamp` columns) ---
const toDrizzleDateValue = (d: Date | null | undefined): Date | null => {
  if (!d) return null;
  // Drizzle expects a Date object for timestamp columns, or string for date columns.
  // For safety with Drizzle's `date` type, returning a Date object is standard for update operations.
  return d;
};


export default function setupTechnicalSitesUpdateRoutes(app: Express) {
  
  // ========================================
  // PATCH /api/technical-sites/:id (Partial Update)
  // ========================================
  app.patch('/api/technical-sites/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate incoming data against the PATCH schema (partial)
      const input = technicalSitePatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      // 2. Check if the site exists
      const [existingSite] = await db.select().from(technicalSites).where(eq(technicalSites.id, id)).limit(1);
      if (!existingSite) {
        return res.status(404).json({ success: false, error: `Technical Site with ID '${id}' not found.` });
      }

      // 3. Build patch object, converting Date fields explicitly
      const patch: Record<string, any> = {};

      Object.keys(input).forEach(key => {
        const value = input[key as keyof typeof input];
        
        // Handle date/timestamp fields (which come as Date objects from dateOrNull preprocessing)
        if (key.includes('Date')) {
            patch[key] = toDrizzleDateValue(value as Date | null | undefined);
        } else if (value !== undefined) {
            // Apply other fields (strings, numbers, booleans, FKs)
            patch[key] = value;
        }
      });
      
      // 4. Perform the update
      (patch as any).updatedAt = new Date();

      const [updatedSite] = await db
        .update(technicalSites)
        .set(patch)
        .where(eq(technicalSites.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'Technical Site updated successfully',
        data: updatedSite,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error('Update Technical Site error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update technical site',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });


  // ========================================
  // PUT /api/technical-sites/:id (Full Replacement)
  // ========================================
  app.put('/api/technical-sites/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate incoming data against the PUT schema (mandatory required fields)
      const input = technicalSitePutSchema.parse(req.body);

      // 2. Check if the site exists
      const [existingSite] = await db.select().from(technicalSites).where(eq(technicalSites.id, id)).limit(1);
      if (!existingSite) {
        return res.status(404).json({ success: false, error: `Technical Site with ID '${id}' not found.` });
      }

      // 3. Prepare full replacement object
      const updateData: Record<string, any> = {};

      Object.entries(input).forEach(([key, value]) => {
          // Convert date/timestamp fields explicitly
          if (key.includes('Date')) {
              updateData[key] = toDrizzleDateValue(value as Date | null | undefined);
          } else {
              updateData[key] = value;
          }
      });
      
      // 4. Perform the update
      updateData.updatedAt = new Date();
      updateData.id = id; // Ensure ID is preserved

      const [updatedSite] = await db
        .update(technicalSites)
        .set(updateData)
        .where(eq(technicalSites.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'Technical Site replaced successfully',
        data: updatedSite,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed for full replacement', details: error.issues });
      }
      console.error('PUT Technical Site error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to replace technical site',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ Technical Sites PATCH and PUT endpoints setup complete');
}