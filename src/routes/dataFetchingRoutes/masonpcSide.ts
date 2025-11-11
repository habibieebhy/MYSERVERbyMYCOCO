// src/routes/dataFetchingRoutes/masonpcSide.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonPcSide, users, dealers } from '../../db/schema'; // Import users and dealers for joins
import { eq, and, desc, asc, ilike, sql, SQL, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';

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

// Main factory function
function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof masonPcSide,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  // Build WHERE conditions based on query params
  const buildWhere = (q: any) => {
    const conds: (SQL | undefined)[] = [];
    const { userId, dealerId, kycStatus, isReferred, search } = q;

    if (userId) {
      const uid = numberish(userId);
      if (uid !== undefined) conds.push(eq(table.userId, uid));
    }
    if (dealerId) {
      conds.push(eq(table.dealerId, String(dealerId)));
    }
    if (kycStatus) {
      conds.push(eq(table.kycStatus, String(kycStatus))); 
    }
    const referred = boolish(isReferred);
    if (referred !== undefined) {
      conds.push(eq(table.isReferred, referred));
    }

    // lightweight search
    if (search) {
      const s = `%${String(search).trim()}%`;
      conds.push(
        sql`(${ilike(table.name, s)} 
          OR ${ilike(table.phoneNumber, s)} 
          OR ${ilike(table.kycDocumentIdNum, s)})`
      );
    }

    const finalConds = conds.filter(Boolean) as SQL[];
    if (finalConds.length === 0) return undefined;
    return finalConds.length === 1 ? finalConds[0] : and(...finalConds);
  };

  // Build ORDER BY expression
  const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
    const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    switch (sortByRaw) {
      case 'name':
        return direction === 'asc' ? asc(table.name) : desc(table.name);
      case 'pointsBalance':
        return direction === 'asc' ? asc(table.pointsBalance) : desc(table.pointsBalance);
      case 'bagsLifted':
        return direction === 'asc' ? asc(table.bagsLifted) : desc(table.bagsLifted);
      case 'kycStatus':
        return direction === 'asc' ? asc(table.kycStatus) : desc(table.kycStatus);
      default:
        // Default to name
        return asc(table.name);
    }
  };

  // Generic list handler
  const listHandler = async (req: Request, res: Response, baseWhere?: SQL) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const extra = buildWhere(filters);
      const whereCondition = baseWhere ? (extra ? and(baseWhere, extra) : baseWhere) : extra;
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // 1. Start query - This is where we add joins
      let q = db.select({
          // Select all columns from masonPcSide
          ...getTableColumns(table),
          // And add joined names
          dealerName: dealers.name,
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
        })
        .from(table)
        .leftJoin(dealers, eq(table.dealerId, dealers.id))
        .leftJoin(users, eq(table.userId, users.id))
        .$dynamic();

      // 2. Conditionally apply where
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      
      // 3. Apply sorting/paging and execute
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      // We trust the snake_case -> camelCase conversion from Drizzle/node-postgres
      // The result `data` will have { ...masonPcSide_fields, dealerName, userName }
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
  // Fetches all masons, with joins for dealer and user names
  app.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));

  // ===== GET BY ID =====
  // Fetches a single mason by ID, with joins
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
          ...getTableColumns(table),
          dealerName: dealers.name,
          userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
        })
        .from(table)
        .leftJoin(dealers, eq(table.dealerId, dealers.id))
        .leftJoin(users, eq(table.userId, users.id))
        .where(eq(table.id, id))
        .limit(1);
      
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

  // ===== GET BY USER (TSO) =====
  app.get(`/api/${endpoint}/user/:userId`, (req, res) => {
    const uid = numberish(req.params.userId);
    if (uid === undefined) {
      return res.status(400).json({ success: false, error: 'Invalid User ID' });
    }
    const base = eq(table.userId, uid);
    return listHandler(req, res, base);
  });
  
  // ===== GET BY DEALER =====
  app.get(`/api/${endpoint}/dealer/:dealerId`, (req, res) => {
    const { dealerId } = req.params;
    if (!dealerId) {
       return res.status(400).json({ success: false, error: 'Invalid Dealer ID' });
    }
    const base = eq(table.dealerId, dealerId);
    return listHandler(req, res, base);
  });
}

// Function call to set up the routes
export default function setupMasonsPcSideRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'masons', // API will be /api/masons
    table: masonPcSide,
    tableName: 'Mason',
  });
  
  console.log('✅ Masons (PC Side) GET endpoints setup complete');
}