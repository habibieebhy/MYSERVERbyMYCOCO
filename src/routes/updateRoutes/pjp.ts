// server/src/routes/updateRoutes/pjp.ts
// PJP PATCH — coercions, date-only normalization, safe field updates

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// helpers
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const emptyToNull = (s: unknown) =>
  typeof s === 'string' && s.trim() === '' ? null : (s as string | null);

// PATCH schema: only updatable columns, with coercions
const pjpPatchSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  planDate: z.coerce.date().optional(),           // coerced, later normalized
  areaToBeVisited: z.string().max(500).optional(),
  description: z.string().optional().nullable(),  // we'll empty->null below
  status: z.string().max(50).optional(),
}).strict();

export default function setupPjpPatchRoutes(app: Express) {
  // PATCH /api/pjp/:id
  app.patch('/api/pjp/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 1) validate + coerce
      const input = pjpPatchSchema.parse(req.body);

      // Nothing to update?
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update were provided.' });
      }

      // 2) ensure exists
      const [existing] = await db
        .select()
        .from(permanentJourneyPlans)
        .where(eq(permanentJourneyPlans.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `Permanent Journey Plan with ID '${id}' not found.`,
        });
      }

      // 3) build patch safely
      const patch: any = {};

      if (input.userId !== undefined) patch.userId = input.userId;
      if (input.createdById !== undefined) patch.createdById = input.createdById;

      if (input.planDate !== undefined) {
        // normalize to DATE-only for Postgres DATE column
        patch.planDate = toDateOnly(input.planDate);
      }

      if (input.areaToBeVisited !== undefined) patch.areaToBeVisited = input.areaToBeVisited;

      if (input.description !== undefined) {
        patch.description = emptyToNull(input.description ?? null);
      }

      if (input.status !== undefined) patch.status = input.status;

      patch.updatedAt = new Date(); // always touch updatedAt

      // 4) update
      const [updated] = await db
        .update(permanentJourneyPlans)
        .set(patch)
        .where(eq(permanentJourneyPlans.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'Permanent Journey Plan updated successfully',
        data: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      console.error('Update PJP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update Permanent Journey Plan',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ PJP PATCH endpoints setup complete');
}
