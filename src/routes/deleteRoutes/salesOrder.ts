// server/src/routes/deleteRoutes/salesOrders.ts
// --- UPDATED with 'status' delete and typo fix ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders, insertSalesOrderSchema } from '../../db/schema';
import { eq, and, gte, lte, SQL } from 'drizzle-orm';
import { z } from 'zod';

function pickDateColumn(key?: string) {
  switch ((key || '').toLowerCase()) {
    case 'deliverydate': return salesOrders.deliveryDate;
    case 'receivedpaymentdate': return salesOrders.receivedPaymentDate;
    case 'createdat': return salesOrders.createdAt;
    default: return salesOrders.orderDate;
  }
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof salesOrders,
  schema: z.ZodSchema,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  // DELETE BY ID
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

  // DELETE BY USER
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== 'true') return res.status(400).json({ success: false, error: 'Add ?confirm=true' });
      
      const rows = await db.select().from(table).where(eq(table.userId, parseInt(userId, 10)));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName}s for user ${userId}` });
      await db.delete(table).where(eq(table.userId, parseInt(userId, 10)));
      res.json({ success: true, message: `${rows.length} ${tableName}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // DELETE BY Dealer ID
  app.delete(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      const { confirm } = req.query;
      if (confirm !== 'true') return res.status(400).json({ success: false, error: 'Add ?confirm=true' });
      
      const rows = await db.select().from(table).where(eq(table.dealerId, dealerId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName}s for dealer ${dealerId}` });
      await db.delete(table).where(eq(table.dealerId, dealerId));
      res.json({ success: true, message: `${rows.length} ${tableName}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // DELETE BY DVR
  app.delete(`/api/${endpoint}/dvr/:dvrId`, async (req: Request, res: Response) => {
    try {
      const { dvrId } = req.params;
      const { confirm } = req.query;
      if (confirm !== 'true') return res.status(400).json({ success: false, error: 'Add ?confirm=true' });
      
      const rows = await db.select().from(table).where(eq(table.dvrId, dvrId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName}s for DVR ${dvrId}` });
      await db.delete(table).where(eq(table.dvrId, dvrId));
      res.json({ success: true, message: `${rows.length} ${tableName}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by DVR error:`, error);
      // --- ✅ TS FIX: 5G00 -> 500 ---
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // DELETE BY PJP
  app.delete(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      const { pjpId } = req.params;
      const { confirm } = req.query;
      if (confirm !== 'true') return res.status(400).json({ success: false, error: 'Add ?confirm=true' });
      
      const rows = await db.select().from(table).where(eq(table.pjpId, pjpId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName}s for PJP ${pjpId}` });
      await db.delete(table).where(eq(table.pjpId, pjpId));
      res.json({ success: true, message: `${rows.length} ${tableName}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  // --- ✅ NEW ROUTE ---
  // DELETE BY STATUS
  app.delete(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const { confirm } = req.query;
      if (confirm !== 'true') return res.status(400).json({ success: false, error: 'Add ?confirm=true' });
      
      const rows = await db.select().from(table).where(eq(table.status, status));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName}s with status ${status}` });
      await db.delete(table).where(eq(table.status, status));
      res.json({ success: true, message: `${rows.length} ${tableName}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName}s by Status error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });
  // --- END NEW ROUTE ---

  // BULK DELETE BY DATE RANGE
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { dateField, dateFrom, dateTo, confirm } = req.query;
      if (!dateFrom || !dateTo) return res.status(400).json({ success: false, error: 'dateFrom/dateTo required' });
      if (confirm !== 'true') return res.status(400).json({ success: false, error: 'Add ?confirm=true' });
      
      const col = pickDateColumn(String(dateField));
      const whereCond: SQL = and(
        gte(col, new Date(String(dateFrom))),
        lte(col, new Date(String(dateTo)))
      )!;

      const rows = await db.select().from(table).where(whereCond);
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName}s in date range` });
      await db.delete(table).where(whereCond);
      res.json({ success: true, message: `${rows.length} ${tableName}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName}s` });
    }
  });
}

export default function setupSalesOrdersDeleteRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'sales-orders',
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: 'Sales Order',
  });
  console.log('✅ Sales Orders DELETE endpoints (with status) ready');
}