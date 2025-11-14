// src/routes/updateRoutes/masonpcSide.ts
import { Request, Response, Express, NextFunction } from 'express';
import { db } from '../../db/db';
import { masonPcSide } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { InferInsertModel } from 'drizzle-orm'; 
// Assuming requireAuth is imported from '../middleware/requireAuth'
import { requireAuth } from '../../middleware/requireAuth'; 

// Define the structure of the decoded JWT payload set by requireAuth
interface MasonAuthPayload {
  sub: string; // The mason ID (UUID)
  role: string;
  phone: string;
  kyc: string;
}


// Fixed type definition: Update is a Partial of the Insert Model
type UpdateMason = Partial<InferInsertModel<typeof masonPcSide>>;

// -------- Helpers (unchanged) --------

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

// -------- Input Schema (unchanged) --------

const masonUpdatableFieldsSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  kycDocumentName: strOrNull,
  kycDocumentIdNum: strOrNull,
  // Note: kycStatus/bagsLifted/pointsBalance are usually server-managed after submission
  kycStatus: strOrNull, 
  bagsLifted: intOrNull, 
  pointsBalance: intOrNull, 
  isReferred: z.boolean().nullable().optional(),
  referredByUser: strOrNull,
  referredToUser: strOrNull,
  dealerId: strOrNull, 
  userId: intOrNull,    
});

const masonUpdateSchema = masonUpdatableFieldsSchema.partial().strict();

// ❌ The custom middleware 'masonAuthMiddleware' is REMOVED
// as we are now using the centralized 'requireAuth'.


export default function setupMasonPcSidePatchRoutes(app: Express) {
  
  // PATCH /api/masons/:id - Now protected by the centralized requireAuth middleware
  // We remove 'as any' from requireAuth, and use the base Request type for the handler.
  app.patch('/api/masons/:id', requireAuth, async (req: Request, res: Response) => {
    const tableName = 'Mason';
    try {
      // 1. Type Assertion for Auth Payload
      // We assert that the request object now contains the 'auth' property 
      // added by the requireAuth middleware.
      const authPayload = (req as any).auth as MasonAuthPayload;

      // 2. Validate the ID from the URL
      const { id } = req.params;
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Mason ID format. Expected UUID.' });
      }
      
      // 3. CRITICAL AUTHORIZATION CHECK: Token ID must match URL ID
      // Retrieve the authenticated user's ID from the payload set by requireAuth
      const authenticatedMasonId = authPayload.sub; 
      
      if (!authenticatedMasonId) {
          // This case should be caught by requireAuth, but good for robustness
          return res.status(401).json({ success: false, error: 'Authorization context missing.' });
      }

      if (id !== authenticatedMasonId) {
          // Forbidden: User attempting to update another user's profile
          return res.status(403).json({ success: false, error: 'Unauthorized to update this resource.' });
      }
      
      // 4. Validate the incoming data against the partial schema
      const validatedData = masonUpdateSchema.parse(req.body);

      // If the body is empty, there's nothing to update.
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update were provided.',
        });
      }

      // 5. Check existence (optional, but robust)
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

      // 6. Perform the update
      const updatePayload: UpdateMason = validatedData as UpdateMason;
      
      const [updatedMason] = await db
        .update(masonPcSide)
        .set(updatePayload)
        .where(eq(masonPcSide.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Mason updated successfully',
        data: updatedMason,
      });

    } catch (err: any) {
      // 7. Handle errors
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
        
        return res.status(400).json({ 
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

  console.log('✅ Masons PATCH endpoints setup complete (using requireAuth)');
}