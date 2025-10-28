// server/src/routes/deleteRoutes/dvr.ts
// Daily Visit Reports DELETE endpoints (with pjpId + brandSelling bulk)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

type TableLike = typeof dailyVisitReports;

// ---------- helpers ----------
const mustConfirm = (q: any) =>
  q.confirm === 'true' || q.confirm === true;

const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const boolish = (v: unknown) => {
  if (v === 'true' || v === true) return true;
  if (v === 'false' || v === false) return false;
  return undefined;
};

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

  // ----- DELETE BY ID -----
  app.delete(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      if (!existing) return res.status(404).json({ success: false, error: `${tableName} not found` });

      await db.delete(table).where(eq(table.id, id));
      res.json({ success: true, message: `${tableName} deleted`, deletedId: id });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ----- DELETE BY User ID (bulk, requires confirm) -----
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const { userId } = req.params;
      const uid = parseInt(userId, 10);
      const ids = await db.select({ id: table.id }).from(table).where(eq(table.userId, uid));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s for user ${userId}` });

      await db.delete(table).where(eq(table.userId, uid));
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted for user ${userId}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ----- DELETE BY Dealer Type (bulk, requires confirm) -----
  app.delete(`/api/${endpoint}/dealer-type/:dealerType`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const { dealerType } = req.params;
      const ids = await db.select({ id: table.id }).from(table).where(eq(table.dealerType, dealerType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s with dealer type ${dealerType}` });

      await db.delete(table).where(eq(table.dealerType, dealerType));
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted with dealer type ${dealerType}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ----- DELETE BY Visit Type (bulk, requires confirm) -----
  app.delete(`/api/${endpoint}/visit-type/:visitType`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const { visitType } = req.params;
      const ids = await db.select({ id: table.id }).from(table).where(eq(table.visitType, visitType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s with visit type ${visitType}` });

      await db.delete(table).where(eq(table.visitType, visitType));
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted with visit type ${visitType}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ----- NEW: DELETE BY PJP (bulk, requires confirm) -----
  // Optional: filter by userId at the same time (?userId=14)
  app.delete(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const { pjpId } = req.params;
      const uid = numberish(req.query.userId);

      const wherePjp = uid !== undefined
        ? and(eq(table.pjpId, pjpId), eq(table.userId, uid))
        : eq(table.pjpId, pjpId);

      const ids = await db.select({ id: table.id }).from(table).where(wherePjp);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s found for pjpId ${pjpId}` });

      await db.delete(table).where(wherePjp);
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted for pjp ${pjpId}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ----- NEW: BULK DELETE BY brandSelling (ANY/ALL) (requires confirm) -----
  // ?brands=ACC,Ultratech&anyBrand=true  => overlap
  // ?brands=ACC,Ultratech                => contains ALL
  // Optional: also constrain by userId and/or date range
  app.delete(`/api/${endpoint}/bulk/brands`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const brands = extractBrands(req.query);
      if (brands.length === 0) {
        return res.status(400).json({ success: false, error: 'Provide ?brands=CSV or brands[]=.. for deletion' });
      }
      const arrLiteral = toPgArrayLiteral(brands);
      const anyBrand = boolish(req.query.anyBrand); // default ALL

      // base brand condition
      const brandCond = anyBrand
        ? sql`${table.brandSelling} && ${arrLiteral}::text[]`
        : sql`${table.brandSelling} @> ${arrLiteral}::text[]`;

      // optional user/date constraints
      const uid = numberish(req.query.userId);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      let whereCond: any = brandCond;
      if (uid !== undefined) whereCond = and(whereCond, eq(table.userId, uid));
      if (startDate && endDate) whereCond = and(whereCond, gte(table[dateField], startDate), lte(table[dateField], endDate));

      const ids = await db.select({ id: table.id }).from(table).where(whereCond);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s match the provided brand filters` });

      await db.delete(table).where(whereCond);
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted by brand filters`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s by brands error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });

  // ----- BULK DELETE BY DATE RANGE (requires confirm) -----
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
      }
      if (!mustConfirm(req.query)) {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const whereCondition = and(
        gte(table[dateField], String(startDate)),
        lte(table[dateField], String(endDate))
      );

      const ids = await db.select({ id: table.id }).from(table).where(whereCondition);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s in the specified date range` });

      await db.delete(table).where(whereCondition);
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted between ${startDate} and ${endDate}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName}s`, details: (error as Error)?.message ?? 'Unknown error' });
    }
  });
}

// Function call in the same file
export default function setupDailyVisitReportsDeleteRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-visit-reports',
    table: dailyVisitReports,
    tableName: 'Daily Visit Report',
    dateField: 'reportDate',
  });
  console.log('✅ Daily Visit Reports DELETE endpoints ready (id/user/dealerType/visitType/pjp/brands/date-range)');
}
