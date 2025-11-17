// server/src/routes/updateRoutes/rewardsRedemption.ts
// Reward Redemption PATCH endpoint for TSO/Admin fulfillment status update

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
// 🟢 NEW: Import masonPcSide and pointsLedger for atomic transaction
import { rewardRedemptions, masonPcSide, pointsLedger } from '../../db/schema'; 
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto'; // Needed to generate unique ID for adjustment ledger

// --- Define CustomRequest to access req.auth ---
interface CustomRequest extends Request {
    auth?: {
        sub: string; // User ID from 'users' table
        role: string;
        phone: string;
        kyc: string;
    };
}
// ---

// Note: The 'approved' status here is typically for TSO approval to move it to fulfillment.
const redemptionFulfillmentSchema = z.object({
  status: z.enum(['approved', 'shipped', 'delivered', 'rejected']),
  fulfillmentNotes: z.string().max(500).optional().nullable(),
}).strict();


export default function setupRewardsRedemptionPatchRoute(app: Express) {
  
  app.patch('/api/rewards-redemption/:id', async (req: CustomRequest, res: Response) => {
    const tableName = 'Reward Redemption';
    try {
      const { id } = req.params;

      // 1. Get Authenticated User ID
      if (!req.auth || !req.auth.sub) {
        return res.status(401).json({ success: false, error: "Authentication details missing." });
      }
      const authenticatedUserId = parseInt(req.auth.sub, 10);
      
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Redemption ID format. Expected UUID.' });
      }
      
      // 2. Validate input
      const input = redemptionFulfillmentSchema.parse(req.body);
      
      // 3. Check existing record
      const [existingRecord] = await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }
      
      const { status, fulfillmentNotes } = input;
      const currentStatus = existingRecord.status;
      const masonId = existingRecord.masonId;
      const points = existingRecord.pointsDebited; // Already stored as the points to be deducted
      
      // OPTIONAL IMPROVEMENT: Add status flow validation here (e.g., cannot go from 'delivered' back to 'shipped')
      if (currentStatus === 'delivered' && status !== 'delivered') {
         return res.status(400).json({ success: false, error: 'Cannot change status of an already delivered item.' });
      }

      // --- 4. CORE FINANCIAL TRANSACTION LOGIC ---
      
      const updatedRecord = await db.transaction(async (tx) => {
          
          // 4.1. Debit Logic: Only run if status changes from 'placed' to 'approved'
          if (currentStatus === 'placed' && status === 'approved') {
              
              // 1. Create Ledger Debit Entry (Negative Points)
              await tx.insert(pointsLedger)
                  .values({
                      masonId: masonId,
                      sourceType: 'redemption',
                      sourceId: id, // Link back to the Redemption record
                      points: -points, // ⬅️ DEBIT: Insert negative points
                      memo: `Points deducted for approved redemption ID ${id}. Approved by TSO ${authenticatedUserId}.`,
                  })
                  .returning();

              // 2. Atomically Update Mason's Balance (Subtract points)
              await tx.update(masonPcSide)
                  .set({
                      pointsBalance: sql`${masonPcSide.pointsBalance} - ${points}`, // ⬅️ DEBIT: Subtract the points
                  })
                  .where(eq(masonPcSide.id, masonId));

              // 3. Update Redemption Status
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ status: 'approved', updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();
              
              return updated;

          } 
          
          // 4.2. Status Fulfillment (Non-financial change)
          else if (status !== 'approved') {
              // If status is 'shipped' or 'delivered' or 'rejected', just update status
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ status: status, updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();
                  
              return updated;
          }
          
          // 4.3. Prevent Re-Debit or Invalid Flow (e.g., approved -> delivered)
          else if (currentStatus === 'approved' && status === 'approved') {
              // Status is already approved, proceed with non-financial update (just update updatedAt)
              const [updated] = await tx.update(rewardRedemptions)
                  .set({ updatedAt: new Date() })
                  .where(eq(rewardRedemptions.id, id))
                  .returning();
              return updated;
          }
          
          // Catch all for impossible or invalid status moves that were not caught above
          else {
              tx.rollback();
              throw new Error(`Invalid status transition from '${currentStatus}' to '${status}'.`);
          }
      });
      
      // 5. Return success
      res.json({
        success: true,
        message: `${tableName} status updated to '${updatedRecord.status}' successfully.`,
        data: updatedRecord,
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      
      console.error(`PATCH ${tableName} error:`, error);
      
      // Handle the transaction rollback error if mason or balance check failed
      const msg = (error as Error)?.message ?? '';
      if (msg.includes('Invalid status transition') || msg.includes('Mason ID')) {
         return res.status(400).json({ success: false, error: msg });
      }
      
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName} status.`,
      });
    }
  });

  console.log('✅ Reward Redemptions PATCH (Debit/Fulfillment) endpoint setup complete');
}