// server/src/routes/dataFetchingRoutes/pjp.ts
// Permanent Journey Plans GET endpoints (planDate-aware, status/user filters, pagination, sorting)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { and, asc, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';

type TableLike = typeof permanentJourneyPlans;

// -------- helpers --------
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const boolish = (v: unknown) => {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return undefined;
};

function createPJPAutoGET(app: Express, cfg: {
  endpoint: string;
  table: TableLike;
  tableName: string;
  dateField: 'planDate';
}) {
  const { endpoint, table, tableName, dateField } = cfg;

  // whitelisted sort keys
  const SORT_KEYS: Record<string, keyof typeof table> = {
    planDate: 'planDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    status: 'status',
    areaToBeVisited: 'areaToBeVisited',
  };

  const buildWhere = (q: any) => {
    const conds: any[] = [];

    // date range on planDate
    const { startDate, endDate } = q;
    if (startDate && endDate) {
      conds.push(and(
        gte(table[dateField], String(startDate)),
        lte(table[dateField], String(endDate))
      ));
    }

    // status (e.g., pending/completed/cancelled)
    if (q.status) conds.push(eq(table.status, String(q.status)));

    // completed=true is sugar for status=completed
    const completed = boolish(q.completed);
    if (completed === true) conds.push(eq(table.status, 'completed'));

    // assigned user
    const userId = numberish(q.userId);
    if (userId !== undefined) conds.push(eq(table.userId, userId));

    // creator
    const createdById = numberish(q.createdById);
    if (createdById !== undefined) conds.push(eq(table.createdById, createdById));

    // search by area/description (case-insensitive)
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(sql`(${ilike(table.areaToBeVisited, s)} OR ${ilike(table.description, s)})`);
    }

    return conds.length ? (conds.length === 1 ? conds[0] : and(...conds)) : undefined;
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const key = sortByRaw && SORT_KEYS[sortByRaw] ? SORT_KEYS[sortByRaw] : 'planDate';
    const dir = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    return dir === 'asc' ? asc(table[key]) : desc(table[key]);
  };

  // ===== GET ALL =====
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCond = buildWhere(filters);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table).orderBy(orderExpr).limit(lmt).offset(offset);
      if (whereCond) q = q.where(whereCond);

      const data = await q;
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ===== GET BY USER (assignee) =====
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.userId, parseInt(userId, 10));
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));
      const data = await db.select().from(table).where(whereCond).orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ===== GET BY CREATOR =====
  app.get(`/api/${endpoint}/created-by/:createdById`, async (req: Request, res: Response) => {
    try {
      const { createdById } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.createdById, parseInt(createdById, 10));
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));
      const data = await db.select().from(table).where(whereCond).orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Creator error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ===== GET BY STATUS =====
  app.get(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.status, status);
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));
      const data = await db.select().from(table).where(whereCond).orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Status error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ===== GET BY ID =====
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });
}

export default function setupPJPRoutes(app: Express) {
  createPJPAutoGET(app, {
    endpoint: 'pjp',
    table: permanentJourneyPlans,
    tableName: 'Permanent Journey Plan',
    dateField: 'planDate',
  });
  console.log('✅ Permanent Journey Plans GET endpoints ready');
}
