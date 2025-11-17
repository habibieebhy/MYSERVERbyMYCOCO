// server/src/routes/dataFetchingRoutes/pointsLedger.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { pointsLedger, masonPcSide } from '../../db/schema'; // 🟢 NEW: Import masonPcSide
import { eq, and, desc, asc, SQL, gte, lte, getTableColumns } from 'drizzle-orm';

// --- TSO AUTH IMPORT ---
import { tsoAuth } from '../../middleware/tsoAuth';
// ---

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

        // Filter by sourceId (UUID reference to BagLift or Redemption)
        if (q.sourceId) {
            conds.push(eq(pointsLedger.sourceId, String(q.sourceId)));
        }

        // Filter by siteId (Assuming it's a field on pointsLedger for advanced systems)
        if (q.siteId) {
             // NOTE: If you add siteId to pointsLedger, this logic will need: conds.push(eq(pointsLedger.siteId, String(q.siteId)));
             console.warn("Filtering by siteId requires the siteId column to be added to the pointsLedger schema.");
        }


        // Date range filtering on createdAt
        const startDate = q.startDate as string | undefined;
        const endDate = q.endDate as string | undefined;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate); 

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                conds.push(gte(pointsLedger.createdAt, start));
                conds.push(lte(pointsLedger.createdAt, end));
            } else {
                 console.warn('Invalid startDate or endDate provided for pointsLedger filter.');
            }
        }

        if (conds.length === 0) return undefined;
        
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
            
            const conds: SQL[] = [];
            if (baseWhere) conds.push(baseWhere);
            if (extra) conds.push(extra);
            
            const whereCondition: SQL | undefined = conds.length > 0 ? and(...conds) : undefined;
            const orderExpr = buildSort(String(sortBy), String(sortDir));

            //Query with join to get mason name
            let query = db.select({
                // Select all columns from pointsLedger
                ...getTableColumns(pointsLedger),
                // Add denormalized mason name
                masonName: masonPcSide.name,
                // Add mason phone number (useful for verification)
                masonPhone: masonPcSide.phoneNumber, 
            })
            .from(pointsLedger)
            .leftJoin(masonPcSide, eq(pointsLedger.masonId, masonPcSide.id))
            .$dynamic();

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
    app.get('/api/points-ledger', tsoAuth, (req, res) => listHandler(req, res));

    // 2. GET BY ID
    app.get('/api/points-ledger/:id', tsoAuth, async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Query with join for single record lookup
            const [record] = await db.select({
                ...getTableColumns(pointsLedger),
                masonName: masonPcSide.name,
                masonPhone: masonPcSide.phoneNumber,
            })
            .from(pointsLedger)
            .leftJoin(masonPcSide, eq(pointsLedger.masonId, masonPcSide.id))
            .where(eq(pointsLedger.id, id))
            .limit(1);

            if (!record) {
                // Status 404 is correct, status 44 is not a standard HTTP code
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
    app.get('/api/points-ledger/mason/:masonId', tsoAuth, (req, res) => {
        const { masonId } = req.params;
        if (!masonId) {
            return res.status(400).json({ success: false, error: 'Mason ID is required.' });
        }
        const base = eq(pointsLedger.masonId, masonId);
        return listHandler(req, res, base);
    });

    // 4. GET BY SOURCE ID
    app.get('/api/points-ledger/source/:sourceId', tsoAuth, (req, res) => {
        const { sourceId } = req.params;
        if (!sourceId) {
            return res.status(400).json({ success: false, error: 'Source ID is required.' });
        }
        const base = eq(pointsLedger.sourceId, sourceId);
        return listHandler(req, res, base);
    });


    console.log('✅ Points Ledger GET endpoints setup complete (All routes protected by tsoAuth and now include Mason details)');
}