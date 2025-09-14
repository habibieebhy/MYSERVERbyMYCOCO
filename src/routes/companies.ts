// server/src/routes/companies.ts

import { Request, Response, Express } from 'express';
import { db } from '../db/db';
import { companies } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Helper function to safely convert BigInt to JSON (same approach used in users.ts)
function toJsonSafe(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
}

export default function setupCompaniesRoutes(app: Express) {
    // GET ALL companies (with optional region/area filters)
    app.get('/api/companies', async (req: Request, res: Response) => {
        try {
            const { limit = '50', region, area } = req.query;

            let whereCondition: any;

            if (region) {
                whereCondition = eq(companies.region, region as string);
            }
            if (area) {
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

    // GET company by ID
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

    // Optional: GET companies by region (explicit route)
    app.get('/api/companies/region/:region', async (req: Request, res: Response) => {
        try {
            const { region } = req.params;
            const { limit = '50', area } = req.query;

            let whereCondition: any = eq(companies.region, region);

            if (area) {
                whereCondition = and(whereCondition, eq(companies.area, area as string));
            }

            const records = await db.select({
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
            }).from(companies)
                .where(whereCondition)
                .orderBy(desc(companies.createdAt))
                .limit(parseInt(limit as string));

            res.json({ success: true, data: toJsonSafe(records) });
        } catch (error) {
            console.error('Get Companies by Region error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch companies by region',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Optional: GET companies by area (explicit route)
    app.get('/api/companies/area/:area', async (req: Request, res: Response) => {
        try {
            const { area } = req.params;
            const { limit = '50', region } = req.query;

            let whereCondition: any = eq(companies.area, area);

            if (region) {
                whereCondition = and(whereCondition, eq(companies.region, region as string));
            }

            const records = await db.select({
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
            }).from(companies)
                .where(whereCondition)
                .orderBy(desc(companies.createdAt))
                .limit(parseInt(limit as string));

            res.json({ success: true, data: toJsonSafe(records) });
        } catch (error) {
            console.error('Get Companies by Area error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch companies by area',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    console.log('✅ Companies GET endpoints setup complete');
}
