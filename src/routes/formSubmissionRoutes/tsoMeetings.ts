// server/src/routes/postRoutes/tsoMeetings.ts
// TSO Meetings POST — schema-accurate, coercions, app-generated id

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { tsoMeetings } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ---- helpers ----
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

const nullableNumber = z.coerce.number().positive().optional().nullable();

// --- Zod schema that matches the DB table ---
const meetingInputSchema = z
  .object({
    createdByUserId: z.coerce.number().int().positive(),
    type: z.string().max(100).min(1, "Type is required"),
    date: z.coerce.date(),
    location: z.string().max(500).min(1, "Location is required"),
    budgetAllocated: nullableNumber,
    participantsCount: z.coerce.number().int().positive().optional().nullable(),
  })
  .strict();

export default function setupTsoMeetingsPostRoutes(app: Express) {
  app.post('/api/tso-meetings', async (req: Request, res: Response) => {
    try {
      // 1) validate + coerce
      const input = meetingInputSchema.parse(req.body);

      // 2) map to insert
      const insertData = {
        id: randomUUID(), // App-generated UUID
        createdByUserId: input.createdByUserId,
        type: input.type,
        date: toDateOnly(input.date), // Normalize to YYYY-MM-DD
        location: input.location,
        
        // Handle numeric(12, 2) - Drizzle expects string
        budgetAllocated: input.budgetAllocated 
          ? String(input.budgetAllocated) 
          : null,
          
        participantsCount: input.participantsCount ?? null,
      };

      // 3) insert + return
      const [record] = await db.insert(tsoMeetings).values(insertData).returning();

      return res.status(201).json({
        success: true,
        message: 'TSO Meeting created successfully',
        data: record,
      });
    } catch (error) {
      console.error('Create TSO Meeting error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create TSO Meeting',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ TSO Meetings POST endpoints setup complete');
}