// server/src/routes/updateRoutes/tsoMeetings.ts
// TSO Meetings PATCH — partial updates, coercions

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { tsoMeetings } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// ---- helpers ----
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

const nullableNumber = z.coerce.number().positive().optional().nullable();

// --- Zod schema for PATCH (all optional) ---
const meetingPatchSchema = z
  .object({
    createdByUserId: z.coerce.number().int().positive().optional(),
    type: z.string().max(100).min(1).optional(),
    date: z.coerce.date().optional(),
    location: z.string().max(500).min(1).optional(),
    budgetAllocated: nullableNumber,
    participantsCount: z.coerce.number().int().positive().optional().nullable(),
  })
  .strict();

export default function setupTsoMeetingsPatchRoutes(app: Express) {
  app.patch('/api/tso-meetings/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 1) validate + coerce
      const input = meetingPatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      // 2) ensure exists
      const [existing] = await db.select({ id: tsoMeetings.id })
        .from(tsoMeetings)
        .where(eq(tsoMeetings.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, error: `Meeting with ID '${id}' not found.` });
      }
      
      // 3) build patch object safely
      const patch: any = {};
      
      if (input.createdByUserId !== undefined) patch.createdByUserId = input.createdByUserId;
      if (input.type !== undefined) patch.type = input.type;
      if (input.date !== undefined) patch.date = toDateOnly(input.date);
      if (input.location !== undefined) patch.location = input.location;
      if (input.participantsCount !== undefined) patch.participantsCount = input.participantsCount;

      // Handle numeric
      if (input.budgetAllocated !== undefined) {
         patch.budgetAllocated = input.budgetAllocated 
            ? String(input.budgetAllocated) 
            : null;
      }
      
      patch.updatedAt = new Date(); // always touch updatedAt

      // 4) update
      const [updated] = await db
        .update(tsoMeetings)
        .set(patch)
        .where(eq(tsoMeetings.id, id))
        .returning();

      return res.json({
        success: true,
        message: 'TSO Meeting updated successfully',
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
      console.error('Update TSO Meeting error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update TSO Meeting',
      });
    }
  });

  console.log('✅ TSO Meetings PATCH endpoint setup complete');
}