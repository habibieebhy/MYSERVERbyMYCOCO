// server/src/routes/dataFetchingRoutes/masonOnMeeting.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonsOnMeetings, masonPcSide, tsoMeetings } from '../../db/schema';
import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Sets up GET routes for the MasonsOnMeetings join table.
 * * 1. GET /api/masons-on-meetings
 * - Optional query params: ?masonId=... OR ?meetingId=...
 * - Returns a list of join table entries with mason and meeting data.
 *
 * 2. GET /api/masons-on-meetings/mason/:masonId
 * - Returns all meetings a specific mason attended (joined with tsoMeetings).
 *
 * 3. GET /api/masons-on-meetings/meeting/:meetingId
 * - Returns all masons who attended a specific meeting (joined with masonPcSide).
 */
export default function setupMasonsOnMeetingsGetRoutes(app: Express) {

  // GET ALL (with filters for masonId or meetingId)
  app.get('/api/masons-on-meetings', async (req: Request, res: Response) => {
    try {
      const { masonId, meetingId, limit = '50', sortBy = 'attendedAt', sortDir = 'desc' } = req.query;

      let whereCondition: SQL | undefined = undefined;

      if (masonId) {
        whereCondition = eq(masonsOnMeetings.masonId, masonId as string);
      }

      if (meetingId) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(masonsOnMeetings.meetingId, meetingId as string))
          : eq(masonsOnMeetings.meetingId, meetingId as string);
      }

      const orderField = sortBy === 'attendedAt' ? masonsOnMeetings.attendedAt : masonsOnMeetings.attendedAt;
      const orderDirection = (sortDir as string).toLowerCase() === 'asc' ? asc : desc;

      let query = db.select()
        .from(masonsOnMeetings)
        .leftJoin(masonPcSide, eq(masonsOnMeetings.masonId, masonPcSide.id))
        .leftJoin(tsoMeetings, eq(masonsOnMeetings.meetingId, tsoMeetings.id))
        .$dynamic();
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const records = await query
        .orderBy(orderDirection(orderField))
        .limit(parseInt(limit as string));
      
      // Returns full join structure: { masonsOnMeetings, masonPcSide, tsoMeetings }
      res.json({ success: true, data: records });

    } catch (error) {
      console.error(`Get MasonsOnMeetings error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch MasonsOnMeetings`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Mason ID (Get all meetings for a mason)
  app.get('/api/masons-on-meetings/mason/:masonId', async (req: Request, res: Response) => {
    try {
      const { masonId } = req.params;
      const { limit = '50', sortBy = 'attendedAt', sortDir = 'desc' } = req.query;

      if (!masonId) {
        return res.status(400).json({ success: false, error: 'Mason ID is required.' });
      }

      const orderField = masonsOnMeetings.attendedAt;
      const orderDirection = (sortDir as string).toLowerCase() === 'asc' ? asc : desc;
      
      // Join with tsoMeetings to get meeting details
      const records = await db.select()
        .from(masonsOnMeetings)
        .leftJoin(tsoMeetings, eq(masonsOnMeetings.meetingId, tsoMeetings.id))
        .where(eq(masonsOnMeetings.masonId, masonId))
        .orderBy(orderDirection(orderField))
        .limit(parseInt(limit as string));

      // Flatten structure to return the join record + the meeting object
      res.json({ 
        success: true, 
        data: records.map(r => ({ ...r.masons_on_meetings, meeting: r.tso_meetings })) 
      });

    } catch (error) {
      console.error(`Get MasonsOnMeetings by Mason ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch meetings for mason`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Meeting ID (Get all masons for a meeting)
  app.get('/api/masons-on-meetings/meeting/:meetingId', async (req: Request, res: Response) => {
    try {
      const { meetingId } = req.params;
      const { limit = '50', sortBy = 'attendedAt', sortDir = 'desc' } = req.query;

      if (!meetingId) {
        return res.status(400).json({ success: false, error: 'Meeting ID is required.' });
      }
      
      const orderField = masonsOnMeetings.attendedAt;
      const orderDirection = (sortDir as string).toLowerCase() === 'asc' ? asc : desc;

      // Join with masonPcSide to get mason details
      const records = await db.select()
        .from(masonsOnMeetings)
        .leftJoin(masonPcSide, eq(masonsOnMeetings.masonId, masonPcSide.id))
        .where(eq(masonsOnMeetings.meetingId, meetingId))
        .orderBy(orderDirection(orderField))
        .limit(parseInt(limit as string));

      // Flatten structure to return the join record + the mason object
      res.json({ 
        success: true, 
        data: records.map(r => ({ ...r.masons_on_meetings, mason: r.mason_pc_side }))
      });

    } catch (error) {
      console.error(`Get MasonsOnMeetings by Meeting ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch masons for meeting`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Masons On Meetings GET endpoints setup complete');
}