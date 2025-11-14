// server/src/routes/updateRoutes/rewardsRedemption.ts
// Reward Redemption PATCH endpoint for TSO/Admin fulfillment status update

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewardRedemptions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

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

      // 1. Get Authenticated User ID (from requireAuth/tsoAuth middleware)
      // The tsoAuth middleware has already verified this user is authorized.
      if (!req.auth || !req.auth.sub) {
        return res.status(401).json({ success: false, error: "Authentication details missing. tsoAuth middleware must be applied." });
      }
      // We can log this ID for auditing, though the schema doesn't have a 'fulfilledBy' column
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
      
      // OPTIONAL IMPROVEMENT: Add status flow validation here (e.g., cannot go from 'delivered' back to 'shipped')
      if (existingRecord.status === 'delivered' && status !== 'delivered') {
         return res.status(400).json({ success: false, error: 'Cannot change status of an already delivered item.' });
      }

      // 4. Perform the update
      // We don't need a transaction since this is only a status update (no ledger changes here)
      const [updatedRecord] = await db
        .update(rewardRedemptions)
        .set({
            status: status,
            // fulfillmentNotes: fulfillmentNotes ?? null, // <-- Add this line IF you add the column to your schema
            updatedAt: new Date(),
        })
        .where(eq(rewardRedemptions.id, id))
        .returning();

      // Note: 'fulfillmentNotes' was not added to .set() because it's missing from the 'rewardRedemptions' table in your provided schema.ts.
      // If you add that column to your schema, uncomment the 'fulfillmentNotes' line above.

      // 5. Return success
      res.json({
        success: true,
        message: `${tableName} status updated to '${updatedRecord.status}' by User ${authenticatedUserId}.`,
        data: updatedRecord,
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error(`PATCH ${tableName} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName} status.`,
      });
    }
  });

  console.log('✅ Reward Redemptions PATCH (Fulfillment) endpoint setup complete');
}