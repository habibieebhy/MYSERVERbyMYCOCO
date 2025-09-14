// server/src/routes/updateRoutes/BrandMapping.ts
// Endpoint for partially updating a Dealer Brand Mapping.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealerBrandMapping, insertDealerBrandMappingSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Create a partial schema for validation, only allowing 'capacityMT' to be updated.
const mappingUpdateSchema = insertDealerBrandMappingSchema.pick({ capacityMT: true });

export default function setupDealerBrandMappingPatchRoutes(app: Express) {
  
  // PATCH /api/dealer-brand-mapping/:id
  app.patch('/api/dealer-brand-mapping/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate the incoming data
      const validatedData = mappingUpdateSchema.parse(req.body);

      // 2. Check if the mapping exists
      const [existingMapping] = await db.select().from(dealerBrandMapping).where(eq(dealerBrandMapping.id, id)).limit(1);

      if (!existingMapping) {
        return res.status(404).json({
          success: false,
          error: `Dealer Brand Mapping with ID '${id}' not found.`,
        });
      }

      // 3. Perform the update
      const [updatedMapping] = await db
        .update(dealerBrandMapping)
        .set({
          capacityMT: validatedData.capacityMT,
        })
        .where(eq(dealerBrandMapping.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Dealer Brand Mapping updated successfully',
        data: updatedMapping,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      
      console.error('Update Dealer Brand Mapping error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update Dealer Brand Mapping',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Dealer Brand Mapping PATCH endpoints setup complete');
}
