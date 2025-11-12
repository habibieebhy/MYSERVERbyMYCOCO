// server/src/routes/dataFetchingRoutes/rewards.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewards, rewardCategories } from '../../db/schema'; 
import { eq, and, desc, asc, ilike, SQL, getTableColumns } from 'drizzle-orm';

/**
 * Sets up GET routes for the rewards table (Reward Catalogue).
 * Joins with rewardCategories to display category names.
 */
export default function setupRewardsGetRoutes(app: Express) {
  const endpoint = 'rewards';
  const tableName = 'Reward';

  // Helper to build WHERE clause for filtering
  const buildWhere = (q: any): SQL | undefined => {
    const conds: SQL[] = [];
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(ilike(rewards.itemName, s));
    }
    if (q.categoryId) {
      const id = parseInt(q.categoryId as string, 10);
      if (!isNaN(id)) conds.push(eq(rewards.categoryId, id));
    }
    if (q.isActive === 'true' || q.isActive === true) {
        conds.push(eq(rewards.isActive, true));
    } else if (q.isActive === 'false' || q.isActive === false) {
        conds.push(eq(rewards.isActive, false));
    }
    if (conds.length === 0) return undefined;
    return conds.length === 1 ? conds[0] : and(...conds);
  };

  // Helper to build ORDER BY clause
  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    switch (sortByRaw) {
      case 'pointCost':
        return direction === 'asc' ? asc(rewards.pointCost) : desc(rewards.pointCost);
      case 'stock':
        return direction === 'asc' ? asc(rewards.stock) : desc(rewards.stock);
      case 'itemName':
      default:
        return asc(rewards.itemName); 
    }
  };

  // 1. GET ALL (Reward Catalogue)
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCondition = buildWhere(filters);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let query = db.select({
        ...getTableColumns(rewards),
        categoryName: rewardCategories.name,
      })
      .from(rewards)
      .leftJoin(rewardCategories, eq(rewards.categoryId, rewardCategories.id))
      .$dynamic();
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const data = await query
        .orderBy(orderExpr)
        .limit(lmt)
        .offset(offset);
      
      // FIX: The select query already flattens all columns into the result object, so return 'data' directly.
      const result = data;

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data: result });

    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // 2. GET BY ID
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid Reward ID.' });

      const [record] = await db.select({
        ...getTableColumns(rewards),
        categoryName: rewardCategories.name,
      })
        .from(rewards)
        .leftJoin(rewardCategories, eq(rewards.categoryId, rewardCategories.id))
        .where(eq(rewards.id, id))
        .limit(1);
      
      if (!record) return res.status(404).json({ success: false, error: 'Reward not found' });
      
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} by ID error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
    }
  });

  console.log('✅ Rewards GET endpoints (Catalogue) setup complete');
}