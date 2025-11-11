// src/routes/dataFetchingRoutes/rewardCategories.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewardCategories } from '../../db/schema'; // Import the table
import { eq, and, desc, asc, SQL, ilike } from 'drizzle-orm';

type TableLike = typeof rewardCategories;

/**
 * Sets up GET routes for the reward_categories table.
 *
 * 1. GET /api/reward-categories
 * - Optional query params: ?limit=... & ?page=... & ?search=... & ?sortBy=...
 * - Returns a paginated and filtered list of all reward categories.
 *
 * 2. GET /api/reward-categories/:id
 * - Returns a single category by its ID.
 */
export default function setupRewardCategoriesGetRoutes(app: Express) {

  // Helper to build WHERE clause for filtering (only 'name' search for this table)
  const buildWhere = (q: any): SQL | undefined => {
    const conds: SQL[] = [];

    // Search filter on 'name'
    if (q.search) {
        const s = `%${String(q.search).trim()}%`;
        conds.push(ilike(rewardCategories.name, s));
    }

    if (conds.length === 0) return undefined;
    return conds.length === 1 ? conds[0] : and(...conds);
  };

  // Helper to build ORDER BY clause
  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';

    switch (sortByRaw) {
        case 'name':
            return direction === 'asc' ? asc(rewardCategories.name) : desc(rewardCategories.name);
        case 'id':
            return direction === 'asc' ? asc(rewardCategories.id) : desc(rewardCategories.id);
        default:
            // Default sort by name ascending for lookup tables
            return asc(rewardCategories.name); 
    }
  };

  // 1. GET ALL (with pagination, search, and sorting)
  app.get('/api/reward-categories', async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCondition = buildWhere(filters);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let query = db.select().from(rewardCategories).$dynamic();
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const data = await query
        .orderBy(orderExpr)
        .limit(lmt)
        .offset(offset);
      
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });

    } catch (error) {
      console.error(`Get Reward Categories error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch reward categories`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 2. GET BY ID
  app.get('/api/reward-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid Category ID.' });
      }

      const [record] = await db.select()
        .from(rewardCategories)
        .where(eq(rewardCategories.id, id))
        .limit(1);
      
      if (!record) {
        return res.status(404).json({ success: false, error: 'Reward Category not found' });
      }
      
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get Reward Category by ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch reward category`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Reward Categories GET endpoints setup complete');
}