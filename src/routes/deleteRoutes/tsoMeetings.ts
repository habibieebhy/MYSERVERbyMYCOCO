// server/src/routes/deleteRoutes/tsoMeetings.ts
// TSO Meetings DELETE endpoints

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { tsoMeetings } from '../../db/schema';
import { eq } from 'drizzle-orm';

const table = tsoMeetings;
const tableName = 'TSO Meeting';

export default function setupTsoMeetingsDeleteRoutes(app: Express) {
  const endpoint = 'tso-meetings';

  // DELETE BY ID
  app.delete(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }

      await db.delete(table).where(eq(table.id, id));

      res.json({ success: true, message: `${tableName} deleted`, deletedId: id });
    } catch (error: any) {
      // --- IMPORTANT: Handle Foreign Key Violation ---
      // This happens if a TechnicalVisitReport references this meeting
      if (error.code === '23503') { // 23503 = foreign_key_violation
         return res.status(409).json({
          success: false,
          error: 'Cannot delete meeting: It is still referenced by one or more Technical Visit Reports.',
          code: error.code,
        });
      }
      // --- End Handle ---

      console.error(`Delete ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}` });
    }
  });

  // DELETE BY User ID (created_by_user_id)
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'Confirmation required. Add ?confirm=true' });
      }
      
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
         return res.status(400).json({ success: false, error: 'Invalid User ID' });
      }

      const rows = await db.select({ id: table.id }).from(table).where(eq(table.createdByUserId, userId));
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found for user ${userId}` });
      }
      
      const ids = rows.map(r => r.id);
      await db.delete(table).where(eq(table.createdByUserId, userId));

      res.json({
        success: true,
        message: `${rows.length} ${tableName}(s) deleted for user ${userId}`,
        deletedCount: rows.length,
        deletedIds: ids,
      });
    } catch (error: any) {
       if (error.code === '23503') {
         return res.status(409).json({
          success: false,
          error: 'Cannot delete meetings: One or more are still referenced by Technical Visit Reports.',
          code: error.code,
        });
      }
      console.error(`Delete ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName}s` });
    }
  });

  console.log('✅ TSO Meetings DELETE endpoints setup complete');
}