//  server/src/routes/dataFetchingRoutes/collectionReports.ts
// Collection Reports GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { collectionReports, insertCollectionReportSchema } from '../../db/schema';
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
      const { startDate, endDate, limit = '50', dealerId, dvrId, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Date range filtering using collectedOnDate
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      // Filter by dealerId
      if (dealerId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.dealerId, dealerId as string))
          : eq(table.dealerId, dealerId as string);
      }

      // Filter by dvrId
      if (dvrId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.dvrId, dvrId as string))
          : eq(table.dvrId, dvrId as string);
      }

      // Additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          whereCondition = whereCondition
            ? and(whereCondition, eq(table[key], value))
            : eq(table[key], value);
        }
      });

      let query = db.select().from(table);
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const orderField = table[dateField] || table.createdAt;
      const records = await query
        .orderBy(desc(orderField))
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

  // GET BY Dealer ID
  app.get(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = '50' } = req.query;

      let whereCondition = eq(table.dealerId, dealerId);

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(orderField))
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

  // GET BY DVR ID (unique relationship)
  app.get(`/api/${endpoint}/dvr/:dvrId`, async (req: Request, res: Response) => {
    try {
      const { dvrId } = req.params;
      const [record] = await db.select().from(table).where(eq(table.dvrId, dvrId)).limit(1);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found for DVR ID: ${dvrId}`
        });
      }

      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} by DVR error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupCollectionReportsRoutes(app: Express) {
  // Collection Reports - date field for filtering
  createAutoCRUD(app, {
    endpoint: 'collection-reports',
    table: collectionReports,
    schema: insertCollectionReportSchema,
    tableName: 'Collection Report',
    dateField: 'collectedOnDate',
    autoFields: {
      collectedOnDate: () => new Date().toISOString().split('T')[0] // date type
    }
  });
  
  console.log('✅ Collection Reports GET endpoints setup complete');
}