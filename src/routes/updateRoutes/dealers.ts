// server/src/routes/updateRoutes/dealers.ts
// Endpoint for partially updating a dealer's information.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers, insertDealerSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a partial schema for validation. This allows any subset of fields to be sent.
const dealerUpdateSchema = insertDealerSchema.partial();

export default function setupDealersPatchRoutes(app: Express) {
  
  // PATCH /api/dealers/:id
  app.patch('/api/dealers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate the incoming data against the partial schema
      const validatedData = dealerUpdateSchema.parse(req.body);

      // If the body is empty, there's nothing to update.
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update were provided.',
        });
      }

      // 2. Check if the dealer exists before trying to update
      const [existingDealer] = await db.select().from(dealers).where(eq(dealers.id, id)).limit(1);

      if (!existingDealer) {
        return res.status(404).json({
          success: false,
          error: `Dealer with ID '${id}' not found.`,
        });
      }

      // 3. Perform the update
      const [updatedDealer] = await db
        .update(dealers)
        .set({
          ...validatedData,
          updatedAt: new Date(), // Automatically update the timestamp
        })
        .where(eq(dealers.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Dealer updated successfully',
        data: updatedDealer,
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
      
      console.error('Update Dealer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update dealer',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Dealers PATCH endpoints setup complete');
}
