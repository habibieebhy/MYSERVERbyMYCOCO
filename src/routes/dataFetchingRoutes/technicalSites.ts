// server/src/routes/dataFetchingRoutes/technicalSites.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { technicalSites, insertTechnicalSiteSchema } from '../../db/schema';
import { eq, and, desc, asc, ilike, sql, SQL, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// Ensure the table type is correctly inferred for Drizzle ORM helpers
type TableLike = typeof technicalSites;

// ---------- helpers (copied from dealers.ts/dvr.ts for self-containment) ----------
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const boolish = (v: unknown) => {
  if (v === 'true' || v === true) return true;
  if (v === 'false' || v === false) return false;
  return undefined;
};

// Custom auto-CRUD function tailored for the TechnicalSite table
function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: TableLike,
  schema: z.ZodSchema,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  // --- buildWhere: Custom logic for TechnicalSite filters ---
  const buildWhere = (q: any) => {
    const conds: (SQL | undefined)[] = [];

    // General filters
    if (q.region) conds.push(eq(table.region, String(q.region)));
    if (q.area) conds.push(eq(table.area, String(q.area)));
    if (q.siteType) conds.push(eq(table.siteType, String(q.siteType)));
    if (q.stageOfConstruction) conds.push(eq(table.stageOfConstruction, String(q.stageOfConstruction)));

    // Boolean filters (convertedSite, needFollowUp)
    const convertedSite = boolish(q.convertedSite);
    if (convertedSite !== undefined) conds.push(eq(table.convertedSite, convertedSite));

    const needFollowUp = boolish(q.needFollowUp);
    if (needFollowUp !== undefined) conds.push(eq(table.needFollowUp, needFollowUp));

    // Primary FK filters
    if (q.relatedDealerID) conds.push(eq(table.relatedDealerID, String(q.relatedDealerID)));
    if (q.relatedMasonpcID) conds.push(eq(table.relatedMasonpcID, String(q.relatedMasonpcID)));

    // Date Range Filters (using firstVistDate or lastVisitDate for convenience)
    const dateField = table.firstVistDate;
    if (q.startDate && q.endDate && dateField) {
      conds.push(
        and(
          gte(dateField, q.startDate as string),
          lte(dateField, q.endDate as string)
        )
      );
    }

    // Search filter (siteName, concernedPerson, phoneNo, keyPersonName)
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql`(${ilike(table.siteName, s)} 
          OR ${ilike(table.concernedPerson, s)} 
          OR ${ilike(table.phoneNo, s)} 
          OR ${ilike(table.keyPersonName, s)})`
      );
    }

    const finalConds = conds.filter(Boolean) as SQL[];
    if (finalConds.length === 0) return undefined;
    return finalConds.length === 1 ? finalConds[0] : and(...finalConds);
  };

  // --- buildSort: Custom sort logic for TechnicalSite ---
  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    switch (sortByRaw) {
      case 'siteName':
        return direction === 'asc' ? asc(table.siteName) : desc(table.siteName);
      case 'region':
        return direction === 'asc' ? asc(table.region) : desc(table.region);
      case 'lastVisitDate':
        return direction === 'asc' ? asc(table.lastVisitDate) : desc(table.lastVisitDate);
      case 'firstVistDate':
        return direction === 'asc' ? asc(table.firstVistDate) : desc(table.firstVistDate);
      case 'convertedSite':
        return direction === 'asc' ? asc(table.convertedSite) : desc(table.convertedSite);
      case 'createdAt':
        return direction === 'asc' ? asc(table.createdAt) : desc(table.createdAt);
      default:
        // Default to last visited date if available, otherwise createdAt
        return desc(table.lastVisitDate || table.createdAt);
    }
  };

  const listHandler = async (req: Request, res: Response, baseWhere?: SQL) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const extra = buildWhere(filters);
      const whereCondition = baseWhere ? (extra ? and(baseWhere, extra) : baseWhere) : extra;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ===== GET ALL (Base Filtered List) =====
  // /api/technical-sites
  app.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));

  // ===== GET BY ID =====
  // /api/technical-sites/:id
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      
      if (!record) return res.status(404).json({ success: false, error: `${tableName} not found` });
      
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

  // ===== GET BY PHONE NUMBER (Unique Lookup) =====
  // /api/technical-sites/phone/:phoneNo
  app.get(`/api/${endpoint}/phone/:phoneNo`, async (req: Request, res: Response) => {
    try {
      const { phoneNo } = req.params;
      const [record] = await db.select().from(table).where(eq(table.phoneNo, phoneNo)).limit(1);
      
      if (!record) return res.status(404).json({ success: false, error: `${tableName} not found` });
      
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
    }
  });

  // ===== GET BY REGION =====
  // /api/technical-sites/region/:region
  app.get(`/api/${endpoint}/region/:region`, (req, res) => {
    const base = eq(table.region, String(req.params.region));
    return listHandler(req, res, base);
  });

  // ===== GET BY AREA =====
  // /api/technical-sites/area/:area
  app.get(`/api/${endpoint}/area/:area`, (req, res) => {
    const base = eq(table.area, String(req.params.area));
    return listHandler(req, res, base);
  });

  // ===== GET BY DEALER ID (Primary Dealer) =====
  // /api/technical-sites/dealer/:dealerId
  app.get(`/api/${endpoint}/dealer/:dealerId`, (req, res) => {
    const base = eq(table.relatedDealerID, String(req.params.dealerId));
    return listHandler(req, res, base);
  });
}

export default function setupTechnicalSitesRoutes(app: Express) {
  // Assuming 'insertTechnicalSiteSchema' exists and is imported from schema.ts
  // You would typically define POST/PUT/DELETE handlers here, but this example focuses on GET
  
  createAutoCRUD(app, {
    endpoint: 'technical-sites',
    table: technicalSites,
    schema: insertTechnicalSiteSchema,
    tableName: 'Technical Site',
  });
  
  console.log('✅ Technical Sites GET endpoints setup complete');
}