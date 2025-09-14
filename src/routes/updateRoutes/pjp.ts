// server/src/routes/updateRoutes/pjp.ts
// Endpoint for partially updating a Permanent Journey Plan.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans, insertPermanentJourneyPlanSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a partial schema for validation. This allows any subset of fields to be sent.
const pjpUpdateSchema = insertPermanentJourneyPlanSchema.partial();

export default function setupPjpPatchRoutes(app: Express) {
  
  // PATCH /api/pjp/:id
  app.patch('/api/pjp/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate the incoming data against the partial schema
      const validatedData = pjpUpdateSchema.parse(req.body);

      // If the body is empty, there's nothing to update.
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update were provided.',
        });
      }

      // 2. Check if the PJP exists before trying to update
      const [existingPjp] = await db.select().from(permanentJourneyPlans).where(eq(permanentJourneyPlans.id, id)).limit(1);

      if (!existingPjp) {
        return res.status(404).json({
          success: false,
          error: `Permanent Journey Plan with ID '${id}' not found.`,
        });
      }

      // 3. Perform the update
      const [updatedPjp] = await db
        .update(permanentJourneyPlans)
        .set({
          ...validatedData,
          updatedAt: new Date(), // Automatically update the timestamp
        })
        .where(eq(permanentJourneyPlans.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Permanent Journey Plan updated successfully',
        data: updatedPjp,
      });

    } catch (error) {
      // Handle validation errors from Zod
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      
      console.error('Update PJP error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update Permanent Journey Plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ PJP PATCH endpoints setup complete');
}
