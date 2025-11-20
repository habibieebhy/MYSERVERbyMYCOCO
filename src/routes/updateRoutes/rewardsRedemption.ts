// server/src/routes/updateRoutes/rewardsRedemption.ts
// Reward Redemption PATCH endpoint for TSO/Admin fulfillment status update

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
// 🟢 IMPORT rewards table for stock management
import { rewardRedemptions, masonPcSide, pointsLedger, rewards } from '../../db/schema'; 
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

interface CustomRequest extends Request {
    auth?: {
        sub: string; 
        role: string;
        phone: string;
        kyc: string;
    };
}

const redemptionFulfillmentSchema = z.object({
  status: z.enum(['approved', 'shipped', 'delivered', 'rejected']),
  fulfillmentNotes: z.string().max(500).optional().nullable(),
}).strict();


export default function setupRewardsRedemptionPatchRoute(app: Express) {
  
  app.patch('/api/rewards-redemption/:id', async (req: CustomRequest, res: Response) => {
    const tableName = 'Reward Redemption';
    try {
      const { id } = req.params;

      // 1. Auth Check
      if (!req.auth || !req.auth.sub) {
        return res.status(401).json({ success: false, error: "Authentication details missing." });
      }
      const authenticatedUserId = parseInt(req.auth.sub, 10);
      
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Redemption ID format. Expected UUID.' });
      }
      
      // 2. Validate input
      const input = redemptionFulfillmentSchema.parse(req.body);
      
      // 3. Fetch existing record
      const [existingRecord] = await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }
      
      const { status, fulfillmentNotes } = input;
      const currentStatus = existingRecord.status;
      const masonId = existingRecord.masonId;
      const points = existingRecord.pointsDebited; 
      const qty = existingRecord.quantity; 
      const rewardId = existingRecord.rewardId; 

      // Flow Validation
      if (currentStatus === 'delivered' && status !== 'delivered') {
         return res.status(400).json({ success: false, error: 'Cannot change status of an already delivered item.' });
      }

      // --- 4. CORE FINANCIAL & INVENTORY TRANSACTION ---
      
      const updatedRecord = await db.transaction(async (tx) => {
          
          // ==================================================================
          // CASE A: APPROVING (Placed -> Approved)
          // Action: DEDUCT STOCK only. (Points were debited on POST)
          // ==================================================================
          if (currentStatus === 'placed' && status === 'approved') {
              
              // 1. Safety Check: Is there enough Stock?
              const [item] = await tx.select({ stock: rewards.stock })
                                     .from(rewards).where(eq(rewards.id, rewardId));
                                     
              if (!item || item.stock < qty) {
                   throw new Error(`Insufficient stock to approve. Available: ${item?.stock ?? 0}, Required: ${qty}`);
              }

              // 2. DEDUCT STOCK
              await tx.update(rewards)
                  .set({ stock: sql`${rewards.stock} - ${qty}` })
                  .where(eq(rewards.id, rewardId));

              // 3. Update Status
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ status: 'approved', updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();
              
              return updated;
          } 
          
          // ==================================================================
          // CASE B: REJECTING (Placed -> Rejected)
          // Action: REFUND Points (Stock was never taken)
          // ==================================================================
          else if (currentStatus === 'placed' && status === 'rejected') {
              
              // 1. REFUND POINTS (Ledger + Balance)
              await tx.insert(pointsLedger).values({
                  masonId: masonId,
                  sourceType: 'adjustment', 
                  points: points, // Positive (Refund)
                  memo: `Refund: Order ${id} rejected by TSO ${authenticatedUserId}.`,
              });

              await tx.update(masonPcSide)
                  .set({ pointsBalance: sql`${masonPcSide.pointsBalance} + ${points}` })
                  .where(eq(masonPcSide.id, masonId));

              // 2. Update Status
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ status: 'rejected', updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();

              return updated;
          }

          // ==================================================================
          // CASE C: REJECTING (Approved -> Rejected)
          // Action: REFUND Points + RETURN Stock
          // ==================================================================
          else if (currentStatus === 'approved' && status === 'rejected') {
              
              // 1. REFUND POINTS
              await tx.insert(pointsLedger).values({
                  masonId: masonId,
                  sourceType: 'adjustment',
                  points: points, 
                  memo: `Refund: Approved Order ${id} rejected by TSO ${authenticatedUserId}.`,
              });

              await tx.update(masonPcSide)
                  .set({ pointsBalance: sql`${masonPcSide.pointsBalance} + ${points}` })
                  .where(eq(masonPcSide.id, masonId));

              // 2. RETURN STOCK
              await tx.update(rewards)
                  .set({ stock: sql`${rewards.stock} + ${qty}` })
                  .where(eq(rewards.id, rewardId));

              // 3. Update Status
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ status: 'rejected', updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();

              return updated;
          }
          
          // ==================================================================
          // CASE D: FULFILLMENT (Approved -> Shipped -> Delivered)
          // Action: Just update status
          // ==================================================================
          else {
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ status: status, updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();
              return updated;
          }
      });
      
      res.json({
        success: true,
        message: `Status updated to '${updatedRecord.status}'.`,
        data: updatedRecord,
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      
      console.error(`PATCH ${tableName} error:`, error);
      
      const msg = (error as Error)?.message ?? '';
      if (msg.includes('Insufficient') || msg.includes('Cannot change')) {
         return res.status(400).json({ success: false, error: msg });
      }
      
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName} status.`,
      });
    }
  });

  console.log('✅ Reward Redemptions PATCH (Inventory & Financials) endpoint setup complete');
}