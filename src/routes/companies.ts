import { Request, Response, Express } from 'express';
import { db } from '../db/db';
import { companies } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Helper function to safely convert BigInt to JSON (same approach used in users.ts)
// Note: 'serial' maps to 'number', not 'bigint'. This is likely for consistency with other tables.
function toJsonSafe(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
}

export default function setupCompaniesRoutes(app: Express) {
    /**
     * GET /api/companies
     * Fetches all companies with optional filtering by region and/or area.
     * Query Params:
     * - limit (number, default 50)
     * - region (string)
     * - area (string)
     */
    app.get('/api/companies', async (req: Request, res: Response) => {
        try {
            const { limit = '50', region, area } = req.query;

            let whereCondition: any;

            if (region) {
                // Initialize whereCondition if it's the first filter
                whereCondition = eq(companies.region, region as string);
            }
            if (area) {
                // Add to whereCondition, or initialize if it's the first filter
                whereCondition = whereCondition
                    ? and(whereCondition, eq(companies.area, area as string))
                    : eq(companies.area, area as string);
            }

            const baseSelect = db.select({
                id: companies.id,
                companyName: companies.companyName,
                officeAddress: companies.officeAddress,
                isHeadOffice: companies.isHeadOffice,
                phoneNumber: companies.phoneNumber,
                region: companies.region,
                area: companies.area,
                adminUserId: companies.adminUserId,
                createdAt: companies.createdAt,
                updatedAt: companies.updatedAt,
                workosOrganizationId: companies.workosOrganizationId,
            }).from(companies);

            // Apply the where condition if it exists
            const query = whereCondition ? baseSelect.where(whereCondition) : baseSelect;

            const records = await query
                .orderBy(desc(companies.createdAt))
                .limit(parseInt(limit as string));

            res.json({ success: true, data: toJsonSafe(records) });
        } catch (error) {
            console.error('Get Companies error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch companies',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    /**
     * GET /api/companies/:id
     * Fetches a single company by its primary key.
     */
    app.get('/api/companies/:id', async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid company id' });
            }

            const [record] = await db.select({
                id: companies.id,
                companyName: companies.companyName,
                officeAddress: companies.officeAddress,
                isHeadOffice: companies.isHeadOffice,
                phoneNumber: companies.phoneNumber,
                region: companies.region,
                area: companies.area,
                adminUserId: companies.adminUserId,
                createdAt: companies.createdAt,
                updatedAt: companies.updatedAt,
                workosOrganizationId: companies.workosOrganizationId,
            }).from(companies).where(eq(companies.id, id)).limit(1);

            if (!record) {
                return res.status(404).json({ success: false, error: 'Company not found' });
            }

            res.json({ success: true, data: toJsonSafe(record) });
        } catch (error) {
            console.error('Get Company by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch company',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Removed redundant /api/companies/region/:region and /api/companies/area/:area routes.
    // The main /api/companies endpoint handles this filtering.

    console.log('✅ Companies GET endpoints setup complete');
}
