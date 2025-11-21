// server/src/routes/formSubmissionRoutes/schemeSlabs.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { schemeSlabs } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Zod Schema for validation
// We allow nulls for minBags because a slab might be purely time-based or manual in future cases,
// though typically for your app, one of them should be present.
const insertSchemeSlabSchema = z.object({
  schemeId: z.string().uuid("Invalid Scheme ID."),
  minBagsBest: z.number().int().positive().optional().nullable(),
  minBagsOthers: z.number().int().positive().optional().nullable(),
  pointsEarned: z.number().int().nonnegative("Points cannot be negative."),
  slabDescription: z.string().max(255).optional().nullable(),
  rewardId: z.number().int().optional().nullable(), // Optional link to a specific reward item
});

export default function setupSchemeSlabsPostRoute(app: Express) {
  
  app.post('/api/scheme-slabs', async (req: Request, res: Response) => {
    const tableName = 'Scheme Slab';

    try {
      // 1. Validate Input
      const validated = insertSchemeSlabSchema.parse(req.body);

      // 2. Simple Insert (No Transaction needed)
      const [newSlab] = await db.insert(schemeSlabs)
        .values({
          id: randomUUID(),
          schemeId: validated.schemeId,
          minBagsBest: validated.minBagsBest ?? null,
          minBagsOthers: validated.minBagsOthers ?? null,
          pointsEarned: validated.pointsEarned,
          slabDescription: validated.slabDescription ?? null,
          rewardId: validated.rewardId ?? null,
        })
        .returning();

      // 3. Success Response
      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully.`,
        data: newSlab,
      });

    } catch (err: any) {
      console.error(`Create ${tableName} error:`, err);

      // Handle Zod Errors
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: err.errors 
        });
      }

      const msg = String(err?.message ?? '').toLowerCase();

      // Handle Foreign Key Violation (e.g., Bad Scheme ID or Bad Reward ID)
      if (err?.code === '23503' || msg.includes('foreign key constraint')) {
        let field = 'scheme or reward';
        if (msg.includes('scheme_id')) field = 'Scheme ID';
        if (msg.includes('reward_id')) field = 'Reward ID';
        
        return res.status(400).json({ 
          success: false, 
          error: `Invalid ${field}. The referenced record does not exist.` 
        });
      }

      return res.status(500).json({ 
        success: false, 
        error: `Failed to create ${tableName}.`, 
        details: err?.message 
      });
    }
  });

  console.log('✅ Scheme Slabs POST endpoint setup complete');
}