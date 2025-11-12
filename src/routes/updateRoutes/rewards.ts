// server/src/routes/updateRoutes/rewards.ts
// Rewards PATCH endpoint for updating catalogue items (Admin/TSO)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewards, insertRewardsSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const rewardPatchSchema = insertRewardsSchema.omit({
    id: true, 
    createdAt: true, 
    updatedAt: true,
}).partial().extend({
    categoryId: z.preprocess(
        (v) => (typeof v === 'string' ? parseInt(v, 10) : v), 
        z.number().int().positive('Category ID must be a positive integer.').optional()
    ),
    pointCost: z.coerce.number().int().positive('Point cost must be a positive integer.').optional(),
    totalAvailableQuantity: z.coerce.number().int().nonnegative('Total quantity cannot be negative.').optional(),
    stock: z.coerce.number().int().nonnegative('Stock cannot be negative.').optional(),
    meta: z.any().optional().nullable(),
    isActive: z.boolean().optional(),
}).strict();


export default function setupRewardsPatchRoute(app: Express) {
  
  app.patch('/api/rewards/:id', async (req: Request, res: Response) => {
    const tableName = 'Reward';
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid Reward ID.' });

      const input = rewardPatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update were provided.' });
      }

      const [existingRecord] = await db.select({ id: rewards.id })
        .from(rewards)
        .where(eq(rewards.id, id))
        .limit(1);

      if (!existingRecord) {
        return res.status(404).json({ success: false, error: `${tableName} with ID '${id}' not found.` });
      }

      const patchData: any = {};
      Object.assign(patchData, input);
      if (input.meta !== undefined) {
         patchData.meta = input.meta ? JSON.stringify(input.meta) : null;
      }
      
      patchData.updatedAt = new Date();

      const [updatedRecord] = await db
        .update(rewards)
        .set(patchData)
        .where(eq(rewards.id, id))
        .returning();

      return res.json({
        success: true,
        message: `${tableName} updated successfully`,
        data: updatedRecord,
      });

    } catch (err: any) {
      console.error(`PATCH ${tableName} error:`, err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
      }
      
      const msg = String(err?.message ?? '').toLowerCase();
      
      if (err?.code === '23505' || msg.includes('unique constraint')) {
        return res.status(409).json({ success: false, error: 'Reward name already exists' });
      }
      if (err?.code === '23503' || msg.includes('foreign key constraint')) {
        return res.status(400).json({ success: false, error: 'Foreign key violation: Invalid categoryId.', details: err?.detail });
      }

      return res.status(500).json({ 
        success: false, 
        error: `Failed to update ${tableName}`, 
      });
    }
  });

  console.log('✅ Rewards PATCH endpoint setup complete');
}