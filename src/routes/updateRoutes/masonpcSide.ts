// src/routes/updateRoutes/masonpcSide.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonPcSide } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// -------- Helpers --------

// empty string -> null for strings
export const strOrNull = z.preprocess((val) => {
  if (val === '') return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return val;
}, z.string().nullable().optional());

// int (coerced) nullable, empty string -> null
export const intOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z.number().int().nullable().optional());

// -------- Input Schema --------

// Base schema matching the POST route, to create a partial from.
const masonBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  kycDocumentName: strOrNull,
  kycDocumentIdNum: strOrNull,
  verificationStatus: strOrNull,
  bagsLifted: intOrNull,
  pointsGained: intOrNull,
  isReferred: z.boolean().nullable().optional(),
  referredByUser: strOrNull,
  referredToUser: strOrNull,
  dealerId: strOrNull, // Foreign key
  userId: intOrNull,    // Foreign key
});

// Create a partial schema for validation. This allows any subset of fields to be sent.
// .strict() ensures no extra fields are passed.
const masonUpdateSchema = masonBaseSchema.partial().strict();

export default function setupMasonPcSidePatchRoutes(app: Express) {
  
  // PATCH /api/masons/:id
  app.patch('/api/masons/:id', async (req: Request, res: Response) => {
    const tableName = 'Mason';
    try {
      // 1. Validate the ID
      const { id } = req.params;
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Mason ID format. Expected UUID.' });
      }
      
      // 2. Validate the incoming data against the partial schema
      const validatedData = masonUpdateSchema.parse(req.body);

      // If the body is empty, there's nothing to update.
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update were provided.',
        });
      }

      // 3. Check if the mason exists before trying to update
      const [existingMason] = await db.select({ id: masonPcSide.id })
        .from(masonPcSide)
        .where(eq(masonPcSide.id, id))
        .limit(1);

      if (!existingMason) {
        return res.status(404).json({
          success: false,
          error: `Mason with ID '${id}' not found.`,
        });
      }

      // 4. Perform the update
      const [updatedMason] = await db
        .update(masonPcSide)
        .set(validatedData) // Spread validated data (only includes submitted fields)
        .where(eq(masonPcSide.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Mason updated successfully',
        data: updatedMason,
      });

    } catch (err: any) {
      // Handle validation errors from Zod
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: err.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      
      const msg = String(err?.message ?? '').toLowerCase();
      
      // Handle Foreign Key Violation - SQLSTATE 23503
      if (err?.code === '23503' || msg.includes('foreign key constraint')) {
        let field = 'related record';
        if (msg.includes('mason_pc_side_dealer_id_fkey')) {
          field = 'dealerId';
        } else if (msg.includes('mason_pc_side_user_id_fkey')) {
          field = 'userId';
        }
        
        return res.status(400).json({ // 400 Bad Request
          success: false, 
          error: `Foreign key violation: The specified ${field} does not exist.`,
          details: err?.detail ?? err?.message 
        });
      }

      console.error(`Update ${tableName} error:`, err);
      res.status(500).json({
        success: false,
        error: `Failed to update ${tableName}`,
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Masons PATCH endpoints setup complete');
}