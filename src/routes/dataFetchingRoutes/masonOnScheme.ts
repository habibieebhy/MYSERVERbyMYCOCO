// server/src/routes/dataFetchingRoutes/masonOnScheme.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonOnScheme, masonPcSide, schemesOffers } from '../../db/schema';
import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Sets up GET routes for the MasonsOnScheme join table.
 *
 * 1. GET /api/masons-on-scheme
 * - Optional query params: ?masonId=... OR ?schemeId=... OR ?status=...
 * - Returns a list of join table entries with mason and scheme data.
 *
 * 2. GET /api/masons-on-scheme/mason/:masonId
 * - Returns all schemes a specific mason is enrolled in (joined with schemesOffers).
 *
 * 3. GET /api/masons-on-scheme/scheme/:schemeId
 * - Returns all masons enrolled in a specific scheme (joined with masonPcSide).
 */
export default function setupMasonsOnSchemeGetRoutes(app: Express) {

  // GET ALL (with filters for masonId, schemeId, or status)
  app.get('/api/masons-on-scheme', async (req: Request, res: Response) => {
    try {
      const { masonId, schemeId, status, limit = '50', sortBy = 'enrolledAt', sortDir = 'desc' } = req.query;

      let whereCondition: SQL | undefined = undefined;

      if (masonId) {
        whereCondition = eq(masonOnScheme.masonId, masonId as string);
      }

      if (schemeId) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(masonOnScheme.schemeId, schemeId as string))
          : eq(masonOnScheme.schemeId, schemeId as string);
      }

      if (status) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(masonOnScheme.status, status as string))
          : eq(masonOnScheme.status, status as string);
      }

      const orderField = sortBy === 'enrolledAt' ? masonOnScheme.enrolledAt : masonOnScheme.enrolledAt;
      const orderDirection = (sortDir as string).toLowerCase() === 'asc' ? asc : desc;

      let query = db.select()
        .from(masonOnScheme)
        .leftJoin(masonPcSide, eq(masonOnScheme.masonId, masonPcSide.id))
        .leftJoin(schemesOffers, eq(masonOnScheme.schemeId, schemesOffers.id))
        .$dynamic();
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const records = await query
        .orderBy(orderDirection(orderField))
        .limit(parseInt(limit as string));
      
      // Returns full join structure: { masonOnScheme, masonPcSide, schemesOffers }
      res.json({ success: true, data: records });

    } catch (error) {
      console.error(`Get MasonsOnScheme error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch MasonsOnScheme`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Mason ID (Get all schemes for a mason)
  app.get('/api/masons-on-scheme/mason/:masonId', async (req: Request, res: Response) => {
    try {
      const { masonId } = req.params;
      const { status, limit = '50', sortBy = 'enrolledAt', sortDir = 'desc' } = req.query;

      if (!masonId) {
        return res.status(400).json({ success: false, error: 'Mason ID is required.' });
      }

      let whereCondition: (SQL | undefined) = eq(masonOnScheme.masonId, masonId);

      if (status) {
        whereCondition = and(whereCondition, eq(masonOnScheme.status, status as string));
      }

      const orderField = masonOnScheme.enrolledAt;
      const orderDirection = (sortDir as string).toLowerCase() === 'asc' ? asc : desc;
      
      // Join with schemesOffers to get scheme details
      const records = await db.select()
        .from(masonOnScheme)
        .leftJoin(schemesOffers, eq(masonOnScheme.schemeId, schemesOffers.id))
        .where(whereCondition)
        .orderBy(orderDirection(orderField))
        .limit(parseInt(limit as string));

      // Flatten structure to return the join record + the scheme object
      res.json({ 
        success: true, 
        data: records.map(r => ({ ...r.mason_on_scheme, scheme: r.schemes_offers })) 
      });

    } catch (error) {
      console.error(`Get MasonsOnScheme by Mason ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch schemes for mason`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Scheme ID (Get all masons for a scheme)
  app.get('/api/masons-on-scheme/scheme/:schemeId', async (req: Request, res: Response) => {
    try {
      const { schemeId } = req.params;
      const { status, limit = '50', sortBy = 'enrolledAt', sortDir = 'desc' } = req.query;

      if (!schemeId) {
        return res.status(400).json({ success: false, error: 'Scheme ID is required.' });
      }
      
      let whereCondition: (SQL | undefined) = eq(masonOnScheme.schemeId, schemeId);

      if (status) {
        whereCondition = and(whereCondition, eq(masonOnScheme.status, status as string));
      }

      const orderField = masonOnScheme.enrolledAt;
      const orderDirection = (sortDir as string).toLowerCase() === 'asc' ? asc : desc;

      // Join with masonPcSide to get mason details
      const records = await db.select()
        .from(masonOnScheme)
        .leftJoin(masonPcSide, eq(masonOnScheme.masonId, masonPcSide.id))
        .where(whereCondition)
        .orderBy(orderDirection(orderField))
        .limit(parseInt(limit as string));

      // Flatten structure to return the join record + the mason object
      res.json({ 
        success: true, 
        data: records.map(r => ({ ...r.mason_on_scheme, mason: r.mason_pc_side }))
      });

    } catch (error) {
      console.error(`Get MasonsOnScheme by Scheme ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch masons for scheme`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Masons On Scheme GET endpoints setup complete');
}