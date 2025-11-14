import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonPcSide } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { InferInsertModel } from 'drizzle-orm'; 

// Define the type for the update payload which Drizzle expects
type UpdateMason = Partial<InferInsertModel<typeof masonPcSide>>;

// -------- Helpers (No change) --------

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

// -------- Input Schema (No change) --------

const masonBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  kycDocumentName: strOrNull,
  kycDocumentIdNum: strOrNull,
  
  kycStatus: strOrNull,         
  pointsBalance: intOrNull,     

  bagsLifted: intOrNull,
  isReferred: z.boolean().nullable().optional(),
  referredByUser: strOrNull,
  referredToUser: strOrNull,
  dealerId: strOrNull, 
  userId: intOrNull,    
  firebaseUid: strOrNull,
});

const masonUpdateSchema = masonBaseSchema.partial().strict();

// --- ✅ FIX: Helper function to clean and type-cast the payload ---
function cleanUpdatePayload(data: z.infer<typeof masonUpdateSchema>): UpdateMason {
    const payload: UpdateMason = {};
    for (const key in data) {
        const value = data[key as keyof typeof data];
        // Only include properties that are explicitly present (not undefined from Zod parsing)
        if (value !== undefined) {
            // Explicitly cast the value type to match Drizzle's expected type for update payload
            (payload as any)[key] = value; 
        }
    }
    return payload;
}
// --- ⬆️ End Helper ⬆️ ---


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

      // --- ✅ FIX: Clean the payload and assign Drizzle update type ---
      const updatePayload: UpdateMason = cleanUpdatePayload(validatedData);
      
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
        .set(updatePayload) // Use the cleaned, correctly typed payload
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