// server/src/routes/updateRoutes/ratings.ts
// Endpoint for partially updating a rating.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { ratings, insertRatingSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a partial schema for validation. This allows any subset of fields to be sent.
const ratingUpdateSchema = insertRatingSchema.pick({ rating: true }); // Only allow 'rating' to be updated

export default function setupRatingsPatchRoutes(app: Express) {
  
  // PATCH /api/ratings/:id
  app.patch('/api/ratings/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid rating ID.' });
      }
      
      // 1. Validate the incoming data against the partial schema
      const validatedData = ratingUpdateSchema.parse(req.body);

      // 2. Check if the rating exists before trying to update
      const [existingRating] = await db.select().from(ratings).where(eq(ratings.id, id)).limit(1);

      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: `Rating with ID '${id}' not found.`,
        });
      }

      // 3. Perform the update
      const [updatedRating] = await db
        .update(ratings)
        .set({
          rating: validatedData.rating,
        })
        .where(eq(ratings.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Rating updated successfully',
        data: updatedRating,
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
      
      console.error('Update Rating error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update rating',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Ratings PATCH endpoints setup complete');
}
