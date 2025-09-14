//  server/src/routes/dataFetchingRoutes/dealers.ts 
// Dealers GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers, insertDealerSchema } from '../../db/schema';
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
      const { limit = '50', region, area, type, userId, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Filter by region if provided
      if (region) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.region, region as string))
          : eq(table.region, region as string);
      }

      // Filter by area if provided
      if (area) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.area, area as string))
          : eq(table.area, area as string);
      }

      // Filter by type if provided
      if (type) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.type, type as string))
          : eq(table.type, type as string);
      }

      // Filter by userId if provided
      if (userId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.userId, parseInt(userId as string)))
          : eq(table.userId, parseInt(userId as string));
      }

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
      const { limit = '50', region, area, type } = req.query;

      let whereCondition = eq(table.userId, parseInt(userId));

      // Additional filters
      if (region) {
        whereCondition = and(whereCondition, eq(table.region, region as string));
      }
      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }
      if (type) {
        whereCondition = and(whereCondition, eq(table.type, type as string));
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

  // GET BY Region
  app.get(`/api/${endpoint}/region/:region`, async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const { limit = '50', area, type } = req.query;

      let whereCondition = eq(table.region, region);

      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }
      if (type) {
        whereCondition = and(whereCondition, eq(table.type, type as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Area
  app.get(`/api/${endpoint}/area/:area`, async (req: Request, res: Response) => {
    try {
      const { area } = req.params;
      const { limit = '50', type, region } = req.query;

      let whereCondition = eq(table.area, area);

      if (region) {
        whereCondition = and(whereCondition, eq(table.region, region as string));
      }
      if (type) {
        whereCondition = and(whereCondition, eq(table.type, type as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Area error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file - following your exact pattern
export default function setupDealersRoutes(app: Express) {
  // 4. Dealers - no date field for filtering
  createAutoCRUD(app, {
    endpoint: 'dealers',
    table: dealers,
    schema: insertDealerSchema,
    tableName: 'Dealer'
    // No auto fields needed - all required fields should be provided
    // No dateField since dealers doesn't have date-based filtering like DVR/TVR
  });
  
  console.log('✅ Dealers GET endpoints setup complete');
}