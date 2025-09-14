//  server/src/routes/dataFetchingRoutes/dealerReportsAndScores.ts 
// Dealer Reports and Scores GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealerReportsAndScores, insertDealerReportsAndScoresSchema } from '../../db/schema';
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
      const { startDate, endDate, limit = '50', dealerId, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Date range filtering using lastUpdatedDate
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

      const orderField = table[dateField] || table.id;
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

      const orderField = table[dateField] || table.id;
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

  // GET BY Score Range (custom endpoint for dealer scores)
  app.get(`/api/${endpoint}/score-range`, async (req: Request, res: Response) => {
    try {
      const { minScore, maxScore, scoreType = 'dealerScore', limit = '50', startDate, endDate } = req.query;

      if (!minScore || !maxScore) {
        return res.status(400).json({
          success: false,
          error: 'minScore and maxScore parameters are required'
        });
      }

      let whereCondition = and(
        gte(table[scoreType as string], parseFloat(minScore as string)),
        lte(table[scoreType as string], parseFloat(maxScore as string))
      );

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(orderField))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Score Range error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s by score range`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupDealerReportsAndScoresRoutes(app: Express) {
  // Dealer Reports And Scores - date field for filtering
  createAutoCRUD(app, {
    endpoint: 'dealer-reports-scores',
    table: dealerReportsAndScores,
    schema: insertDealerReportsAndScoresSchema,
    tableName: 'Dealer Reports and Scores',
    dateField: 'lastUpdatedDate',
    autoFields: {
      lastUpdatedDate: () => new Date().toISOString(),
      createdAt: () => new Date().toISOString(),
      updatedAt: () => new Date().toISOString()
    }
  });
  
  console.log('✅ Dealer Reports and Scores GET endpoints setup complete');
}