// server/src/routes/updateRoutes/brands.ts
// Endpoint for partially updating a Brand.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { brands, insertBrandSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a partial schema for validation, only allowing the 'name' field to be updated.
const brandUpdateSchema = insertBrandSchema.pick({ name: true });

export default function setupBrandsPatchRoutes(app: Express) {
  
  // PATCH /api/brands/:id
  app.patch('/api/brands/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid brand ID.' });
      }
      
      // 1. Validate the incoming data
      const validatedData = brandUpdateSchema.parse(req.body);

      // 2. Check if the brand exists
      const [existingBrand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);

      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          error: `Brand with ID '${id}' not found.`,
        });
      }

      // 3. Perform the update
      const [updatedBrand] = await db
        .update(brands)
        .set({
          name: validatedData.name,
        })
        .where(eq(brands.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Brand updated successfully',
        data: updatedBrand,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      
      console.error('Update Brand error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update brand',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Brands PATCH endpoints setup complete');
}
