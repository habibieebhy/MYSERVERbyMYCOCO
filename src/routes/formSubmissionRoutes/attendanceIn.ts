// server/src/routes/postRoutes/attendanceIn.ts
// Attendance Check-In POST endpoints

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesmanAttendance } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for validation
const attendanceInSchema = z.object({
  userId: z.number(),
  attendanceDate: z.string().date().or(z.string()), // accept Date or ISO string
  locationName: z.string().min(1),
  inTimeImageCaptured: z.boolean().optional(),
  inTimeImageUrl: z.string().optional().nullable(),
  inTimeLatitude: z.number(),
  inTimeLongitude: z.number(),
  inTimeAccuracy: z.number().optional().nullable(),
  inTimeSpeed: z.number().optional().nullable(),
  inTimeHeading: z.number().optional().nullable(),
  inTimeAltitude: z.number().optional().nullable(),
});

export default function setupAttendanceInPostRoutes(app: Express) {
  // ATTENDANCE CHECK-IN
  app.post('/api/attendance/check-in', async (req: Request, res: Response) => {
    try {
      // Validate input
      const parsed = attendanceInSchema.parse(req.body);

      const {
        userId,
        attendanceDate,
        locationName,
        inTimeImageCaptured,
        inTimeImageUrl,
        inTimeLatitude,
        inTimeLongitude,
        inTimeAccuracy,
        inTimeSpeed,
        inTimeHeading,
        inTimeAltitude,
      } = parsed;

      // Ensure attendanceDate is Date
      const dateObj = new Date(attendanceDate);

      // Check if user already checked in today
      const [existingAttendance] = await db
        .select()
        .from(salesmanAttendance)
        .where(
          and(
            eq(salesmanAttendance.userId, userId),
            eq(salesmanAttendance.attendanceDate, dateObj)
          )
        )
        .limit(1);

      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          error: 'User has already checked in today',
        });
      }

      const attendanceData = {
        userId,
        attendanceDate: dateObj,
        locationName,
        inTimeTimestamp: new Date(),
        outTimeTimestamp: null,
        inTimeImageCaptured: inTimeImageCaptured ?? false,
        outTimeImageCaptured: false,
        inTimeImageUrl: inTimeImageUrl || null,
        outTimeImageUrl: null,
        inTimeLatitude,
        inTimeLongitude,
        inTimeAccuracy: inTimeAccuracy || null,
        inTimeSpeed: inTimeSpeed || null,
        inTimeHeading: inTimeHeading || null,
        inTimeAltitude: inTimeAltitude || null,
        outTimeLatitude: null,
        outTimeLongitude: null,
        outTimeAccuracy: null,
        outTimeSpeed: null,
        outTimeHeading: null,
        outTimeAltitude: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newAttendance] = await db
        .insert(salesmanAttendance)
        .values(attendanceData)
        .returning();

      res.status(201).json({
        success: true,
        message: 'Check-in successful',
        data: newAttendance,
      });
    } catch (error) {
      console.error('Attendance check-in error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to check in',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Attendance Check-In POST endpoints setup complete');
}