// src/routes/dataFetchingRoutes/pointsLedger.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { pointsLedger } from '../../db/schema'; // Import the table
import { eq, and, desc, asc, SQL, gte, lte } from 'drizzle-orm';

/**
 * Sets up GET routes for the points_ledger table.
 *
 * 1. GET /api/points-ledger
 * - Optional query params: ?limit=... & ?page=... & ?masonId=... & ?sourceType=...
 * - Date range: ?startDate=... & ?endDate=... (filters on createdAt)
 * - Returns a paginated and filtered list of all points ledger entries.
 *
 * 2. GET /api/points-ledger/:id
 * - Returns a single entry by its ID.
 *
 * 3. GET /api/points-ledger/mason/:masonId
 * - Returns all entries for a specific mason.
 *
 * 4. GET /api/points-ledger/source/:sourceId
 * - Returns all entries associated with a specific sourceId.
 */
export default function setupPointsLedgerGetRoutes(app: Express) {

    // Helper to build WHERE clause for filtering
    const buildWhere = (q: any): SQL | undefined => {
        const conds: SQL[] = [];

        // Filter by masonId
        if (q.masonId) {
            conds.push(eq(pointsLedger.masonId, String(q.masonId)));
        }

        // Filter by sourceType ("bag_lift" | "redemption" | "adjustment")
        if (q.sourceType) {
            conds.push(eq(pointsLedger.sourceType, String(q.sourceType)));
        }

        // Filter by sourceId
        if (q.sourceId) {
            // NOTE: sourceId is nullable in the schema, but eq() handles null comparison correctly.
            conds.push(eq(pointsLedger.sourceId, String(q.sourceId)));
        }

        // Date range filtering on createdAt
        const startDate = q.startDate as string | undefined;
        const endDate = q.endDate as string | undefined;
        
        if (startDate && endDate) {
            // Convert date strings to Date objects for Drizzle's timestamp comparisons
            const start = new Date(startDate);
            // To ensure we filter up to the end of the day on the endDate, we advance it by 1 day
            // and use lte on the column against the original date, or use lt against the next day.
            // For simplicity and common use case (inclusive date range):
            const end = new Date(endDate); 

            // Basic validation: ensure dates are valid
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                // Push the conditions individually into the conds array
                conds.push(gte(pointsLedger.createdAt, start));
                conds.push(lte(pointsLedger.createdAt, end));
            } else {
                 console.warn('Invalid startDate or endDate provided for pointsLedger filter.');
            }
        }

        if (conds.length === 0) return undefined;
        
        // FIX: If there are multiple conditions, combine them using `and`.
        // Drizzle's and() function handles the `SQL[]` input without type errors if length is checked.
        // If there is only one condition, return it directly.
        return conds.length === 1 ? conds[0] : and(...conds);
    };

    // Helper to build ORDER BY clause
    const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
        const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';

        switch (sortByRaw) {
            case 'createdAt':
                return direction === 'asc' ? asc(pointsLedger.createdAt) : desc(pointsLedger.createdAt);
            case 'points':
                return direction === 'asc' ? asc(pointsLedger.points) : desc(pointsLedger.points);
            case 'sourceType':
                return direction === 'asc' ? asc(pointsLedger.sourceType) : desc(pointsLedger.sourceType);
            default:
                // Default sort by creation date descending (most recent first)
                return desc(pointsLedger.createdAt);
        }
    };

    // Generic list handler for reuse in specific routes
    const listHandler = async (req: Request, res: Response, baseWhere?: SQL) => {
        try {
            const { limit = '50', page = '1', sortBy, sortDir, ...filters } = req.query;
            const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
            const pg = Math.max(1, parseInt(String(page), 10) || 1);
            const offset = (pg - 1) * lmt;

            const extra = buildWhere(filters);
            
            // This is the cleanest and most robust way to combine optional SQL conditions:
            const conds: SQL[] = [];
            if (baseWhere) conds.push(baseWhere);
            if (extra) conds.push(extra);
            
            // Combine conditions only if they exist, resulting in SQL | undefined.
            const whereCondition: SQL | undefined = conds.length > 0 ? and(...conds) : undefined;
            const orderExpr = buildSort(String(sortBy), String(sortDir));

            let query = db.select().from(pointsLedger).$dynamic();

            // The critical check that resolves the error: only call .where() if SQL object exists
            if (whereCondition) {
                query = query.where(whereCondition);
            }

            const data = await query
                .orderBy(orderExpr)
                .limit(lmt)
                .offset(offset);

            res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
        } catch (error) {
            console.error(`Get Points Ledger list error:`, error);
            res.status(500).json({
                success: false,
                error: `Failed to fetch points ledger entries`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };


    // 1. GET ALL (with pagination, filtering, and sorting)
    app.get('/api/points-ledger', (req, res) => listHandler(req, res));

    // 2. GET BY ID
    app.get('/api/points-ledger/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const [record] = await db.select()
                .from(pointsLedger)
                .where(eq(pointsLedger.id, id))
                .limit(1);

            if (!record) {
                return res.status(404).json({ success: false, error: 'Points Ledger entry not found' });
            }

            res.json({ success: true, data: record });
        } catch (error) {
            console.error(`Get Points Ledger by ID error:`, error);
            res.status(500).json({
                success: false,
                error: `Failed to fetch points ledger entry`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 3. GET BY MASON ID
    app.get('/api/points-ledger/mason/:masonId', (req, res) => {
        const { masonId } = req.params;
        if (!masonId) {
            return res.status(400).json({ success: false, error: 'Mason ID is required.' });
        }
        const base = eq(pointsLedger.masonId, masonId);
        return listHandler(req, res, base);
    });

    // 4. GET BY SOURCE ID
    app.get('/api/points-ledger/source/:sourceId', (req, res) => {
        const { sourceId } = req.params;
        if (!sourceId) {
            return res.status(400).json({ success: false, error: 'Source ID is required.' });
        }
        const base = eq(pointsLedger.sourceId, sourceId);
        return listHandler(req, res, base);
    });


    console.log('✅ Points Ledger GET endpoints setup complete');
}