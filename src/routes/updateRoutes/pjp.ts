// server/src/routes/updateRoutes/pjp.ts
// --- UPDATED to use dealerId ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// helpers
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const strOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return String(val).trim();
}, z.string().nullable().optional());

// --- PATCH schema UPDATED ---
const pjpPatchSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  
  // --- ✅ FIX ---
  dealerId: strOrNull, // Replaced visitDealerName
  // --- END FIX ---
  
  planDate: z.coerce.date().optional(),
  areaToBeVisited: z.string().max(500).optional(),
  description: z.string().max(500).optional().nullable(), // Allow regular null
  status: z.string().max(50).optional(),
  verificationStatus: z.string().max(50).optional().nullable(),
  additionalVisitRemarks: z.string().max(500).optional().nullable(),
}).strict();

export default function setupPjpPatchRoutes(app: Express) {
  app.patch('/api/pjp/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const input = pjpPatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      const [existing] = await db
        .select({ id: permanentJourneyPlans.id })
        .from(permanentJourneyPlans)
        .where(eq(permanentJourneyPlans.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `PJP with ID '${id}' not found.`,
        });
      }

      // 3) build patch safely
      const patch: any = { updatedAt: new Date() }; // always touch updatedAt

      if (input.userId !== undefined) patch.userId = input.userId;
      if (input.createdById !== undefined) patch.createdById = input.createdById;
      
      // --- ✅ FIX ---
      if (input.dealerId !== undefined) patch.dealerId = input.dealerId;
      // --- END FIX ---

      if (input.planDate !== undefined) patch.planDate = toDateOnly(input.planDate);
      if (input.areaToBeVisited !== undefined) patch.areaToBeVisited = input.areaToBeVisited;
      if (input.status !== undefined) patch.status = input.status;
      
      // Handle nullable string fields
      if (input.description !== undefined) patch.description = input.description;
      if (input.verificationStatus !== undefined) patch.verificationStatus = input.verificationStatus;
      if (input.additionalVisitRemarks !== undefined) patch.additionalVisitRemarks = input.additionalVisitRemarks;
      
      // 4) update
      const [updated] = await db
        .update(permanentJourneyPlans)
        .set(patch)
        .where(eq(permanentJourneyPlans.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'Permanent Journey Plan updated successfully',
        data: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error('Update PJP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update PJP',
      });
    }
  });

  console.log('✅ PJP PATCH endpoints (using dealerId) setup complete');
}