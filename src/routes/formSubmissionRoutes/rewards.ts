// server/src/routes/formSubmissionRoutes/rewards.ts
// Rewards POST endpoint for adding new catalogue items (Admin/TSO)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewards, insertRewardsSchema } from '../../db/schema';
import { z } from 'zod';

// --- Zod schema for new reward item ---
const newRewardSchema = insertRewardsSchema.omit({
    id: true, 
    createdAt: true, 
    updatedAt: true,
}).extend({
    // Coerce categoryId from string to number
    categoryId: z.preprocess(
        (v) => (typeof v === 'string' ? parseInt(v, 10) : v), 
        z.number().int().positive('Category ID must be a positive integer.')
    ),
    // Numeric fields for point cost and quantity/stock
    pointCost: z.coerce.number().int().positive('Point cost must be a positive integer.'),
    totalAvailableQuantity: z.coerce.number().int().nonnegative('Total quantity cannot be negative.'),
    stock: z.coerce.number().int().nonnegative('Stock cannot be negative.'),
    // Meta is jsonb, allow object or stringified json
    meta: z.any().optional().nullable(),
    isActive: z.boolean().optional().default(true),
}).strict();


export default function setupRewardsPostRoute(app: Express) {
  
  app.post('/api/rewards', async (req: Request, res: Response) => {
    const tableName = 'Reward';
    try {
      const input = newRewardSchema.parse(req.body);

      const [newRecord] = await db
        .insert(rewards)
        .values({
          ...input,
          // Drizzle needs JSON objects or strings for JSONB.
          meta: input.meta ? JSON.stringify(input.meta) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: `${tableName} added to catalogue successfully`,
        data: newRecord,
      });

    } catch (err: any) {
      console.error(`Create ${tableName} error:`, err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: err.errors
        });
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
        error: `Failed to create ${tableName}`, 
        details: err?.message ?? 'Unknown error' 
      });
    }
  });

  console.log('✅ Rewards POST endpoint setup complete');
}