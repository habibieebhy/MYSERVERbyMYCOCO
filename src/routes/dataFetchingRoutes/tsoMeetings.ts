// server/src/routes/dataFetchingRoutes/tsoMeetings.ts
// TSO Meetings GET endpoints (FIXED)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { tsoMeetings } from '../../db/schema';
// --- ✅ FIX: Correctly import SQL type ---
import { eq, and, desc, gte, lte, asc, SQL } from 'drizzle-orm';

const table = tsoMeetings;
const tableName = 'TSO Meeting';

// --- Centralized Helper ---
const numberish = (v: unknown) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// --- Centralized WHERE builder ---
function buildWhere(q: any) {
  // --- ✅ FIX: Use 'SQL' type directly ---
  const conds: (SQL | undefined)[] = [];

  const { startDate, endDate, type } = q;
  if (startDate && endDate) {
    conds.push(and(
      gte(table.date, String(startDate)),
      lte(table.date, String(endDate))
    ));
  }

  if (type) {
    conds.push(eq(table.type, String(type)));
  }

  const uid = numberish(q.createdByUserId);
  if (uid !== undefined) {
    conds.push(eq(table.createdByUserId, uid));
  }
  
  // --- ✅ FIX: Use 'SQL' type directly ---
  const finalConds = conds.filter(Boolean) as SQL[];
  if (finalConds.length === 0) return undefined;
  return and(...finalConds);
}

// --- Centralized Sort builder ---
function buildSort(sortByRaw?: string, sortDirRaw?: string) {
  const sortKey = sortByRaw === 'createdAt' ? 'createdAt' : 'date';
  const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
  return direction === 'asc' ? asc(table[sortKey]) : desc(table[sortKey]);
}

export default function setupTsoMeetingsGetRoutes(app: Express) {
  const endpoint = 'tso-meetings';

  // GET ALL (with filters)
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir } = req.query;
      
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCondition = buildWhere(req.query);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      let q = db.select().from(table);
      if (whereCondition) {
        // @ts-ignore
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
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

  // GET BY User ID (created_by_user_id)
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', page = '1', sortBy, sortDir } = req.query;

      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const filters = buildWhere(req.query);
      const uid = numberish(userId);
      if (uid === undefined) {
         return res.status(400).json({ success: false, error: 'Invalid User ID' });
      }

      const userCond = eq(table.createdByUserId, uid);
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

  console.log('✅ TSO Meetings GET endpoints setup complete');
}