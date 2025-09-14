//  server/src/routes/dataFetchingRoutes/clientReports.ts 
// Client Reports GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { clientReports, insertClientReportSchema } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
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

  // GET ALL - with optional filtering
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', userId, dealerType, typeBestNonBest, location, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Filter by userId
      if (userId) {
        whereCondition = eq(table.userId, parseInt(userId as string));
      }

      // Filter by dealerType
      if (dealerType) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.dealerType, dealerType as string))
          : eq(table.dealerType, dealerType as string);
      }

      // Filter by typeBestNonBest
      if (typeBestNonBest) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.typeBestNonBest, typeBestNonBest as string))
          : eq(table.typeBestNonBest, typeBestNonBest as string);
      }

      // Filter by location
      if (location) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.location, location as string))
          : eq(table.location, location as string);
      }

      // Additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === 'userId') {
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

  // GET BY User ID
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', dealerType, typeBestNonBest } = req.query;

      let whereCondition = eq(table.userId, parseInt(userId));

      if (dealerType) {
        whereCondition = and(whereCondition, eq(table.dealerType, dealerType as string));
      }
      if (typeBestNonBest) {
        whereCondition = and(whereCondition, eq(table.typeBestNonBest, typeBestNonBest as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
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

  // GET BY Dealer Type
  app.get(`/api/${endpoint}/dealer-type/:dealerType`, async (req: Request, res: Response) => {
    try {
      const { dealerType } = req.params;
      const { limit = '50', userId, typeBestNonBest } = req.query;

      let whereCondition = eq(table.dealerType, dealerType);

      if (userId) {
        whereCondition = and(whereCondition, eq(table.userId, parseInt(userId as string)));
      }
      if (typeBestNonBest) {
        whereCondition = and(whereCondition, eq(table.typeBestNonBest, typeBestNonBest as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupClientReportsRoutes(app: Express) {
  // Client Reports - no date field, general reports
  createAutoCRUD(app, {
    endpoint: 'client-reports',
    table: clientReports,
    schema: insertClientReportSchema,
    tableName: 'Client Report'
    // No auto fields or date fields needed
  });
  
  console.log('✅ Client Reports GET endpoints setup complete');
}