// server/src/routes/dataFetchingRoutes/schemeSlabs.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { schemeSlabs, schemesOffers, rewards } from '../../db/schema';
import { eq, and, desc, asc, SQL, getTableColumns } from 'drizzle-orm';

export default function setupSchemeSlabsGetRoutes(app: Express) {
  const endpoint = 'scheme-slabs';
  const tableName = 'Scheme Slab';

  // 1. GET BY SCHEME ID (The most important route)
  app.get(`/api/${endpoint}/scheme/:schemeId`, async (req: Request, res: Response) => {
    try {
      const { schemeId } = req.params;
      if (!schemeId) return res.status(400).json({ success: false, error: 'Scheme ID required' });

      // We usually want slabs ordered by difficulty (e.g., Bags 100 -> 200 -> 300)
      // So we order by minBagsBest ASC
      const records = await db.select({
          ...getTableColumns(schemeSlabs),
          rewardName: rewards.itemName, // Include the linked reward name if it exists
          rewardImage: rewards.meta,    // And image
        })
        .from(schemeSlabs)
        .leftJoin(rewards, eq(schemeSlabs.rewardId, rewards.id))
        .where(eq(schemeSlabs.schemeId, schemeId))
        .orderBy(asc(schemeSlabs.minBagsBest), asc(schemeSlabs.pointsEarned));

      res.json({ success: true, count: records.length, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Scheme ID error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // 2. GET ALL (Admin view)
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '100', schemeId } = req.query;
      
      let whereCondition: SQL | undefined;
      if (schemeId) {
        whereCondition = eq(schemeSlabs.schemeId, String(schemeId));
      }

      const records = await db.select({
          ...getTableColumns(schemeSlabs),
          schemeName: schemesOffers.name,
        })
        .from(schemeSlabs)
        .leftJoin(schemesOffers, eq(schemeSlabs.schemeId, schemesOffers.id))
        .where(whereCondition)
        .limit(parseInt(String(limit)));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });

  // 3. GET SINGLE ID
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(schemeSlabs).where(eq(schemeSlabs.id, id)).limit(1);
      
      if (!record) return res.status(404).json({ success: false, error: 'Slab not found' });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} by ID error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
    }
  });

  console.log(`✅ ${tableName} GET endpoints setup complete`);
}