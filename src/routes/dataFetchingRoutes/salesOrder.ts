//  server/src/routes/dataFetchingRoutes/salesOrder.ts 
// Sales Orders GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders, insertSalesOrderSchema } from '../../db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: any,
  schema: z.ZodSchema,
  tableName: string,
  autoFields?: { [key: string]: () => any },
  dateField?: string
}) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;

  // GET ALL - with optional filtering and date range
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, limit = '50', salesmanId, dealerId, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Date range filtering using estimatedDelivery or createdAt
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      // Filter by salesmanId
      if (salesmanId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.salesmanId, parseInt(salesmanId as string)))
          : eq(table.salesmanId, parseInt(salesmanId as string));
      }

      // Filter by dealerId
      if (dealerId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.dealerId, dealerId as string))
          : eq(table.dealerId, dealerId as string);
      }

      // Additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === 'salesmanId') {
            whereCondition = whereCondition
              ? and(whereCondition, eq(table[key], parseInt(value as string)))
              : eq(table[key], parseInt(value as string));
          } else {
            whereCondition = whereCondition
              ? and(whereCondition, eq(table[key], value))
              : eq(table[key], value);
          }
        }
      });

      let query = db.select().from(table);
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const records = await query
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Salesman ID
  app.get(`/api/${endpoint}/salesman/:salesmanId`, async (req: Request, res: Response) => {
    try {
      const { salesmanId } = req.params;
      const { startDate, endDate, limit = '50', dealerId } = req.query;

      let whereCondition = eq(table.salesmanId, parseInt(salesmanId));

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      if (dealerId) {
        whereCondition = and(whereCondition, eq(table.dealerId, dealerId as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Salesman error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY ID
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }

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

  // GET BY Dealer ID
  app.get(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = '50', salesmanId } = req.query;

      let whereCondition = eq(table.dealerId, dealerId);

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      if (salesmanId) {
        whereCondition = and(whereCondition, eq(table.salesmanId, parseInt(salesmanId as string)));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupSalesOrdersRoutes(app: Express) {
  // Sales Orders - date field for filtering by estimated delivery
  createAutoCRUD(app, {
    endpoint: 'sales-orders',
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: 'Sales Order',
    dateField: 'estimatedDelivery'
    // No auto fields needed
  });
  
  console.log('✅ Sales Orders GET endpoints setup complete');
}