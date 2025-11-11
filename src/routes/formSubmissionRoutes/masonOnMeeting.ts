// server/src/routes/formSubmissionRoutes/masonOnMeeting.ts
// Handles POST /api/masons-on-meetings
// Adds a mason to a meeting, creating a new record in the join table.

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonsOnMeetings } from '../../db/schema';
import { z } from 'zod';

// Zod schema for validating the request body.
// We only need the two IDs for the join table.
// 'attendedAt' has a defaultNow() in the database.
const insertMasonsOnMeetingsSchema = z.object({
  masonId: z.string().uuid("Invalid Mason ID format. Expected UUID."),
  meetingId: z.string().min(1, "Meeting ID is required."),
});

export default function setupMasonOnMeetingPostRoutes(app: Express) {
  
  app.post('/api/masons-on-meetings', async (req: Request, res: Response) => {
    const tableName = 'Mason on Meeting';
    try {
      // 1. Validate the request body
      const validated = insertMasonsOnMeetingsSchema.parse(req.body);

      // 2. Insert the new record
      // 'attendedAt' will be set by the database default
      const [newRecord] = await db
        .insert(masonsOnMeetings)
        .values({
          masonId: validated.masonId,
          meetingId: validated.meetingId,
        })
        .returning();

      // 3. Send success response
      return res.status(201).json({
        success: true,
        message: `${tableName} relationship created successfully`,
        data: newRecord,
      });

    } catch (err: any) {
      // 4. Handle errors
      console.error(`Create ${tableName} error:`, {
        message: err?.message,
        code: err?.code, // SQLSTATE (e.g., 23505 for duplicate, 23503 for FK)
        constraint: err?.constraint,
        detail: err?.detail,
      });

      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: err.errors 
        });
      }

      const msg = String(err?.message ?? '').toLowerCase();
      
      // Handle Duplicate Key (Composite PK) - SQLSTATE 23505
      if (err?.code === '23505' || msg.includes('duplicate key') || msg.includes('masons_on_meetings_pkey')) {
        return res.status(409).json({ // 409 Conflict
          success: false, 
          error: 'This mason is already marked as attended for this meeting' 
        });
      }

      // Handle Foreign Key Violation - SQLSTATE 23503
      if (err?.code === '23503' || msg.includes('foreign key constraint')) {
        return res.status(400).json({ // 400 Bad Request
          success: false, 
          error: 'Foreign key violation: The specified mason or meeting does not exist',
          details: err?.detail ?? err?.message 
        });
      }

      // Handle other database or server errors
      return res.status(500).json({ 
        success: false, 
        error: `Failed to create ${tableName}`, 
        details: err?.message ?? 'Unknown error' 
      });
    }
  });

  console.log('✅ Masons on Meetings POST endpoint setup complete');
}