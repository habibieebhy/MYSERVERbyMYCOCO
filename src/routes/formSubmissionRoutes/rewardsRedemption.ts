// server/src/routes/formSubmissionRoutes/rewardsRedemption.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewardRedemptions, pointsLedger, masonPcSide, insertRewardRedemptionSchema, rewards } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { eq, sql } from 'drizzle-orm';

/**
 * Zod schema for the Reward Redemption data submission.
 */
const redemptionSubmissionSchema = insertRewardRedemptionSchema.omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    masonId: z.string().uuid({ message: 'A valid Mason ID (UUID) is required.' }),
    rewardId: z.preprocess(
        (v) => (typeof v === 'string' ? parseInt(v, 10) : v), 
        z.number().int().positive('A valid Reward ID is required.')
    ),
    quantity: z.number().int().positive('Quantity must be a positive integer.').default(1),
    // We accept pointsDebited but we will VERIFY it against the DB
    pointsDebited: z.number().int().positive().optional(),
    deliveryName: z.string().max(160).optional(),
    deliveryPhone: z.string().max(20).optional(),
    deliveryAddress: z.string().optional(),
    memo: z.string().max(500).optional(), 
});

export default function setupRewardsRedemptionPostRoute(app: Express) {

    app.post('/api/rewards-redemption', async (req: Request, res: Response) => {
        try {
            // 1. Validate incoming data
            const validationResult = redemptionSubmissionSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Validation failed', 
                    details: validationResult.error.errors 
                });
            }

            const validatedData = validationResult.data;
            const { masonId, quantity, memo, rewardId, ...redemptionBody } = validatedData;
            
            // 2. FETCH REWARD DETAILS (Source of Truth)
            // We must get the price and stock from the DB, not the client.
            const [rewardItem] = await db.select({
                pointCost: rewards.pointCost,
                stock: rewards.stock,
                isActive: rewards.isActive,
                itemName: rewards.itemName
            })
            .from(rewards)
            .where(eq(rewards.id, rewardId))
            .limit(1);

            if (!rewardItem) {
                return res.status(404).json({ success: false, error: 'Reward item not found.' });
            }

            // 3. LOGIC CHECKS (Stock & Active)
            if (!rewardItem.isActive) {
                return res.status(400).json({ success: false, error: 'This reward item is no longer active.' });
            }
            // Ensure we have enough stock before taking points
            if (rewardItem.stock < quantity) {
                return res.status(400).json({ success: false, error: `Out of stock. Only ${rewardItem.stock} units available.` });
            }

            // Calculate REAL cost (Security Check)
            const totalPointsDebited = rewardItem.pointCost * quantity;

            // 4. FETCH MASON & CHECK BALANCE
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
                    error: `Insufficient points. Cost: ${totalPointsDebited}, Available: ${masonRecord.pointsBalance}.` 
                });
            }

            // 5. EXECUTE TRANSACTION
            const generatedRedemptionId = randomUUID();

            const result = await db.transaction(async (tx) => {
                
                // A. Insert Redemption Record
                const [newRedemption] = await tx.insert(rewardRedemptions)
                    .values({
                        ...redemptionBody,
                        id: generatedRedemptionId,
                        masonId: masonId,
                        rewardId: rewardId,
                        // Use the CALCULATED secure cost, ignoring client input
                        pointsDebited: totalPointsDebited, 
                        quantity: quantity,
                        status: 'placed', // Initial status
                    })
                    .returning();
                
                // B. Insert Ledger DEBIT Entry
                const [newLedgerEntry] = await tx.insert(pointsLedger)
                    .values({
                        masonId: newRedemption.masonId,
                        sourceType: 'redemption',
                        sourceId: newRedemption.id,
                        points: -totalPointsDebited, // NEGATIVE for Debit
                        memo: memo || `Redeemed ${quantity} x ${rewardItem.itemName}`,
                    })
                    .returning();
                
                // C. Deduct Points from Mason Balance (Instant Debit)
                // We debit NOW to "hold" the points.
                await tx.update(masonPcSide)
                    .set({
                        pointsBalance: sql`${masonPcSide.pointsBalance} - ${totalPointsDebited}`
                    })
                    .where(eq(masonPcSide.id, masonId));

                // Note: We do NOT deduct stock here. Stock is deducted on TSO Approval.
                // This allows the TSO to reject the order if physical inventory is missing
                // without having to mess with "holding" logic.

                return { redemption: newRedemption, ledger: newLedgerEntry };
            });

            // Success
            res.status(201).json({ 
                success: true, 
                message: 'Order placed successfully!', 
                data: result.redemption,
            });

        } catch (error: any) {
            console.error(`POST Reward Redemption error:`, error);
            res.status(500).json({
                success: false,
                error: `Failed to place order.`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    console.log('✅ Rewards Redemption POST endpoint setup complete (Secure Price & Stock Check)');
}