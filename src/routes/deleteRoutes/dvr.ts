// server/src/routes/deleteRoutes/dvr.ts
// --- UPDATED with date and undefined SQL fixes ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyVisitReports } from '../../db/schema';
import { and, eq, gte, lte, sql, SQL, inArray } from 'drizzle-orm'; // Import inArray

type TableLike = typeof dailyVisitReports;

// ... (helpers) ...
const mustConfirm = (q: any) => q.confirm === 'true' || q.confirm === true;
const numberish = (v: unknown) => { if (v === null || v === undefined || v === '') return undefined; const n = Number(v); return Number.isFinite(n) ? n : undefined; };
const boolish = (v: unknown) => { if (v === 'true' || v === true) return true; if (v === 'false' || v === false) return false; return undefined; };
function extractBrands(q: any): string[] { const raw = q.brand ?? q.brands ?? q.brandSelling ?? undefined; if (!raw) return []; const arr = Array.isArray(raw) ? raw : String(raw).includes(',') ? String(raw).split(',').map(s => s.trim()).filter(Boolean) : [String(raw).trim()].filter(Boolean); return arr as string[]; }
function toPgArrayLiteral(values: string[]): string { return `{${values.map(v => v.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}').trim()).join(',')}}`; }


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
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}` });
    }
  });

  // ----- DELETE BY User ID -----
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      const { userId } = req.params;
      const uid = parseInt(userId, 10);
      if (isNaN(uid)) return res.status(400).json({ success: false, error: 'Invalid user ID' });
      
      const ids = await db.select({ id: table.id }).from(table).where(eq(table.userId, uid));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s for user ${userId}` });
      await db.delete(table).where(eq(table.userId, uid));
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted for user ${userId}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // ----- DELETE BY Dealer Type -----
  app.delete(`/api/${endpoint}/dealer-type/:dealerType`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      const { dealerType } = req.params;
      const ids = await db.select({ id: table.id }).from(table).where(eq(table.dealerType, dealerType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s with dealer type ${dealerType}` });
      await db.delete(table).where(eq(table.dealerType, dealerType));
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted with dealer type ${dealerType}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // ----- DELETE BY Visit Type -----
  app.delete(`/api/${endpoint}/visit-type/:visitType`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      const { visitType } = req.params;
      const ids = await db.select({ id: table.id }).from(table).where(eq(table.visitType, visitType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s with visit type ${visitType}` });
      await db.delete(table).where(eq(table.visitType, visitType));
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted with visit type ${visitType}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });
  
  // ----- DELETE BY PJP -----
  app.delete(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
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
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // --- BULK DELETE BY brandSelling ---
  app.delete(`/api/${endpoint}/bulk/brands`, async (req: Request, res: Response) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      const brands = extractBrands(req.query);
      if (brands.length === 0) return res.status(400).json({ success: false, error: 'Provide ?brands=... for deletion' });
      
      const arrLiteral = toPgArrayLiteral(brands);
      const anyBrand = boolish(req.query.anyBrand);
      const brandCond = anyBrand
        ? sql`${table.brandSelling} && ${arrLiteral}::text[]`
        : sql`${table.brandSelling} @> ${arrLiteral}::text[]`;

      const uid = numberish(req.query.userId);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const whereConds: (SQL | undefined)[] = [brandCond];
      if (uid !== undefined) whereConds.push(eq(table.userId, uid));
      
      if (startDate && endDate) {
        const col = table[dateField];
        if (dateField === 'createdAt' || dateField === 'updatedAt') {
          whereConds.push(gte(col, new Date(startDate)), lte(col, new Date(endDate)));
        } else {
          whereConds.push(gte(col, startDate), lte(col, endDate));
        }
      }

      // --- ✅ TS FIX: Safely build 'and' condition ---
      const finalWhere = and(...whereConds.filter(Boolean) as SQL[]);
      if (!finalWhere) {
        // This case should not be reachable if brandCond is always present
        return res.status(400).json({ success: false, error: 'Invalid brand filter conditions' });
      }
      // --- END FIX ---

      const ids = await db.select({ id: table.id }).from(table).where(finalWhere);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s match filters` });

      await db.delete(table).where(finalWhere);
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s by brands error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName}s` });
    }
  });

  // --- BULK DELETE BY DATE RANGE ---
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });

      // --- ✅ TS FIX: Initialize whereCondition correctly ---
      const col = table[dateField];
      const whereCondition: SQL = (dateField === 'createdAt' || dateField === 'updatedAt')
        ? and(gte(col, new Date(String(startDate))), lte(col, new Date(String(endDate))))!
        : and(gte(col, String(startDate)), lte(col, String(endDate)))!;
      // --- END FIX ---

      const ids = await db.select({ id: table.id }).from(table).where(whereCondition);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName}s in date range` });

      await db.delete(table).where(whereCondition);
      res.json({ success: true, message: `${ids.length} ${tableName}(s) deleted`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName}s` });
    }
  });
}

export default function setupDailyVisitReportsDeleteRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'daily-visit-reports',
    table: dailyVisitReports,
    tableName: 'Daily Visit Report',
    dateField: 'reportDate',
  });
  console.log('✅ DVR DELETE endpoints (using dealerId) ready');
}