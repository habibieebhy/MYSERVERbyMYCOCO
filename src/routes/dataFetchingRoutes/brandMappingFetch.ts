// server/src/routes/dataFetchingRoutes/brandMappingFetch.ts
// Brands and Dealer Brand Mapping GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { brands, dealerBrandMapping, insertBrandSchema, insertDealerBrandMappingSchema } from '../../db/schema';
import { eq, and, desc, like } from 'drizzle-orm';
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

  // BRANDS ENDPOINTS
  if (endpoint === 'brands') {
    // GET ALL Brands - with optional filtering
    app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
      try {
        const { limit = '50', search, name, ...filters } = req.query;

        let whereCondition: any = undefined;

        // Search by name (partial match)
        if (search) {
          whereCondition = like(table.name, `%${search}%`);
        }

        // Filter by exact name
        if (name) {
          whereCondition = whereCondition 
            ? and(whereCondition, eq(table.name, name as string))
            : eq(table.name, name as string);
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

        const records = await query
          .orderBy(table.name) // Order by name alphabetically
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

    // GET Brand BY ID
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

    // GET Brand BY Name
    app.get(`/api/${endpoint}/name/:name`, async (req: Request, res: Response) => {
      try {
        const { name } = req.params;
        const [record] = await db.select().from(table).where(eq(table.name, name)).limit(1);

        if (!record) {
          return res.status(404).json({
            success: false,
            error: `${tableName} with name '${name}' not found`
          });
        }

        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Get ${tableName} by name error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  // DEALER BRAND MAPPING ENDPOINTS
  if (endpoint === 'dealer-brand-mapping') {
    // GET ALL Mappings - with optional filtering
    app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
      try {
        const { limit = '50', dealerId, brandId, ...filters } = req.query;

        let whereCondition: any = undefined;

        // Filter by dealerId
        if (dealerId) {
          whereCondition = eq(table.dealerId, dealerId as string);
        }

        // Filter by brandId
        if (brandId) {
          whereCondition = whereCondition 
            ? and(whereCondition, eq(table.brandId, parseInt(brandId as string)))
            : eq(table.brandId, parseInt(brandId as string));
        }

        // Additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value && table[key]) {
            if (key === 'brandId') {
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
          .orderBy(desc(table.capacityMT)) // Order by capacity descending
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

    // GET Mapping BY ID
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

    // GET Mappings BY Dealer ID
    app.get(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
      try {
        const { dealerId } = req.params;
        const { limit = '50', brandId } = req.query;

        let whereCondition = eq(table.dealerId, dealerId);

        // Additional filter by brandId
        if (brandId) {
          whereCondition = and(whereCondition, eq(table.brandId, parseInt(brandId as string)));
        }

        const records = await db.select().from(table)
          .where(whereCondition)
          .orderBy(desc(table.capacityMT))
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

    // GET Mappings BY Brand ID
    app.get(`/api/${endpoint}/brand/:brandId`, async (req: Request, res: Response) => {
      try {
        const { brandId } = req.params;
        const { limit = '50', dealerId } = req.query;

        let whereCondition = eq(table.brandId, parseInt(brandId));

        // Additional filter by dealerId
        if (dealerId) {
          whereCondition = and(whereCondition, eq(table.dealerId, dealerId as string));
        }

        const records = await db.select().from(table)
          .where(whereCondition)
          .orderBy(desc(table.capacityMT))
          .limit(parseInt(limit as string));

        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName}s by Brand error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}s`,
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

}

// Function calls in the same file - setup both endpoints
export default function setupBrandsAndMappingRoutes(app: Express) {
  // 1. Brands - no date field, simple CRUD
  createAutoCRUD(app, {
    endpoint: 'brands',
    table: brands,
    schema: insertBrandSchema,
    tableName: 'Brand'
    // No auto fields or date fields needed
  });

  // 2. Dealer Brand Mapping - no date field, relationship mapping
  createAutoCRUD(app, {
    endpoint: 'dealer-brand-mapping',
    table: dealerBrandMapping,
    schema: insertDealerBrandMappingSchema,
    tableName: 'Dealer Brand Mapping'
    // No auto fields or date fields needed
  });
  
  console.log('✅ Brands and Dealer Brand Mapping GET endpoints setup complete');
}