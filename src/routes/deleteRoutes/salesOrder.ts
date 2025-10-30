// server/src/routes/deleteRoutes/salesOrders.ts
// Sales Orders DELETE endpoints (FIXED)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders, insertSalesOrderSchema } from '../../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// pick a date column safely from whitelist; default = orderDate
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
  schema: z.ZodSchema, // kept for parity
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  // DELETE BY ID
  app.delete(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }

      await db.delete(table).where(eq(table.id, id));

      res.json({
        success: true,
        message: `${tableName} deleted successfully`,
        deletedId: id,
      });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE BY USER (salesman)
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.',
        });
      }

      const rows = await db.select().from(table).where(eq(table.userId, parseInt(userId, 10)));
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`,
        });
      }

      await db.delete(table).where(eq(table.userId, parseInt(userId, 10)));

      res.json({
        success: true,
        message: `${rows.length} ${tableName}(s) deleted successfully for user ${userId}`,
        deletedCount: rows.length,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE BY Dealer ID
  app.delete(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.',
        });
      }

      const rows = await db.select().from(table).where(eq(table.dealerId, dealerId));
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for dealer ${dealerId}`,
        });
      }

      await db.delete(table).where(eq(table.dealerId, dealerId));

      res.json({
        success: true,
        message: `${rows.length} ${tableName}(s) deleted successfully for dealer ${dealerId}`,
        deletedCount: rows.length,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE BY DVR
  app.delete(`/api/${endpoint}/dvr/:dvrId`, async (req: Request, res: Response) => {
    try {
      const { dvrId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.',
        });
      }

      const rows = await db.select().from(table).where(eq(table.dvrId, dvrId));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found for DVR ${dvrId}` });
      }

      await db.delete(table).where(eq(table.dvrId, dvrId));

      res.json({
        success: true,
        message: `${rows.length} ${tableName}(s) deleted for DVR ${dvrId}`,
        deletedCount: rows.length,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by DVR error:`, error);
      // --- ✅ TS FIX: 5G00 -> 500 ---
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE BY PJP
  app.delete(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      const { pjpId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.',
        });
      }

      const rows = await db.select().from(table).where(eq(table.pjpId, pjpId));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found for PJP ${pjpId}` });
      }

      await db.delete(table).where(eq(table.pjpId, pjpId));

      res.json({
        success: true,
        message: `${rows.length} ${tableName}(s) deleted for PJP ${pjpId}`,
        deletedCount: rows.length,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by PJP error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // BULK DELETE BY DATE RANGE
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { dateField, dateFrom, dateTo, confirm } = req.query;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          error: 'dateFrom and dateTo parameters are required',
        });
      }
      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.',
        });
      }

      const col = pickDateColumn(String(dateField));
      
      const whereCond = and(
        gte(col, new Date(String(dateFrom))),
        lte(col, new Date(String(dateTo)))
      );

      const rows = await db.select().from(table).where(whereCond);
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`,
        });
      }

      await db.delete(table).where(whereCond);

      res.json({
        success: true,
        message: `${rows.length} ${tableName}(s) deleted from ${dateFrom} to ${dateTo} (by ${String(dateField || 'orderDate')})`,
        deletedCount: rows.length,
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
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

  console.log('✅ Sales Orders DELETE endpoints (new schema) ready');
}