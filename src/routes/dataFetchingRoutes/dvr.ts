// server/src/routes/dataFetchingRoutes/dvr.ts
// --- UPDATED to use dealerId and subDealerId ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { z } from 'zod';
import { and, asc, desc, eq, ilike, sql, gte, lte, SQL } from 'drizzle-orm';

type TableLike = typeof dailyVisitReports;

// ---------- helpers ----------
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const boolish = (v: unknown) => (v === 'true' || v === true) ? true : (v === 'false' || v === false) ? false : undefined;

function extractBrands(q: any): string[] {
  const raw = q.brand ?? q.brands ?? q.brandSelling ?? undefined;
  if (!raw) return [];
  const arr = Array.isArray(raw)
    ? raw
    : String(raw).includes(',')
      ? String(raw).split(',').map(s => s.trim()).filter(Boolean)
      : [String(raw).trim()].filter(Boolean);
  return arr as string[];
}

function toPgArrayLiteral(values: string[]): string {
  return `{${values
    .map(v => v.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}').trim())
    .join(',')}}`;
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: TableLike,
  tableName: string,
  dateField?: 'reportDate' | 'createdAt' | 'updatedAt'
}) {
  const { endpoint, table, tableName, dateField = 'reportDate' } = config;

  const SORT_WHITELIST: Record<string, keyof TableLike['_']['columns']> = {
    reportDate: 'reportDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const key = sortByRaw && SORT_WHITELIST[sortByRaw] ? SORT_WHITELIST[sortByRaw] : dateField;
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const column = table[key];
    return direction === 'asc' ? asc(column) : desc(column);
  };

  // --- buildWhere UPDATED ---
  const buildWhere = (q: any) => {
    const conds: (SQL | undefined)[] = [];

    // --- ✅ FIX: Filter by new IDs ---
    if (q.dealerId) {
      conds.push(eq(table.dealerId, String(q.dealerId)));
    }
    if (q.subDealerId) {
      conds.push(eq(table.subDealerId, String(q.subDealerId)));
    }
    // --- END FIX ---
    
    // date range
    const startDate = q.startDate as string | undefined;
    const endDate = q.endDate as string | undefined;
    if (startDate && endDate) {
      // NOTE: gte/lte on a 'date' column works fine with YYYY-MM-DD strings
      conds.push(and(
        gte(table[dateField], startDate),
        lte(table[dateField], endDate)
      ));
    }

    // basic filters
    const uid = numberish(q.userId);
    if (uid !== undefined) conds.push(eq(table.userId, uid));
    if (q.dealerType) conds.push(eq(table.dealerType, String(q.dealerType)));
    if (q.visitType) conds.push(eq(table.visitType, String(q.visitType)));
    if (q.pjpId) conds.push(eq(table.pjpId, String(q.pjpId)));

    // search (removed dealerName/subDealerName)
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql`(${ilike(table.location, s)} 
           OR ${ilike(table.contactPerson, s)}
           OR ${ilike(table.feedbacks, s)})`
      );
    }

    // brandSelling filters (this logic is unchanged)
    const brands = extractBrands(q);
    if (brands.length) {
      const arrLiteral = toPgArrayLiteral(brands);
      const anyBrand = boolish(q.anyBrand);
      if (anyBrand) {
        conds.push(sql`${table.brandSelling} && ${arrLiteral}::text[]`);
      } else {
        conds.push(sql`${table.brandSelling} @> ${arrLiteral}::text[]`);
      }
    }

    const finalConds = conds.filter(Boolean) as SQL[];
    if (!finalConds.length) return undefined;
    return finalConds.length === 1 ? finalConds[0] : and(...finalConds);
  };

  // ===== GET ALL =====
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCondition = buildWhere(filters);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // --- ✅ FIX: Correct query build order ---
      let q = db.select().from(table).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      // --- END FIX ---

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY USER =====
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

      // --- ✅ FIX: Correct query build order ---
      let q = db.select().from(table).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      // --- END FIX ---

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
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
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
    }
  });

  // ===== GET BY VISIT TYPE =====
  app.get(`/api/${endpoint}/visit-type/:visitType`, async (req: Request, res: Response) => {
    try {
      const { visitType } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.visitType, visitType);
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // --- ✅ FIX: Correct query build order ---
      let q = db.select().from(table).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      // --- END FIX ---

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY PJP =====
  app.get(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      const { pjpId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.pjpId, pjpId);
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // --- ✅ FIX: Correct query build order ---
      let q = db.select().from(table).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      // --- END FIX ---

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });
}

export default function setupDailyVisitReportsRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-visit-reports',
    table: dailyVisitReports,
    tableName: 'Daily Visit Report',
    dateField: 'reportDate',
  });
  console.log('✅ DVR GET endpoints (using dealerId) ready');
}