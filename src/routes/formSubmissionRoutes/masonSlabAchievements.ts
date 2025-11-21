// server/src/routes/formSubmissionRoutes/masonSlabAchievements.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { 
  masonSlabAchievements, 
  masonPcSide, 
  pointsLedger, 
  schemeSlabs 
} from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { eq, sql } from 'drizzle-orm';

// Zod Schema for validation
const insertAchievementSchema = z.object({
  masonId: z.string().uuid("Invalid Mason ID."),
  schemeSlabId: z.string().uuid("Invalid Scheme Slab ID."),
});

export default function setupMasonSlabAchievementsPostRoute(app: Express) {
  
  app.post('/api/mason-slab-achievements', async (req: Request, res: Response) => {
    const tableName = 'Mason Slab Achievement';

    try {
      // 1. Validate Input
      const { masonId, schemeSlabId } = insertAchievementSchema.parse(req.body);

      // 2. Fetch the Slab details FIRST (We need to know how many points to give)
      // We do this outside the transaction to keep the transaction short
      const [slab] = await db
        .select()
        .from(schemeSlabs)
        .where(eq(schemeSlabs.id, schemeSlabId))
        .limit(1);

      if (!slab) {
        return res.status(404).json({ success: false, error: 'Scheme Slab not found.' });
      }

      // 3. START TRANSACTION
      // We perform 3 atomic operations: 
      // A. Record Achievement 
      // B. Add Points to Balance 
      // C. Add Ledger Entry
      const result = await db.transaction(async (tx) => {
        
        // Step A: Insert the Achievement Record
        // This will FAIL immediately if the unique constraint (masonId + slabId) exists,
        // effectively preventing double-claiming.
        const [newAchievement] = await tx
          .insert(masonSlabAchievements)
          .values({
            id: randomUUID(),
            masonId,
            schemeSlabId,
            pointsAwarded: slab.pointsEarned, // Snapshot the points at time of achievement
            // achievedAt is defaultNow()
          })
          .returning();

        // Step B: Update Mason's Points Balance
        // We use sql increment to be safe against race conditions
        const [updatedMason] = await tx
          .update(masonPcSide)
          .set({
            pointsBalance: sql`${masonPcSide.pointsBalance} + ${slab.pointsEarned}`,
          })
          .where(eq(masonPcSide.id, masonId))
          .returning({ newBalance: masonPcSide.pointsBalance });

        if (!updatedMason) {
          tx.rollback();
          throw new Error("Mason not found during balance update.");
        }

        // Step C: Create Ledger Entry
        await tx.insert(pointsLedger).values({
          id: randomUUID(),
          masonId,
          sourceType: 'achievement', // Tagging this as an achievement reward
          sourceId: newAchievement.id, // Link to the achievement record
          points: slab.pointsEarned,
          memo: `Reward for clearing slab: ${slab.slabDescription || 'Scheme Level'}`,
        });

        return { achievement: newAchievement, newBalance: updatedMason.newBalance };
      });

      // 4. Success Response
      return res.status(201).json({
        success: true,
        message: `Achievement unlocked! ${slab.pointsEarned} points credited.`,
        data: result.achievement,
        newPointsBalance: result.newBalance
      });

    } catch (err: any) {
      console.error(`Create ${tableName} error:`, err);

      // Handle Zod Errors
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
      }

      const msg = String(err?.message ?? '').toLowerCase();

      // Handle "Already Claimed" (Duplicate Key)
      if (err?.code === '23505' || msg.includes('unique_mason_slab_claim')) {
        return res.status(409).json({ 
          success: false, 
          error: 'This reward level has already been claimed by this mason.' 
        });
      }

      // Handle Foreign Keys (Invalid Mason ID)
      if (err?.code === '23503') {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid Mason ID or Slab ID provided.' 
        });
      }

      return res.status(500).json({ 
        success: false, 
        error: `Failed to claim achievement.`, 
        details: err?.message 
      });
    }
  });

  console.log('✅ Mason Slab Achievements POST endpoint setup complete (Transactional)');
}