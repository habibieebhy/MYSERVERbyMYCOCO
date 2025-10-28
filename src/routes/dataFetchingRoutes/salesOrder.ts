// server/src/routes/dataFetchingRoutes/salesOrder.ts
// Sales Orders GET endpoints aligned to new schema

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders, insertSalesOrderSchema } from '../../db/schema';
import { eq, and, gte, lte, desc, asc, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

type TableLike = typeof salesOrders;

// ---------- helpers ----------
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

// pick a column safely from whitelist
function pickDateColumn(table: TableLike, key?: string) {
  switch ((key || '').toLowerCase()) {
    case 'deliverydate': return table.deliveryDate;
    case 'receivedpaymentdate': return table.receivedPaymentDate;
    case 'createdat': return table.createdAt;
    default: return table.orderDate; // default
  }
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: TableLike,
  schema: z.ZodSchema, // not used but kept for parity
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  const SORT_WHITELIST: Record<string, keyof typeof table> = {
    createdAt: 'createdAt',
    orderDate: 'orderDate',
    deliveryDate: 'deliveryDate',
    paymentAmount: 'paymentAmount',
    receivedPayment: 'receivedPayment',
    pendingPayment: 'pendingPayment',
    itemPrice: 'itemPrice',
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const k = sortByRaw && SORT_WHITELIST[sortByRaw] ? SORT_WHITELIST[sortByRaw] : 'createdAt';
    const dir = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    return dir === 'asc' ? asc(table[k]) : desc(table[k]);
  };

  const buildWhere = (q: any) => {
    const conds: any[] = [];

    // ---- IDs / relations ----
    if (q.userId) {
      const v = numberish(q.userId);
      if (v !== undefined) conds.push(eq(table.userId, v));
    }
    if (q.dealerId) conds.push(eq(table.dealerId, String(q.dealerId)));
    if (q.dvrId) conds.push(eq(table.dvrId, String(q.dvrId)));
    if (q.pjpId) conds.push(eq(table.pjpId, String(q.pjpId)));

    // ---- enums / text exact ----
    if (q.orderUnit) conds.push(eq(table.orderUnit, String(q.orderUnit)));
    if (q.itemType) conds.push(eq(table.itemType, String(q.itemType)));
    if (q.itemGrade) conds.push(eq(table.itemGrade, String(q.itemGrade)));
    if (q.paymentMode) conds.push(eq(table.paymentMode, String(q.paymentMode)));

    // ---- date range (choose column by ?dateField=orderDate|deliveryDate|receivedPaymentDate|createdAt) ----
    const col = pickDateColumn(table, q.dateField);
    const dateFrom = q.dateFrom ? String(q.dateFrom) : undefined;
    const dateTo = q.dateTo ? String(q.dateTo) : undefined;
    if (dateFrom) conds.push(gte(col, dateFrom));
    if (dateTo) conds.push(lte(col, dateTo));

    // ---- numeric ranges ----
    const minQty = numberish(q.minQty), maxQty = numberish(q.maxQty);
    if (minQty !== undefined) conds.push(gte(table.orderQty, minQty));
    if (maxQty !== undefined) conds.push(lte(table.orderQty, maxQty));

    const minPay = numberish(q.minPayment), maxPay = numberish(q.maxPayment);
    if (minPay !== undefined) conds.push(gte(table.paymentAmount, minPay));
    if (maxPay !== undefined) conds.push(lte(table.paymentAmount, maxPay));

    const minRecv = numberish(q.minReceived), maxRecv = numberish(q.maxReceived);
    if (minRecv !== undefined) conds.push(gte(table.receivedPayment, minRecv));
    if (maxRecv !== undefined) conds.push(lte(table.receivedPayment, maxRecv));

    const minPending = numberish(q.minPending), maxPending = numberish(q.maxPending);
    if (minPending !== undefined) conds.push(gte(table.pendingPayment, minPending));
    if (maxPending !== undefined) conds.push(lte(table.pendingPayment, maxPending));

    // ---- simple search: party name + addresses ----
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql`(${ilike(table.orderPartyName, s)}
          OR ${ilike(table.partyAddress, s)}
          OR ${ilike(table.deliveryAddress, s)})`
      );
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

      const whereCond = buildWhere(filters);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table).orderBy(orderExpr).limit(lmt).offset(offset);
      if (whereCond) q = q.where(whereCond);

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

  // ===== GET BY USER (salesman) =====
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

      const data = await db.select().from(table)
        .where(whereCond)
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

      const data = await db.select().from(table)
        .where(whereCond)
        .orderBy(orderExpr)
        .limit(lmt)
        .offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
  console.log('✅ Sales Orders GET endpoints (new schema) ready');
}
