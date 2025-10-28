// server/src/routes/dataFetchingRoutes/dvr.ts
// Daily Visit Reports GET endpoints with pagination, brandSelling filters, date range, pjpId

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { z } from 'zod';
import { and, asc, desc, eq, ilike, sql, gte, lte } from 'drizzle-orm';

type TableLike = typeof dailyVisitReports;

// ---------- helpers ----------
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const boolish = (v: unknown) => (v === 'true' || v === true) ? true : (v === 'false' || v === false) ? false : undefined;

// normalize brand query to string[]
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

// safely convert to a Postgres array literal
function toPgArrayLiteral(values: string[]): string {
  return `{${values
    .map(v =>
      v
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .trim()
    )
    .join(',')}}`;
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: TableLike,
  tableName: string,
  dateField?: 'reportDate' | 'createdAt' | 'updatedAt'
}) {
  const { endpoint, table, tableName, dateField = 'reportDate' } = config;

  const SORT_WHITELIST: Record<string, keyof typeof table> = {
    reportDate: 'reportDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const sortByKey = sortByRaw && SORT_WHITELIST[sortByRaw] ? SORT_WHITELIST[sortByRaw] : dateField;
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    return direction === 'asc' ? asc(table[sortByKey]) : desc(table[sortByKey]);
  };

  // Build WHERE from query params
  const buildWhere = (q: any) => {
    const conds: any[] = [];

    // date range on dateField (reportDate default)
    const startDate = q.startDate as string | undefined;
    const endDate = q.endDate as string | undefined;
    if (startDate && endDate) {
      conds.push(
        and(
          gte(table[dateField], startDate),
          lte(table[dateField], endDate)
        )
      );
    }

    // basic filters
    const uid = numberish(q.userId);
    if (uid !== undefined) conds.push(eq(table.userId, uid));

    if (q.dealerType) conds.push(eq(table.dealerType, String(q.dealerType)));
    if (q.visitType) conds.push(eq(table.visitType, String(q.visitType)));
    if (q.pjpId) conds.push(eq(table.pjpId, String(q.pjpId)));

    // search across some text columns
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql`(${ilike(table.dealerName, s)} 
           OR ${ilike(table.subDealerName, s)}
           OR ${ilike(table.location, s)}
           OR ${ilike(table.contactPerson, s)}
           OR ${ilike(table.feedbacks, s)})`
      );
    }

    // brandSelling filters
    const brands = extractBrands(q);
    if (brands.length) {
      const arrLiteral = toPgArrayLiteral(brands);
      const anyBrand = boolish(q.anyBrand); // ?anyBrand=true => overlap; default ALL
      if (anyBrand) {
        // overlap
        conds.push(sql`${table.brandSelling} && ${arrLiteral}::text[]`);
      } else {
        // contains all
        conds.push(sql`${table.brandSelling} @> ${arrLiteral}::text[]`);
      }
    }

    if (!conds.length) return undefined;
    return conds.length === 1 ? conds[0] : and(...conds);
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

      let q = db.select().from(table).orderBy(orderExpr).limit(lmt).offset(offset);
      if (whereCondition) q = q.where(whereCondition);

      const data = await q;
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
      const whereCondition = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      const data = await db.select().from(table)
        .where(whereCondition)
        .orderBy(orderExpr)
        .limit(lmt)
        .offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
      const whereCondition = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      const data = await db.select().from(table)
        .where(whereCondition)
        .orderBy(orderExpr)
        .limit(lmt)
        .offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Visit Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== GET BY PJP ===== (handy for linking Sales Orders to a plan’s DVRs)
  app.get(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      const { pjpId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.pjpId, pjpId);
      const extra = buildWhere(rest);
      const whereCondition = extra ? and(base, extra) : base;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      const data = await db.select().from(table)
        .where(whereCondition)
        .orderBy(orderExpr)
        .limit(lmt)
        .offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by PJP error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
  console.log('✅ Daily Visit Reports GET endpoints ready');
}
