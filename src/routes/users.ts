// server/src/routes/users.ts 
// Users GET endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../db/db';
import { users, companies, insertUserSchema } from '../db/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import { z, ZodType } from 'zod';

// Helper function to safely convert BigInt to JSON
function toJsonSafe(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

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
      const { limit = '50', role, region, area, status, companyId, search, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Search by name or email (partial match)
      if (search) {
        whereCondition = like(table.email, `%${search}%`);
      }

      // Filter by role
      if (role) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(table.role, role as string))
          : eq(table.role, role as string);
      }

      // Filter by region
      if (region) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(table.region, region as string))
          : eq(table.region, region as string);
      }

      // Filter by area
      if (area) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(table.area, area as string))
          : eq(table.area, area as string);
      }

      // Filter by status
      if (status) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(table.status, status as string))
          : eq(table.status, status as string);
      }

      // Filter by companyId
      if (companyId) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(table.companyId, parseInt(companyId as string)))
          : eq(table.companyId, parseInt(companyId as string));
      }

      // Additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === 'companyId' || key === 'reportsToId') {
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

      // 1. Create a base query that selects your fields.
      const baseQuery = db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      }).from(table);

      // 2. Use the .$dynamic() helper to create a version of the query
      //    that TypeScript will allow you to modify conditionally.
      let query = baseQuery.$dynamic();

      // 3. Apply the where clause only if it exists.
      //    This reassignment now works because of .$dynamic().
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      // 4. Chain the final methods and execute the query.
      const records = await query
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Company ID
  app.get(`/api/${endpoint}/company/:companyId`, async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { limit = '50', role, region, area, status } = req.query;

      let whereCondition: any = eq(table.companyId, parseInt(companyId));

      if (role) {
        whereCondition = and(whereCondition, eq(table.role, role as string));
      }
      if (region) {
        whereCondition = and(whereCondition, eq(table.region, region as string));
      }
      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }
      if (status) {
        whereCondition = and(whereCondition, eq(table.status, status as string));
      }

      const records = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      }).from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Company error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY ID (excludes sensitive data)
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      }).from(table).where(eq(table.id, parseInt(id))).limit(1);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }

      res.json({ success: true, data: toJsonSafe(record) });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Role
  app.get(`/api/${endpoint}/role/:role`, async (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      const { limit = '50', companyId, region, area, status } = req.query;

      let whereCondition: any = eq(table.role, role);

      if (companyId) {
        whereCondition = and(whereCondition, eq(table.companyId, parseInt(companyId as string)));
      }
      if (region) {
        whereCondition = and(whereCondition, eq(table.region, region as string));
      }
      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }
      if (status) {
        whereCondition = and(whereCondition, eq(table.status, status as string));
      }

      const records = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      }).from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Role error:`, error);
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
      const { limit = '50', companyId, role, area, status } = req.query;

      let whereCondition: any = eq(table.region, region);

      if (companyId) {
        whereCondition = and(whereCondition, eq(table.companyId, parseInt(companyId as string)));
      }
      if (role) {
        whereCondition = and(whereCondition, eq(table.role, role as string));
      }
      if (area) {
        whereCondition = and(whereCondition, eq(table.area, area as string));
      }
      if (status) {
        whereCondition = and(whereCondition, eq(table.status, status as string));
      }

      const records = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      }).from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
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
export default function setupUsersRoutes(app: Express) {
  // Users - no date field, user management
  createAutoCRUD(app, {
    endpoint: 'users',
    table: users,
    schema: insertUserSchema as ZodType<any>,
    tableName: 'User',
    // No auto fields or date fields needed
  });

  console.log('✅ Users GET endpoints setup complete');
}