// server/src/routes/updateRoutes/bagsLift.ts
// Bags Lift PATCH endpoint for TSO approval and points update

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { bagLifts, pointsLedger, masonPcSide } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// --- IMPORT CORE CALCULATION LOGIC ---
import { calculateExtraBonusPoints, checkReferralBonusTrigger } from '../../utils/pointsCalcLogic';
// --- END IMPORT ---

// --- TSO AUTH IMPORT ---
import { tsoAuth } from '../../middleware/tsoAuth';
// ---

// --- Define CustomRequest to access req.auth ---
// This interface matches the user details added by your requireAuth middleware
interface CustomRequest extends Request {
    auth?: {
        sub: string; // User ID from 'users' table
        role: string;
        phone: string;
        kyc: string;
    };
}
// ---

// Zod schema for TSO approval/rejection fields.
const bagLiftApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  memo: z.string().max(500).optional(),
  // 'approvedBy' was removed. It will be taken from the authenticated user's token (req.auth.sub).
}).strict();

export default function setupBagLiftsPatchRoute(app: Express) {
  
  // --- TSO AUTH ADDED TO THE ROUTE ---
  app.patch('/api/bag-lifts/:id', tsoAuth, async (req: CustomRequest, res: Response) => {
    const tableName = 'Bag Lift';
    try {
      const { id } = req.params;

      // 1. Get Authenticated User ID (from requireAuth/tsoAuth middleware)
      // The tsoAuth middleware has already verified this user is authorized to approve.
      // --- REDUNDANT CHECK REMOVED ---
      // if (!req.auth || !req.auth.sub) { ... }
      
      const authenticatedUserId = parseInt(req.auth!.sub, 10); // Use non-null assertion
      
      if (isNaN(authenticatedUserId)) {
        // This check is still valid in case the token 'sub' is somehow not a number
        return res.status(400).json({ success: false, error: "Invalid user ID in auth token." });
      }
      
      // 2. Validate incoming data
      const input = bagLiftApprovalSchema.parse(req.body);

      // 3. Find existing record (Bag Lift details)
      const [existingRecord] = await db.select().from(bagLifts).where(eq(bagLifts.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }
      
      const { status, memo } = input; // 'approvedBy' is no longer here
      const currentStatus = existingRecord.status;
      const masonId = existingRecord.masonId;
      
      // FIX 1: Apply non-null assertion since pointsCredited must exist on a submitted record
      const points = existingRecord.pointsCredited!; // Main points (Base + Bonanza)

      // 4. Logic check to prevent double points or approval of wrong status
      if (status === currentStatus) {
         return res.status(400).json({ success: false, error: `Status is already '${currentStatus}'.` });
      }
      if (status === 'approved' && currentStatus === 'rejected') {
         return res.status(400).json({ success: false, error: 'Cannot directly approve a previously rejected transaction.' });
      }

      // --- Transactional Update ---
      // The transaction ensures all financial and cumulative logic is executed atomically.
      const updatedBagLift = await db.transaction(async (tx) => {
        
        // --- 5.1. Approving a Pending/New Lift (Credit Points and Bonuses) ---
        if (status === 'approved' && currentStatus === 'pending') {
            
            // 1. Get Mason's current state BEFORE credit for bonus calculation
            const [masonBeforeCredit] = await tx.select()
                .from(masonPcSide)
                .where(eq(masonPcSide.id, masonId))
                .limit(1);
            
            if (!masonBeforeCredit) {
                // If Mason doesn't exist, the transaction must fail
                tx.rollback();
                throw new Error(`Mason ID ${masonId} not found.`);
            }

            // A. Update Bag Lift Record
            const [updated] = await tx.update(bagLifts)
              .set({
                  status: 'approved',
                  approvedBy: authenticatedUserId, // <-- Use the ID from auth
                  approvedAt: new Date(),
              })
              .where(eq(bagLifts.id, id))
              .returning();
              
            // B. Create Points Ledger Entry (Main Credit: Base + Bonanza)
            await tx.insert(pointsLedger)
                .values({
                    masonId: masonId,
                    sourceType: 'bag_lift',
                    sourceId: updated.id, 
                    points: points, 
                    memo: memo || `Credit for ${updated.bagCount} bags (Base+Bonanza).`,
                })
                .returning();
            
            // C. Update Mason's Balance and Bags Lifted (Main Credit)
            // Note: We use atomic operations here to update the total bags/points.
            await tx.update(masonPcSide)
              .set({
                  pointsBalance: sql`${masonPcSide.pointsBalance} + ${points}`,
                  bagsLifted: sql`${masonPcSide.bagsLifted} + ${updated.bagCount}`,
              })
              .where(eq(masonPcSide.id, masonId));

            // --- D. Extra Bonus Logic (Policy Rule 12 & 13) ---
            const oldTotalBags = masonBeforeCredit.bagsLifted ?? 0;
            const currentLiftBags = updated.bagCount;
            const extraBonus = calculateExtraBonusPoints(oldTotalBags, currentLiftBags, existingRecord.purchaseDate );

            if (extraBonus > 0) {
                // Insert ledger entry for the Extra Bonus
                await tx.insert(pointsLedger).values({
                    masonId: masonId,
                    points: extraBonus,
                    sourceType: 'adjustment', // Policy Rule 13 uses "adjustment" type
                    memo: `Extra Bonus: ${extraBonus} points for crossing bag slab.`,
                });
                
                // Update Mason's points balance atomically with the extra bonus
                await tx.update(masonPcSide)
                    .set({
                        pointsBalance: sql`${masonPcSide.pointsBalance} + ${extraBonus}`,
                    })
                    .where(eq(masonPcSide.id, masonId));
            }
            
            // --- E. Referral Bonus Logic (Policy Rule 5 & 6) ---
            if (masonBeforeCredit.referredByUser) {
                const referrerId = masonBeforeCredit.referredByUser;
                const referralPoints = checkReferralBonusTrigger(oldTotalBags, currentLiftBags);

                if (referralPoints > 0) {
                    
                    // Insert ledger entry for the referrer (not the current Mason)
                    await tx.insert(pointsLedger).values({
                        masonId: referrerId,
                        points: referralPoints,
                        sourceType: 'referral_bonus', 
                        memo: `Referral bonus for Mason ${masonId} hitting 200 bags.`,
                    });

                    // Update the referrer's points balance atomically
                    await tx.update(masonPcSide)
                        .set({
                            pointsBalance: sql`${masonPcSide.pointsBalance} + ${referralPoints}`,
                        })
                        .where(eq(masonPcSide.id, referrerId));
                }
            }

            return updated;
        } 
        
        // 5.2. Rejecting an Approved Lift (Unwind/Debit Points and Bags)
        else if (status === 'rejected' && currentStatus === 'approved') {
            
            // A. Update Bag Lift Record
            const [updated] = await tx.update(bagLifts)
                .set({
                    status: 'rejected',
                    // Note: We keep the original 'approvedBy' ID to know who approved it,
                    // but we could nullify it if business logic required.
                    // approvedBy: null, 
                })
                .where(eq(bagLifts.id, id))
                .returning();
            
            // B. Create Points Ledger Entry (Debit to reverse main points)
            await tx.insert(pointsLedger)
                .values({
                    masonId: masonId,
                    sourceType: 'adjustment', 
                    sourceId: randomUUID(), // New UUID for the adjustment record
                    points: -points, // Negative points for debit
                    memo: memo || `Debit adjustment: Bag Lift ${id} rejected by User ${authenticatedUserId}. Reversing main points.`,
                })
                .returning();
                
            // C. Update Mason's Balance (Deduct points AND bags lifted)
            await tx.update(masonPcSide)
                .set({
                    pointsBalance: sql`${masonPcSide.pointsBalance} - ${points}`,
                    // FIX 2: Apply non-null assertion to existingRecord.bagCount
                    bagsLifted: sql`${masonPcSide.bagsLifted} - ${existingRecord.bagCount!}`, 
                })
                .where(eq(masonPcSide.id, masonId));

            return updated;
        }

        // 5.3. Simple Status Update (e.g., pending -> rejected, no points change)
        else {
            const [updated] = await tx.update(bagLifts)
                .set({ status: status })
                .where(eq(bagLifts.id, id))
                .returning();
            return updated;
        }
      });


      // 6. Return success
      res.json({
        success: true,
        message: `Bag Lift status updated to '${updatedBagLift.status}' successfully.`,
        data: updatedBagLift,
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error(`PATCH Bag Lift error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to update Bag Lift status.`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Bag Lifts PATCH (Approval) endpoint setup complete (Now protected by tsoAuth middleware)');
}