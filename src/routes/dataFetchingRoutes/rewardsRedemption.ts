// server/src/routes/dataFetchingRoutes/rewardsRedemption.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { rewardRedemptions, masonPcSide, rewards, users } from '../../db/schema';
import { eq, and, desc, asc, SQL, getTableColumns, sql } from 'drizzle-orm';

export default function setupRewardsRedemptionGetRoutes(app: Express) {
  const endpoint = 'rewards-redemption';
  const table = rewardRedemptions;
  const tableName = 'Reward Redemption';

  const numberish = (v: unknown) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  
  const buildWhere = (q: any): SQL | undefined => {
    const conds: SQL[] = [];
    if (q.masonId) { conds.push(eq(table.masonId, String(q.masonId))); }
    const rewardId = numberish(q.rewardId);
    if (rewardId !== undefined) { conds.push(eq(table.rewardId, rewardId)); }
    if (q.status) { conds.push(eq(table.status, String(q.status))); }
    const minPoints = numberish(q.minPoints);
    if (minPoints !== undefined) conds.push(sql`${table.pointsDebited} >= ${minPoints}`);

    if (conds.length === 0) return undefined;
    return conds.length === 1 ? conds[0] : and(...conds);
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
      const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
      switch (sortByRaw) {
          case 'pointsDebited': return direction === 'asc' ? asc(table.pointsDebited) : desc(table.pointsDebited);
          case 'status': return direction === 'asc' ? asc(table.status) : desc(table.status);
          case 'rewardId': return direction === 'asc' ? asc(table.rewardId) : desc(table.rewardId);
          case 'createdAt':
          default: return desc(table.createdAt);
      }
  };

  const listHandler = async (req: Request, res: Response, baseWhere?: SQL) => {
    try {
        const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
        const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
        const pg = Math.max(1, parseInt(String(page), 10) || 1);
        const offset = (pg - 1) * lmt;

        const extra = buildWhere(filters);
        
        const conds: SQL[] = [];
        if (baseWhere) conds.push(baseWhere);
        if (extra) conds.push(extra);
        
        const whereCondition: SQL | undefined = conds.length > 0 ? and(...conds) : undefined;
        const orderExpr = buildSort(String(sortBy), String(sortDir));

        let query = db.select({
            ...getTableColumns(table),
            masonName: masonPcSide.name,
            rewardName: rewards.itemName,
        })
        .from(table)
        .leftJoin(masonPcSide, eq(table.masonId, masonPcSide.id))
        .leftJoin(rewards, eq(table.rewardId, rewards.id))
        .$dynamic();

        if (whereCondition) {
            query = query.where(whereCondition);
        }

        const data = await query
            .orderBy(orderExpr)
            .limit(lmt)
            .offset(offset);

        res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
        console.error(`Get ${tableName} list error:`, error);
        res.status(500).json({ success: false, error: `Failed to fetch ${tableName} entries` });
    }
  };

  // 1. GET ALL (TSO/Admin Order List)
  app.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));

  // 2. GET BY ID
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
      try {
          const { id } = req.params;
          const [record] = await db.select({
              ...getTableColumns(table),
              masonName: masonPcSide.name,
              rewardName: rewards.itemName,
          })
            .from(table)
            .leftJoin(masonPcSide, eq(table.masonId, masonPcSide.id))
            .leftJoin(rewards, eq(table.rewardId, rewards.id))
            .where(eq(table.id, id))
            .limit(1);

          if (!record) {
              return res.status(404).json({ success: false, error: `${tableName} entry not found` });
          }
          res.json({ success: true, data: record });
      } catch (error) {
          console.error(`Get ${tableName} by ID error:`, error);
          res.status(500).json({ success: false, error: `Failed to fetch ${tableName} entry` });
      }
  });

  // 3. GET BY MASON ID (Mason's Order History)
  app.get(`/api/${endpoint}/mason/:masonId`, (req, res) => {
      const { masonId } = req.params;
      if (!masonId) { return res.status(400).json({ success: false, error: 'Mason ID is required.' }); }
      const base = eq(table.masonId, masonId);
      return listHandler(req, res, base);
  });

  console.log('✅ Reward Redemptions GET endpoints (Order History) setup complete');
}