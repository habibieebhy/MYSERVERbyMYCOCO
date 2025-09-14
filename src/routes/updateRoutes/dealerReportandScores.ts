// server/src/routes/updateRoutes/dealerReportsAndScores.ts
// Endpoint for partially updating a dealer's reports and scores.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealerReportsAndScores, insertDealerReportsAndScoresSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a partial schema for validation. This allows any subset of fields to be sent.
const dealerScoresUpdateSchema = insertDealerReportsAndScoresSchema.partial();

export default function setupDealerScoresPatchRoutes(app: Express) {
  
  // PATCH /api/dealer-reports-scores/:dealerId
  app.patch('/api/dealer-reports-scores/:dealerId', async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      
      // 1. Validate the incoming data against the partial schema
      const validatedData = dealerScoresUpdateSchema.parse(req.body);

      // If the body is empty, there's nothing to update.
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update were provided.',
        });
      }

      // 2. Check if the record exists before trying to update
      const [existingRecord] = await db.select().from(dealerReportsAndScores).where(eq(dealerReportsAndScores.dealerId, dealerId)).limit(1);

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `Dealer scores for Dealer ID '${dealerId}' not found.`,
        });
      }

      // 3. Perform the update
      const [updatedRecord] = await db
        .update(dealerReportsAndScores)
        .set({
          ...validatedData,
          lastUpdatedDate: new Date(), // Always update the lastUpdatedDate
          updatedAt: new Date(), // Always update the timestamp
        })
        .where(eq(dealerReportsAndScores.dealerId, dealerId))
        .returning();

      res.json({
        success: true,
        message: 'Dealer scores updated successfully',
        data: updatedRecord,
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
      
      console.error('Update Dealer Scores error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update dealer scores',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Dealer Reports and Scores PATCH endpoints setup complete');
}
