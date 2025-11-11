// src/routes/dataFetchingRoutes/bagsLift.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { bagLifts, masonPcSide, dealers, users } from '../../db/schema'; // Import necessary tables
import { eq, and, desc, asc, SQL, gte, lte, getTableColumns, sql } from 'drizzle-orm';

/**
 * Sets up GET routes for the bag_lifts table.
 *
 * 1. GET /api/bag-lifts
 * - Optional query params: ?limit=... & ?page=... & ?masonId=... & ?dealerId=... & ?status=... & ?approvedBy=...
 * - Date range: ?startDate=... & ?endDate=... & ?dateField=purchaseDate | createdAt
 * - Returns a paginated and filtered list of all bag lift entries with joins to mason, dealer, and approver.
 *
 * 2. GET /api/bag-lifts/:id
 * - Returns a single entry by its ID with joins.
 *
 * 3. GET /api/bag-lifts/mason/:masonId
 * - Returns all entries for a specific mason.
 *
 * 4. GET /api/bag-lifts/dealer/:dealerId
 * - Returns all entries for a specific dealer.
 */
export default function setupBagLiftsGetRoutes(app: Express) {

    // Helper to safely convert to a number or undefined
    const numberish = (v: unknown) => {
      if (v === null || v === undefined || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    // Helper to build WHERE clause for filtering
    const buildWhere = (q: any): SQL | undefined => {
        const conds: SQL[] = [];

        // Filter by masonId (UUID)
        if (q.masonId) {
            conds.push(eq(bagLifts.masonId, String(q.masonId)));
        }

        // Filter by dealerId (VARCHAR)
        if (q.dealerId) {
            conds.push(eq(bagLifts.dealerId, String(q.dealerId)));
        }

        // Filter by status ("pending" | "approved" | ...)
        if (q.status) {
            conds.push(eq(bagLifts.status, String(q.status)));
        }

        // Filter by approvedBy (USER ID / INTEGER)
        const approvedBy = numberish(q.approvedBy);
        if (approvedBy !== undefined) {
            conds.push(eq(bagLifts.approvedBy, approvedBy));
        }

        // Date range filtering
        const startDate = q.startDate as string | undefined;
        const endDate = q.endDate as string | undefined;
        // Determine which column to filter on: purchaseDate (default) or createdAt
        const dateColumn = q.dateField === 'createdAt' ? bagLifts.createdAt : bagLifts.purchaseDate;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate); 

            // Basic validation: ensure dates are valid
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                // IMPORTANT: Push conditions individually. Combining gte/lte with inner 'and' is unnecessary 
                // as the outer 'and(...conds)' handles it correctly.
                conds.push(gte(dateColumn, start));
                conds.push(lte(dateColumn, end));
            } else {
                 console.warn('Invalid startDate or endDate provided for bagLifts filter.');
            }
        }

        if (conds.length === 0) return undefined;
        
        return conds.length === 1 ? conds[0] : and(...conds);
    };

    // Helper to build ORDER BY clause
    const buildSort = (sortByRaw?: string, sortDirRaw?: string) => {
        const direction = (sortDirRaw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';

        switch (sortByRaw) {
            case 'bagCount':
                return direction === 'asc' ? asc(bagLifts.bagCount) : desc(bagLifts.bagCount);
            case 'pointsCredited':
                return direction === 'asc' ? asc(bagLifts.pointsCredited) : desc(bagLifts.pointsCredited);
            case 'status':
                return direction === 'asc' ? asc(bagLifts.status) : desc(bagLifts.status);
            case 'purchaseDate':
                return direction === 'asc' ? asc(bagLifts.purchaseDate) : desc(bagLifts.purchaseDate);
            case 'createdAt':
            default:
                // Default sort by creation date descending (most recent first)
                return desc(bagLifts.createdAt);
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
            
            // Combine all where conditions
            const conds: SQL[] = [];
            if (baseWhere) conds.push(baseWhere);
            if (extra) conds.push(extra);
            
            const whereCondition: SQL | undefined = conds.length > 0 ? and(...conds) : undefined;
            const orderExpr = buildSort(String(sortBy), String(sortDir));

            // Query with joins to get contextual data
            let query = db.select({
                // Select all columns from bagLifts
                ...getTableColumns(bagLifts),
                // Add joined data
                masonName: masonPcSide.name,
                dealerName: dealers.name,
                approverName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
            })
            .from(bagLifts)
            .leftJoin(masonPcSide, eq(bagLifts.masonId, masonPcSide.id))
            .leftJoin(dealers, eq(bagLifts.dealerId, dealers.id))
            .leftJoin(users, eq(bagLifts.approvedBy, users.id))
            .$dynamic();

            // Conditionally apply where clause
            if (whereCondition) {
                query = query.where(whereCondition);
            }

            const data = await query
                .orderBy(orderExpr)
                .limit(lmt)
                .offset(offset);

            res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
        } catch (error) {
            console.error(`Get Bag Lifts list error:`, error);
            res.status(500).json({
                success: false,
                error: `Failed to fetch bag lift entries`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };


    // 1. GET ALL (with pagination, filtering, and sorting)
    app.get('/api/bag-lifts', (req, res) => listHandler(req, res));

    // 2. GET BY ID
    app.get('/api/bag-lifts/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const [record] = await db.select({
                ...getTableColumns(bagLifts),
                masonName: masonPcSide.name,
                dealerName: dealers.name,
                approverName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
            })
                .from(bagLifts)
                .leftJoin(masonPcSide, eq(bagLifts.masonId, masonPcSide.id))
                .leftJoin(dealers, eq(bagLifts.dealerId, dealers.id))
                .leftJoin(users, eq(bagLifts.approvedBy, users.id))
                .where(eq(bagLifts.id, id))
                .limit(1);

            if (!record) {
                return res.status(404).json({ success: false, error: 'Bag Lift entry not found' });
            }

            res.json({ success: true, data: record });
        } catch (error) {
            console.error(`Get Bag Lift by ID error:`, error);
            res.status(500).json({
                success: false,
                error: `Failed to fetch bag lift entry`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 3. GET BY MASON ID
    app.get('/api/bag-lifts/mason/:masonId', (req, res) => {
        const { masonId } = req.params;
        if (!masonId) {
            return res.status(400).json({ success: false, error: 'Mason ID is required.' });
        }
        const base = eq(bagLifts.masonId, masonId);
        return listHandler(req, res, base);
    });

    // 4. GET BY DEALER ID
    app.get('/api/bag-lifts/dealer/:dealerId', (req, res) => {
        const { dealerId } = req.params;
        if (!dealerId) {
            return res.status(400).json({ success: false, error: 'Dealer ID is required.' });
        }
        const base = eq(bagLifts.dealerId, dealerId);
        return listHandler(req, res, base);
    });


    console.log('✅ Bag Lifts GET endpoints setup complete');
}