// server/src/routes/postRoutes/attendanceOut.ts
// Attendance Check-Out POST endpoints

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesmanAttendance } from '../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for validation
const attendanceOutSchema = z.object({
  userId: z.number(),
  attendanceDate: z.string().or(z.date()), // allow ISO string or Date
  outTimeImageCaptured: z.boolean().optional(),
  outTimeImageUrl: z.string().optional().nullable(),
  outTimeLatitude: z.number().optional().nullable(),
  outTimeLongitude: z.number().optional().nullable(),
  outTimeAccuracy: z.number().optional().nullable(),
  outTimeSpeed: z.number().optional().nullable(),
  outTimeHeading: z.number().optional().nullable(),
  outTimeAltitude: z.number().optional().nullable(),
});

export default function setupAttendanceOutPostRoutes(app: Express) {
  // ATTENDANCE CHECK-OUT
  app.post('/api/attendance/check-out', async (req: Request, res: Response) => {
    try {
      // Validate request
      const parsed = attendanceOutSchema.parse(req.body);

      const {
        userId,
        attendanceDate,
        outTimeImageCaptured,
        outTimeImageUrl,
        outTimeLatitude,
        outTimeLongitude,
        outTimeAccuracy,
        outTimeSpeed,
        outTimeHeading,
        outTimeAltitude,
      } = parsed;

      const dateObj = new Date(attendanceDate);

      // Find existing attendance record for today
      const [existingAttendance] = await db
        .select()
        .from(salesmanAttendance)
        .where(
          and(
            eq(salesmanAttendance.userId, userId),
            eq(salesmanAttendance.attendanceDate, dateObj),
            isNull(salesmanAttendance.outTimeTimestamp)
          )
        )
        .limit(1);

      if (!existingAttendance) {
        return res.status(404).json({
          success: false,
          error: 'No check-in record found for today or user has already checked out',
        });
      }

      const updateData = {
        outTimeTimestamp: new Date(),
        outTimeImageCaptured: outTimeImageCaptured ?? false,
        outTimeImageUrl: outTimeImageUrl || null,
        outTimeLatitude: outTimeLatitude || null,
        outTimeLongitude: outTimeLongitude || null,
        outTimeAccuracy: outTimeAccuracy || null,
        outTimeSpeed: outTimeSpeed || null,
        outTimeHeading: outTimeHeading || null,
        outTimeAltitude: outTimeAltitude || null,
        updatedAt: new Date(),
      };

      const [updatedAttendance] = await db
        .update(salesmanAttendance)
        .set(updateData)
        .where(eq(salesmanAttendance.id, existingAttendance.id))
        .returning();

      res.json({
        success: true,
        message: 'Check-out successful',
        data: updatedAttendance,
      });
    } catch (error) {
      console.error('Attendance check-out error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to check out',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Attendance Check-Out POST endpoints setup complete');
}