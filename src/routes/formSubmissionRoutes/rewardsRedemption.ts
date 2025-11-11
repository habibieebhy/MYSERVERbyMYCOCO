// server/src/routes/formSubmissionRoutes/rewardsRedemption.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewardRedemptions, pointsLedger, masonPcSide, insertRewardRedemptionSchema } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { eq, sql } from 'drizzle-orm';

/**
 * Zod schema for the Reward Redemption data submission.
 * We extend the Drizzle insert schema to enforce specific types and remove auto-generated fields 
 * like `id`, `status`, `createdAt`, `updatedAt`.
 */
const redemptionSubmissionSchema = insertRewardRedemptionSchema.omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Explicitly define required fields and coercions
    masonId: z.string().uuid({ message: 'A valid Mason ID (UUID) is required.' }),
    // Brand ID is an integer in the schema
    rewardId: z.preprocess(
        (v) => (typeof v === 'string' ? parseInt(v, 10) : v), 
        z.number().int().positive('A valid Reward ID is required.')
    ),
    quantity: z.number().int().positive('Quantity must be a positive integer.').default(1),
    pointsDebited: z.number().int().positive('Points debited must be a positive integer.'),
    // Optional delivery details
    deliveryName: z.string().max(160).optional(),
    deliveryPhone: z.string().max(20).optional(),
    deliveryAddress: z.string().optional(),
    
    // Optional memo for the points ledger entry
    memo: z.string().max(500).optional(), 
});

/**
 * Sets up the POST route for the reward_redemptions table.
 *
 * POST /api/rewards-redemption
 * - Handles the creation of a new reward_redemption record.
 * - Manages the transactional creation of a corresponding DEBIT points_ledger entry.
 * - Includes a crucial placeholder check for Mason's points balance.
 */
export default function setupRewardsRedemptionPostRoute(app: Express) {

    app.post('/api/rewards-redemption', async (req: Request, res: Response) => {
        try {
            // 1. Validate incoming data
            const validationResult = redemptionSubmissionSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Validation failed for Redemption submission.', 
                    details: validationResult.error.errors 
                });
            }

            const validatedData = validationResult.data;
            const { masonId, pointsDebited, quantity, memo, ...redemptionBody } = validatedData;
            
            // Calculate total points needed
            const totalPointsDebited = pointsDebited * quantity;
            
            // --- CRITICAL PRE-TRANSACTION CHECK ---
            // 2. Check Mason's current points balance
            const [masonRecord] = await db.select({
                pointsBalance: masonPcSide.pointsBalance
            })
            .from(masonPcSide)
            .where(eq(masonPcSide.id, masonId))
            .limit(1);

            if (!masonRecord) {
                return res.status(404).json({ success: false, error: 'Mason not found.' });
            }

            if (masonRecord.pointsBalance < totalPointsDebited) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Insufficient points balance. Required: ${totalPointsDebited}, Available: ${masonRecord.pointsBalance}.` 
                });
            }
            // --- END CRITICAL CHECK ---

            // Generate ID manually
            const generatedRedemptionId = randomUUID();

            // Start a Drizzle transaction to ensure all writes succeed or fail together (atomicity)
            const result = await db.transaction(async (tx) => {
                
                // 3. Insert the Reward Redemption record
                const [newRedemption] = await tx.insert(rewardRedemptions)
                    .values({
                        ...redemptionBody,
                        id: generatedRedemptionId, // Use the manually generated ID
                        masonId: masonId,
                        pointsDebited: totalPointsDebited, // Save the total points debited
                        quantity: quantity,
                        status: 'placed', // Initial status
                    })
                    .returning();

                if (!newRedemption) {
                    tx.rollback();
                    throw new Error('Failed to insert new reward redemption record.');
                }
                
                // 4. Insert the corresponding Points Ledger DEBIT entry
                const [newLedgerEntry] = await tx.insert(pointsLedger)
                    .values({
                        masonId: newRedemption.masonId,
                        sourceType: 'redemption',
                        sourceId: newRedemption.id, // Link to the newly created redemption ID
                        // Points are NEGATIVE for a DEBIT
                        points: -totalPointsDebited, 
                        memo: memo || `Debit for ${newRedemption.quantity} x Reward ID ${newRedemption.rewardId}`,
                    })
                    .returning();

                if (!newLedgerEntry) {
                    tx.rollback();
                    throw new Error('Failed to insert corresponding points ledger entry (debit).');
                }
                
                // 5. Update the Mason's pointsBalance (denormalization)
                await tx.update(masonPcSide)
                    .set({
                        pointsBalance: sql`${masonPcSide.pointsBalance} - ${totalPointsDebited}`
                    })
                    .where(eq(masonPcSide.id, masonId));

                
                return { redemption: newRedemption, ledger: newLedgerEntry };
            });

            // If the transaction completed successfully
            res.status(201).json({ 
                success: true, 
                message: 'Reward redemption successfully placed and points debited.', 
                data: result.redemption,
                ledgerEntry: result.ledger
            });

        } catch (error: any) {
            console.error(`POST Reward Redemption error:`, error);
            
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code
                    }))
                });
            }

            // General server error
            res.status(500).json({
                success: false,
                error: `Failed to place reward redemption.`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    console.log('✅ Rewards Redemption POST endpoint setup complete');
}