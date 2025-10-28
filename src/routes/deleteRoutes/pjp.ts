// server/src/routes/deleteRoutes/pjp.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans, insertPermanentJourneyPlanSchema, masterConnectedTable } from '../../db/schema';
import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

// ---- FIXED: Neon-safe check for master_connected_table ----
async function mctExists(tx: any) {
  const result = await tx.execute(sql`
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'master_connected_table'
  `);

  const rows = Array.isArray(result) ? result : result?.rows || [];
  return rows.length > 0;
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof permanentJourneyPlans,
  schema: z.ZodSchema,
  tableName: string,
  dateField?: 'planDate'
}) {
  const { endpoint, table, tableName, dateField } = config;

  const deleteByIds = async (ids: string[]) => {
    if (ids.length === 0) return { deleted: 0, mctDeleted: 0, mctSkipped: false };

    return await db.transaction(async (tx) => {
      let mctDeleted = 0;
      let mctSkipped = false;

      // ✅ Clean MCT only if exists
      if (await mctExists(tx)) {
        const mctRes = await tx
          .delete(masterConnectedTable)
          .where(inArray(masterConnectedTable.permanentJourneyPlanId, ids))
          .returning({ id: masterConnectedTable.id });

        mctDeleted = mctRes.length;
      } else {
        mctSkipped = true;
      }

      const pjpRes = await tx
        .delete(permanentJourneyPlans)
        .where(inArray(permanentJourneyPlans.id, ids))
        .returning({ id: permanentJourneyPlans.id });

      return { deleted: pjpRes.length, mctDeleted, mctSkipped };
    });
  };

  // DELETE /api/pjp/:id?confirm=true
  app.delete(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }

      const { id } = req.params;

      const [exists] = await db
        .select({ id: table.id })
        .from(table)
        .where(eq(table.id, id))
        .limit(1);

      if (!exists) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }

      const { deleted, mctDeleted, mctSkipped } = await deleteByIds([id]);

      return res.json({
        success: true,
        message: `${tableName} deleted`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: [id],
      });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE /api/pjp/user/:userId?confirm=true
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'This action requires confirmation. Add ?confirm=true' });
      }

      const userId = Number(req.params.userId);
      const rows = await db.select({ id: table.id }).from(table).where(eq(table.userId, userId));

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found for user ${userId}` });
      }

      const ids = rows.map(r => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);

      return res.json({
        success: true,
        message: `${deleted} ${tableName}(s) deleted for user ${userId}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  });

  // DELETE /api/pjp/created-by/:createdById?confirm=true
  app.delete(`/api/${endpoint}/created-by/:createdById`, async (req: Request, res: Response) => {
    try {
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'This action requires confirmation. Add ?confirm=true' });
      }

      const createdById = Number(req.params.createdById);
      const rows = await db.select({ id: table.id }).from(table).where(eq(table.createdById, createdById));

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found created by user ${createdById}` });
      }

      const ids = rows.map(r => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);

      return res.json({
        success: true,
        message: `${deleted} ${tableName}(s) deleted created by user ${createdById}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Created By error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  });

  // DELETE /api/pjp/status/:status?confirm=true
  app.delete(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    try {
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'This action requires confirmation. Add ?confirm=true' });
      }

      const { status } = req.params;
      const rows = await db.select({ id: table.id }).from(table).where(eq(table.status, status));

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found with status ${status}` });
      }

      const ids = rows.map(r => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);

      return res.json({
        success: true,
        message: `${deleted} ${tableName}(s) deleted with status ${status}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Status error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE /api/pjp/bulk/date-range
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate)
        return res.status(400).json({ success: false, error: 'startDate and endDate parameters are required' });
      if (confirm !== 'true')
        return res.status(400).json({ success: false, error: 'This action requires confirmation. Add ?confirm=true' });
      if (!dateField)
        return res.status(400).json({ success: false, error: `Date field not available for ${tableName}` });

      const rows = await db
        .select({ id: table.id })
        .from(table)
        .where(and(
          gte(table[dateField], String(startDate)),
          lte(table[dateField], String(endDate))
        ));

      if (rows.length === 0)
        return res.status(404).json({ success: false, error: `No ${tableName}s found in date range` });

      const ids = rows.map(r => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);

      return res.json({
        success: true,
        message: `${deleted} ${tableName}(s) deleted from ${startDate} to ${endDate}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids,
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });
}

export default function setupPermanentJourneyPlansDeleteRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'pjp',
    table: permanentJourneyPlans,
    schema: insertPermanentJourneyPlanSchema,
    tableName: 'Permanent Journey Plan',
    dateField: 'planDate',
  });
  console.log('✅ Permanent Journey Plans DELETE endpoints setup complete');
}
