// server/src/routes/dataFetchingRoutes/salesOrder.ts
// --- UPDATED to include 'status' filter/sort ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders, insertSalesOrderSchema } from '../../db/schema';
import { eq, and, gte, lte, desc, asc, ilike, sql, SQL } from 'drizzle-orm';
import { z } from 'zod';

type TableLike = typeof salesOrders;

// ---------- helpers ----------
const numberish = (v: unknown): string | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : undefined; 
};
const integerish = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : undefined;
}

function pickDateColumn(table: TableLike, key?: string) {
  switch ((key || '').toLowerCase()) {
    case 'deliverydate': return table.deliveryDate;
    case 'receivedpaymentdate': return table.receivedPaymentDate;
    case 'createdat': return table.createdAt;
    default: return table.orderDate;
  }
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: TableLike,
  schema: z.ZodSchema, 
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  // --- buildSort UPDATED ---
  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const dir = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    switch (sortByRaw) {
      case 'orderDate':
        return dir === 'asc' ? asc(table.orderDate) : desc(table.orderDate);
      case 'deliveryDate':
        return dir === 'asc' ? asc(table.deliveryDate) : desc(table.deliveryDate);
      case 'paymentAmount':
        return dir === 'asc' ? asc(table.paymentAmount) : desc(table.paymentAmount);
      case 'receivedPayment':
        return dir === 'asc' ? asc(table.receivedPayment) : desc(table.receivedPayment);
      case 'pendingPayment':
        return dir === 'asc' ? asc(table.pendingPayment) : desc(table.pendingPayment);
      case 'itemPrice':
        return dir === 'asc' ? asc(table.itemPrice) : desc(table.itemPrice);
      case 'orderQty':
        return dir === 'asc' ? asc(table.orderQty) : desc(table.orderQty);
      // --- ✅ FIX ---
      case 'status':
        return dir === 'asc' ? asc(table.status) : desc(table.status);
      // --- END FIX ---
      case 'createdAt':
        return dir === 'asc' ? asc(table.createdAt) : desc(table.createdAt);
      default:
        return desc(table.createdAt);
    }
  };

  // --- buildWhere UPDATED ---
  const buildWhere = (q: any) => {
    const conds: (SQL | undefined)[] = [];

    // IDs
    const uid = integerish(q.userId);
    if (uid !== undefined) conds.push(eq(table.userId, uid));
    if (q.dealerId) conds.push(eq(table.dealerId, String(q.dealerId)));
    if (q.dvrId) conds.push(eq(table.dvrId, String(q.dvrId)));
    if (q.pjpId) conds.push(eq(table.pjpId, String(q.pjpId)));

    // Enums
    if (q.orderUnit) conds.push(eq(table.orderUnit, String(q.orderUnit)));
    if (q.itemType) conds.push(eq(table.itemType, String(q.itemType)));
    if (q.itemGrade) conds.push(eq(table.itemGrade, String(q.itemGrade)));
    if (q.paymentMode) conds.push(eq(table.paymentMode, String(q.paymentMode)));
    
    // --- ✅ FIX ---
    if (q.status) {
      conds.push(eq(table.status, String(q.status)));
    }
    // --- END FIX ---

    // Date range
    const col = pickDateColumn(table, q.dateField);
    const dateFrom = q.dateFrom ? String(q.dateFrom) : undefined;
    const dateTo = q.dateTo ? String(q.dateTo) : undefined;
    if (dateFrom) conds.push(gte(col, new Date(dateFrom)));
    if (dateTo) conds.push(lte(col, new Date(dateTo)));

    // Numeric ranges
    const minQty = numberish(q.minQty), maxQty = numberish(q.maxQty);
    if (minQty !== undefined) conds.push(gte(table.orderQty, minQty));
    if (maxQty !== undefined) conds.push(lte(table.orderQty, maxQty));
    // ... (other numeric ranges are correct) ...
    const minPay = numberish(q.minPayment), maxPay = numberish(q.maxPayment);
    if (minPay !== undefined) conds.push(gte(table.paymentAmount, minPay));
    if (maxPay !== undefined) conds.push(lte(table.paymentAmount, maxPay));
    const minRecv = numberish(q.minReceived), maxRecv = numberish(q.maxReceived);
    if (minRecv !== undefined) conds.push(gte(table.receivedPayment, minRecv));
    if (maxRecv !== undefined) conds.push(lte(table.receivedPayment, maxRecv));
    const minPending = numberish(q.minPending), maxPending = numberish(q.maxPending);
    if (minPending !== undefined) conds.push(gte(table.pendingPayment, minPending));
    if (maxPending !== undefined) conds.push(lte(table.pendingPayment, maxPending));

    // Search
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql`(${ilike(table.orderPartyName, s)}
          OR ${ilike(table.partyAddress, s)}
          OR ${ilike(table.deliveryAddress, s)})`
      );
    }

    const finalConds = conds.filter(Boolean) as SQL[];
    if (finalConds.length === 0) return undefined;
    return finalConds.length === 1 ? finalConds[0] : and(...finalConds);
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

  // ===== GET BY USER (salesman) =====
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      
      const uid = integerish(userId);
      if (uid === undefined) {
         return res.status(400).json({ success: false, error: 'Invalid User ID' });
      }

      const base = eq(table.userId, uid);
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;
      const orderExpr = buildSort(String(sortBy), String(sortDir));
      
      let q = db.select().from(table).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET BY DEALER =====
  app.get(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const base = eq(table.dealerId, dealerId);
      const extra = buildWhere(rest);
      const whereCond = extra ? and(base, extra) : base;
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // ===== GET ONE =====
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
}

export default function setupSalesOrdersRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'sales-orders',
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: 'Sales Order',
  });
  console.log('✅ Sales Orders GET endpoints (with status) ready');
}