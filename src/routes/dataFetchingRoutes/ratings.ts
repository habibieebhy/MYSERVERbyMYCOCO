//  server/src/routes/dataFetchingRoutes/ratings.ts 
// Ratings GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { ratings, insertRatingSchema } from '../../db/schema';
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

  // GET ALL - with optional filtering
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', userId, area, region, rating, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Filter by userId
      if (userId) {
        whereCondition = eq(table.userId, parseInt(userId as string));
      }

      // Filter by area
      if (area) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.area, area as string))
          : eq(table.area, area as string);
      }

      // Filter by region
      if (region) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.region, region as string))
          : eq(table.region, region as string);
      }

      // Filter by rating
      if (rating) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.rating, parseInt(rating as string)))
          : eq(table.rating, parseInt(rating as string));
      }

      // Additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === 'userId' || key === 'rating') {
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
        .orderBy(desc(table.rating))
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
      const { limit = '50', area, region, rating } = req.query;

      let whereCondition = eq(table.userId, parseInt(userId));

      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }
      if (region) {
        whereCondition = and(whereCondition, eq(table.region, region as string));
      }
      if (rating) {
        whereCondition = and(whereCondition, eq(table.rating, parseInt(rating as string)));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.rating))
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
      const [record] = await db.select().from(table).where(eq(table.id, parseInt(id))).limit(1);

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

  // GET BY Area
  app.get(`/api/${endpoint}/area/:area`, async (req: Request, res: Response) => {
    try {
      const { area } = req.params;
      const { limit = '50', userId, region } = req.query;

      let whereCondition = eq(table.area, area);

      if (userId) {
        whereCondition = and(whereCondition, eq(table.userId, parseInt(userId as string)));
      }
      if (region) {
        whereCondition = and(whereCondition, eq(table.region, region as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.rating))
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

  // GET BY Region
  app.get(`/api/${endpoint}/region/:region`, async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const { limit = '50', userId, area } = req.query;

      let whereCondition = eq(table.region, region);

      if (userId) {
        whereCondition = and(whereCondition, eq(table.userId, parseInt(userId as string)));
      }
      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.rating))
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

}

// Function call in the same file
export default function setupRatingsRoutes(app: Express) {
  // Ratings - no date field, simple CRUD
  createAutoCRUD(app, {
    endpoint: 'ratings',
    table: ratings,
    schema: insertRatingSchema,
    tableName: 'Rating'
    // No auto fields or date fields needed
  });
  
  console.log('✅ Ratings GET endpoints setup complete');
}