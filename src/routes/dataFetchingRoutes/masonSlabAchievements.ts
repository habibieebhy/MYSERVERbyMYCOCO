// server/src/routes/dataFetchingRoutes/masonSlabAchievements.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonSlabAchievements, masonPcSide, schemeSlabs, schemesOffers } from '../../db/schema';
import { eq, and, desc, asc, SQL, getTableColumns } from 'drizzle-orm';

export default function setupMasonSlabAchievementsGetRoutes(app: Express) {
  const endpoint = 'mason-slab-achievements';
  const tableName = 'Mason Slab Achievement';

  // Helper for Sorting
  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    switch (sortByRaw) {
      case 'pointsAwarded':
        return direction === 'asc' ? asc(masonSlabAchievements.pointsAwarded) : desc(masonSlabAchievements.pointsAwarded);
      case 'achievedAt':
      default:
        return direction === 'asc' ? asc(masonSlabAchievements.achievedAt) : desc(masonSlabAchievements.achievedAt);
    }
  };

  // 1. GET ALL (With Filters)
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { masonId, schemeId, limit = '50', page = '1', sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      // Build Query Conditions
      const conditions: (SQL | undefined)[] = [];
      
      if (masonId) {
        conditions.push(eq(masonSlabAchievements.masonId, String(masonId)));
      }
      // Note: We filter by Scheme via the Joined Table (schemeSlabs)
      if (schemeId) {
        conditions.push(eq(schemeSlabs.schemeId, String(schemeId)));
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // Construct Query with Joins
      // We join: Achievement -> Mason -> Slab -> Scheme (to get the scheme Name)
      let query = db.select({
          ...getTableColumns(masonSlabAchievements),
          masonName: masonPcSide.name,
          slabDescription: schemeSlabs.slabDescription,
          pointsConfigured: schemeSlabs.pointsEarned,
          schemeName: schemesOffers.name, // Very useful for UI
        })
        .from(masonSlabAchievements)
        .leftJoin(masonPcSide, eq(masonSlabAchievements.masonId, masonPcSide.id))
        .leftJoin(schemeSlabs, eq(masonSlabAchievements.schemeSlabId, schemeSlabs.id))
        .leftJoin(schemesOffers, eq(schemeSlabs.schemeId, schemesOffers.id)) // Grandparent join
        .$dynamic();

      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // 2. GET BY MASON ID
  app.get(`/api/${endpoint}/mason/:masonId`, async (req: Request, res: Response) => {
    try {
      const { masonId } = req.params;
      if (!masonId) return res.status(400).json({ success: false, error: 'Mason ID required' });

      const records = await db.select({
          ...getTableColumns(masonSlabAchievements),
          slabDescription: schemeSlabs.slabDescription,
          schemeName: schemesOffers.name,
        })
        .from(masonSlabAchievements)
        .leftJoin(schemeSlabs, eq(masonSlabAchievements.schemeSlabId, schemeSlabs.id))
        .leftJoin(schemesOffers, eq(schemeSlabs.schemeId, schemesOffers.id))
        .where(eq(masonSlabAchievements.masonId, masonId))
        .orderBy(desc(masonSlabAchievements.achievedAt));

      res.json({ success: true, count: records.length, data: records });
    } catch (error) {
      console.error(`Get ${tableName} by Mason ID error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName} for mason` });
    }
  });

  console.log(`✅ ${tableName} GET endpoints setup complete`);
}