// server/src/routes/dataFetchingRoutes/schemesOffers.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { schemesOffers, masonOnScheme, masonPcSide } from '../../db/schema';
import { eq, and, desc, asc, ilike, sql, SQL, gte, lte, or, isNull, count, lt, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';

// ---------- helpers ----------
const boolish = (v: unknown) => {
  if (v === 'true' || v === true) return true;
  if (v === 'false' || v === false) return false;
  return undefined;
};

export default function setupSchemesOffersRoutes(app: Express) {
  const endpoint = 'schemes';
  const table = schemesOffers;
  const tableName = 'Scheme/Offer';

  // Build WHERE conditions based on query params
  const buildWhere = (q: any) => {
    const conds: (SQL | undefined)[] = [];
    const { search, activeNow } = q;

    // lightweight search
    if (search) {
      const s = `%${String(search).trim()}%`;
      conds.push(
        sql`(${ilike(table.name, s)} OR ${ilike(table.description, s)})`
      );
    }

    // Status filter
    const isActive = boolish(activeNow);
    if (isActive !== undefined) {
      const now = new Date();
      if (isActive === true) {
        // Active: Start date is in the past, AND (End date is in the future OR end date is null)
        conds.push(
          and(
            lte(table.startDate, now),
            or(
              gte(table.endDate, now),
              isNull(table.endDate)
            )
          )
        );
      } else { // activeNow === false
        // Expired: End date is in the past
        conds.push(lt(table.endDate, now));
      }
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
      case 'startDate':
        return direction === 'asc' ? asc(table.startDate) : desc(table.startDate);
      case 'endDate':
        return direction === 'asc' ? asc(table.endDate) : desc(table.endDate);
      case 'participantCount':
        // We sort by the aliased 'participantCount' column
        return direction === 'asc' ? asc(sql`"participantCount"`) : desc(sql`"participantCount"`);
      default:
        // Default to start date descending
        return desc(table.startDate);
    }
  };

  // ===== GET ALL =====
  // Fetches all schemes, with participant counts
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;

      const whereCondition = buildWhere(filters);
      const orderExpr = buildSort(String(sortBy), String(sortDir));

      // Subquery to count participants for each scheme
      const participantCountSubquery = db
        .select({
          schemeId: masonOnScheme.schemeId,
          count: sql<number>`count(*)::int`.as('participantCount')
        })
        .from(masonOnScheme)
        .groupBy(masonOnScheme.schemeId)
        .as('counts');

      // 1. Start query
      let q = db.select({
          // Select all columns from schemesOffers
          ...getTableColumns(table),
          // Select the count from the subquery
          participantCount: participantCountSubquery.count
        })
        .from(table)
        // Left join the subquery
        .leftJoin(participantCountSubquery, eq(table.id, participantCountSubquery.schemeId))
        .$dynamic();

      // 2. Conditionally apply where
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      
      // 3. Apply sorting/paging and execute
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);

      // Handle snake_case vs camelCase mapping
      const result = data.map(r => {
        // 'r' will be { ...schemes_offers_columns, participantCount: number }
        // We trust the driver to camelCase the schema columns.
        // If it fails, we'd use the snake_case fix:
        // const { schemes_offers, ...rest } = r as any;
        // return { ...schemes_offers, participantCount: r.participantCount || 0 };
        
        // Assuming camelCase works:
        return { ...r, participantCount: r.participantCount || 0 };
      });

      res.json({ success: true, page: pg, limit: lmt, count: data.length, data: result });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== GET BY ID =====
  // Fetches a single scheme by ID, with a list of participants
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Query 1: Get the scheme details
      const schemeQuery = db.select()
        .from(table)
        .where(eq(table.id, id))
        .limit(1);

      // Query 2: Get all participants for this scheme
      const participantsQuery = db.select()
        .from(masonOnScheme)
        .leftJoin(masonPcSide, eq(masonOnScheme.masonId, masonPcSide.id))
        .where(eq(masonOnScheme.schemeId, id))
        .orderBy(asc(masonPcSide.name));

      // Run in parallel
      const [schemeResult, participantsResult] = await Promise.all([
        schemeQuery,
        participantsQuery
      ]);

      const [scheme] = schemeResult;
      
      if (!scheme) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }
      
      // Flatten participants and handle potential snake_case key
      const participants = participantsResult.map(r => {
        // Use the snake_case fix established in other files
        return { ...r.mason_on_scheme, mason: r.mason_pc_side };
      });

      // Combine and return
      res.json({ 
        success: true, 
        data: {
          ...scheme,
          participants: participants
        }
      });

    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Schemes & Offers GET endpoints setup complete');
}