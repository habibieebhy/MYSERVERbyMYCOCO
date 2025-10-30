// server/src/routes/dataFetchingRoutes/tvr.ts 
// --- REFACTORED & FIXED (AGAIN) ---
// Technical Visit Reports GET endpoints with robust, centralized filtering

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { technicalVisitReports } from '../../db/schema';
import { eq, and, desc, gte, lte, asc, SQL } from 'drizzle-orm';

const table = technicalVisitReports;
const tableName = 'Technical Visit Report';
const dateField = 'reportDate';

// --- Centralized Helper ---
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// --- Centralized WHERE builder ---
function buildWhere(q: any) {
  const conds: (SQL | undefined)[] = []; // Use (SQL | undefined)[] for type safety

  // Date range filtering
  const { startDate, endDate } = q;
  if (startDate && endDate) {
    conds.push(and(
      gte(table[dateField], String(startDate)),
      lte(table[dateField], String(endDate))
    ));
  }

  // --- ✅ TS FIX: Explicit checks, no loop ---
  if (q.visitType) {
    conds.push(eq(table.visitType, String(q.visitType)));
  }
  if (q.serviceType) {
    conds.push(eq(table.serviceType, String(q.serviceType)));
  }
  if (q.pjpId) {
    conds.push(eq(table.pjpId, String(q.pjpId)));
  }
  if (q.meetingId) {
    conds.push(eq(table.meetingId, String(q.meetingId)));
  }
  if (q.isVerificationStatus) {
    conds.push(eq(table.isVerificationStatus, String(q.isVerificationStatus)));
  }
  if (q.siteVisitType) {
    conds.push(eq(table.siteVisitType, String(q.siteVisitType)));
  }
  // --- END FIX ---

  // Handle number filter
  const uid = numberish(q.userId);
  if (uid !== undefined) {
    conds.push(eq(table.userId, uid));
  }
  
  const finalConds = conds.filter(Boolean) as SQL[]; // Filter out undefined
  if (finalConds.length === 0) return undefined;
  return and(...finalConds);
}

// --- Centralized Sort builder ---
function buildSort(sortByRaw?: string, sortDirRaw?: string) {
  // Use 'reportDate' as default, allow 'createdAt'
  const sortKey: keyof typeof table = sortByRaw === 'createdAt' ? 'createdAt' : dateField;
  const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
  
  // Check if sortKey is a valid column before using it
  if (sortKey === 'reportDate' || sortKey === 'createdAt') {
     return direction === 'asc' ? asc(table[sortKey]) : desc(table[sortKey]);
  }
  // Default sort
  return desc(table[dateField]);
}

export default function setupTechnicalVisitReportsRoutes(app: Express) {
  const endpoint = 'technical-visit-reports';

  // GET ALL (with all filters)
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir } = req.query;
      
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCondition = buildWhere(req.query);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // 1. Start query
      let q = db.select().from(table);

      // 2. Conditionally apply where
      if (whereCondition) {
        // @ts-ignore - Drizzle's dynamic query type is hard to follow
        q = q.where(whereCondition);
      }

      // 3. Apply sorting/paging and execute
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });

    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // GET BY User ID (with all filters)
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      // Build filters from query, then add the mandatory userId
      const filters = buildWhere(req.query);
      const uid = numberish(userId); // Use numberish for safety
      if (uid === undefined) {
        return res.status(400).json({ success: false, error: 'Invalid User ID' });
      }
      
      const userCond = eq(table.userId, uid);
      const whereCondition = filters ? and(userCond, filters) : userCond;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table);
      // @ts-ignore
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });

    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // GET BY ID
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
    }
  });

  // GET BY Visit Type (with all filters)
  app.get(`/api/${endpoint}/visit-type/:visitType`, async (req: Request, res: Response) => {
    try {
      const { visitType } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      // Build filters from query, then add the mandatory visitType
      const filters = buildWhere(req.query);
      const visitCond = eq(table.visitType, visitType);
      const whereCondition = filters ? and(visitCond, filters) : visitCond;

      const orderExpr = buildSort(String(sortBy), String(sortDir));
      
      let q = db.select().from(table);
      // @ts-ignore
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // GET BY PJP ID (with all filters)
  app.get(`/api/${endpoint}/pjp/:pjpId`, async (req: Request, res: Response) => {
    try {
      const { pjpId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      // Build filters from query, then add the mandatory pjpId
      const filters = buildWhere(req.query);
      const pjpCond = eq(table.pjpId, pjpId);
      const whereCondition = filters ? and(pjpCond, filters) : pjpCond;

      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table);
      // @ts-ignore
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });
  
  console.log('✅ Technical Visit Reports GET endpoints setup complete (Refactored)');
}