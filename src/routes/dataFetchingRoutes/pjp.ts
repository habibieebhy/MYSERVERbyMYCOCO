// server/src/routes/dataFetchingRoutes/pjp.ts
// --- UPDATED to use dealerId ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { and, asc, desc, eq, gte, ilike, lte, sql, AnyColumn, SQL, SQLWrapper } from 'drizzle-orm';

type TableLike = typeof permanentJourneyPlans;
type TableColumnNames = keyof TableLike['_']['columns'];

// -------- helpers --------
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const boolish = (v: unknown) => (v === true || v === 'true') ? true : (v === false || v === 'false') ? false : undefined;

function createPJPAutoGET(app: Express, cfg: {
  endpoint: string;
  table: TableLike;
  tableName: string;
  dateField: 'planDate';
}) {
  const { endpoint, table, tableName, dateField } = cfg;

  // --- Whitelist UPDATED ---
  const SORT_KEYS: Record<string, TableColumnNames> = {
    planDate: 'planDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    status: 'status',
    areaToBeVisited: 'areaToBeVisited',
    dealerId: 'dealerId', // <-- ✅ ADDED
    verificationStatus: 'verificationStatus',
    // visitDealerName: 'visitDealerName', // <-- REMOVED
  };

  // --- buildWhere UPDATED ---
  const buildWhere = (q: any) => {
    const conds: (SQL | undefined)[] = [];
    const dateColumn = table[dateField] as AnyColumn;

    const { startDate, endDate } = q;
    if (startDate && endDate) {
      conds.push(and(
        gte(dateColumn, new Date(String(startDate))),
        lte(dateColumn, new Date(String(endDate)))
      ));
    }

    if (q.status) conds.push(eq(table.status, String(q.status)));
    if (q.verificationStatus) {
      conds.push(eq(table.verificationStatus, String(q.verificationStatus)));
    }
    
    // --- ✅ FIX ---
    // Added reliable filter for dealerId
    if (q.dealerId) {
      conds.push(eq(table.dealerId, String(q.dealerId)));
    }
    // --- END FIX ---

    const completed = boolish(q.completed);
    if (completed === true) conds.push(eq(table.status, 'completed'));

    const userId = numberish(q.userId);
    if (userId !== undefined) conds.push(eq(table.userId, userId));

    const createdById = numberish(q.createdById);
    if (createdById !== undefined) conds.push(eq(table.createdById, createdById));

    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      const searchConditions: SQLWrapper[] = [ilike(table.areaToBeVisited, s)];
      if (table.description) searchConditions.push(ilike(table.description, s));
      // if (table.visitDealerName) ... // <-- REMOVED
      if (table.additionalVisitRemarks) searchConditions.push(ilike(table.additionalVisitRemarks, s));
      
      conds.push(sql`(${sql.join(searchConditions, sql` OR `)})`);
    }

    const finalConds = conds.filter(Boolean) as SQL[];
    return finalConds.length ? (finalConds.length === 1 ? finalConds[0] : and(...finalConds)) : undefined;
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const key: TableColumnNames = sortByRaw && SORT_KEYS[sortByRaw] ? SORT_KEYS[sortByRaw] : 'planDate';
    const dir = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const column = table[key];
    return dir === 'asc' ? asc(column) : desc(column);
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

      let q = db.select().from(table).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY USER (assignee) =====
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    // ... (This handler remains the same, it's not affected by the change) ...
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
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY CREATOR =====
  app.get(`/api/${endpoint}/created-by/:createdById`, async (req: Request, res: Response) => {
    // ... (This handler remains the same) ...
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
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY STATUS =====
  app.get(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    // ... (This handler remains the same) ...
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
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY ID =====
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    // ... (This handler remains the same) ...
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
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
  console.log('✅ PJP GET endpoints (using dealerId) ready');
}