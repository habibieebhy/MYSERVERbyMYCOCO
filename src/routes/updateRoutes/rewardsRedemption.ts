// server/src/routes/updateRoutes/rewardsRedemption.ts
// Reward Redemption PATCH endpoint for TSO/Admin fulfillment status update

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewardRedemptions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const redemptionFulfillmentSchema = z.object({
  status: z.enum(['approved', 'shipped', 'delivered', 'rejected']),
  fulfillmentNotes: z.string().max(500).optional().nullable(),
}).strict();


export default function setupRewardsRedemptionPatchRoute(app: Express) {
  
  app.patch('/api/rewards-redemption/:id', async (req: Request, res: Response) => {
    const tableName = 'Reward Redemption';
    try {
      const { id } = req.params;
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Redemption ID format. Expected UUID.' });
      }
      
      const input = redemptionFulfillmentSchema.parse(req.body);
      const [existingRecord] = await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }
      
      const { status, fulfillmentNotes } = input;

      const [updatedRecord] = await db
        .update(rewardRedemptions)
        .set({
            status: status,
            updatedAt: new Date(),
        })
        .where(eq(rewardRedemptions.id, id))
        .returning();

      res.json({
        success: true,
        // FIX: Remove [0] indexing. updatedRecord is the single object.
        message: `${tableName} status updated to '${updatedRecord.status}' (Fulfillment/Approval).`,
        data: updatedRecord, // FIX: Remove [0] indexing.
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