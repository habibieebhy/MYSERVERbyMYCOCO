// server/src/routes/dataFetchingRoutes/dealers.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers, insertDealerSchema } from '../../db/schema';
import { eq, and, desc, asc, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

type TableLike = typeof dealers;

// ---------- helpers ----------
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

// normalize brand query to string[]
function extractBrands(q: any): string[] {
  const raw = q.brand ?? q.brands ?? q.brandSelling ?? undefined;
  if (!raw) return [];
  const arr = Array.isArray(raw)
    ? raw
    : String(raw).includes(',')
      ? String(raw).split(',').map(s => s.trim()).filter(Boolean)
      : [String(raw).trim()].filter(Boolean);
  return arr as string[];
}

// safely convert to a Postgres array literal, used as a bound parameter
function toPgArrayLiteral(values: string[]): string {
  return `{${values
    .map(v =>
      String(v)
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .trim()
    )
    .join(',')}}`;
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: TableLike,
  schema: z.ZodSchema,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  const SORT_WHITELIST: Record<string, keyof typeof table> = {
    createdAt: 'createdAt',
    name: 'name',
    region: 'region',
    area: 'area',
    type: 'type',
    verification_status: 'verificationStatus',
    verificationStatus: 'verificationStatus',
  };

  const buildWhere = (q: any) => {
    const conds: any[] = [];

    // optional filters (NO default verification filter)
    if (q.region) conds.push(eq(table.region, String(q.region)));
    if (q.area) conds.push(eq(table.area, String(q.area)));
    if (q.type) conds.push(eq(table.type, String(q.type)));
    if (q.userId) {
      const uid = numberish(q.userId);
      if (uid !== undefined) conds.push(eq(table.userId, uid));
    }
    if (q.verificationStatus) conds.push(eq(table.verificationStatus, String(q.verificationStatus)));
    if (q.pinCode) conds.push(eq(table.pinCode, String(q.pinCode)));
    if (q.businessType) conds.push(eq(table.businessType, String(q.businessType)));

    // hierarchy filters
    const onlyParents = boolish(q.onlyParents);
    const onlySubs = boolish(q.onlySubs);
    const parentDealerId = q.parentDealerId as string | undefined;

    if (parentDealerId) {
      conds.push(eq(table.parentDealerId, parentDealerId));
    } else if (onlyParents) {
      conds.push(sql`${table.parentDealerId} IS NULL`);
    } else if (onlySubs) {
      conds.push(sql`${table.parentDealerId} IS NOT NULL`);
    }

    // lightweight search
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql`(${ilike(table.name, s)} 
          OR ${ilike(table.phoneNo, s)} 
          OR ${ilike(table.address, s)} 
          OR ${ilike(table.emailId, s)})`
      );
    }

    // brandSelling filters
    const brands = extractBrands(q);
    if (brands.length) {
      const arrLiteral = toPgArrayLiteral(brands); // e.g. {Ultratech,Star}
      const anyBrand = boolish(q.anyBrand); // ?anyBrand=true => overlap (ANY); default is ALL
      if (anyBrand) {
        conds.push(sql`${table.brandSelling} && ${arrLiteral}::text[]`);
      } else {
        conds.push(sql`${table.brandSelling} @> ${arrLiteral}::text[]`);
      }
    }

    if (!conds.length) return undefined;
    return conds.length === 1 ? conds[0] : and(...conds);
  };

  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const sortByKey = sortByRaw && SORT_WHITELIST[sortByRaw] ? SORT_WHITELIST[sortByRaw] : 'createdAt';
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    return direction === 'asc' ? asc(table[sortByKey]) : desc(table[sortByKey]);
  };

  const listHandler = async (req: Request, res: Response, baseWhere?: any) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const extra = buildWhere(filters);
      const whereCondition = baseWhere ? (extra ? and(baseWhere, extra) : baseWhere) : extra;

      const orderExpr = buildSort(String(sortBy), String(sortDir));
      let q = db.select().from(table).orderBy(orderExpr).limit(lmt).offset(offset);
      if (whereCondition) q = q.where(whereCondition);

      const data = await q;
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

  // ===== GET ALL =====
  app.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));

  // ===== GET BY USER =====
  app.get(`/api/${endpoint}/user/:userId`, (req, res) => {
    const { userId } = req.params;
    const base = eq(table.userId, parseInt(userId, 10));
    return listHandler(req, res, base);
    });

  // ===== GET BY ID =====
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

  // ===== GET BY REGION =====
  app.get(`/api/${endpoint}/region/:region`, (req, res) => {
    const base = eq(table.region, String(req.params.region));
    return listHandler(req, res, base);
  });

  // ===== GET BY AREA =====
  app.get(`/api/${endpoint}/area/:area`, (req, res) => {
    const base = eq(table.area, String(req.params.area));
    return listHandler(req, res, base);
  });
}

export default function setupDealersRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealers',
    table: dealers,
    schema: insertDealerSchema,
    tableName: 'Dealer',
  });
  console.log('✅ Dealers GET endpoints with brandSelling & no default verification filter ready');
}
