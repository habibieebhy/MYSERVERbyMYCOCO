// server/src/routes/deleteRoutes/dealers.ts
// Dealers DELETE endpoints + Radar geofence cleanup

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers } from '../../db/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';

// ---------- Radar helpers ----------
const RADAR_TAG = 'dealer';

async function deleteRadarGeofence(externalId: string) {
  if (!process.env.RADAR_SECRET_KEY) {
    throw new Error('RADAR_SECRET_KEY is not configured');
  }
  const url = `https://api.radar.io/v1/geofences/${encodeURIComponent(RADAR_TAG)}/${encodeURIComponent(externalId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: process.env.RADAR_SECRET_KEY as string,
    },
  });

  // Radar returns 200 on success, 404 if already gone
  if (res.status === 404) return { ok: true, code: 404 as const };
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.meta?.message || body?.message || `Radar DELETE failed (${res.status})`;
    return { ok: false, code: res.status as number, message: msg };
  }
  return { ok: true, code: 200 as const };
}

// ---------- Route factory ----------
function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof dealers,
  tableName: string,
  dateField?: 'createdAt' | 'updatedAt'
}) {
  const { endpoint, table, tableName, dateField } = config;

  // DELETE BY ID (geofence first, then DB)
  app.delete(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }

      const radar = await deleteRadarGeofence(`dealer:${id}`);
      if (!radar.ok) {
        return res.status(502).json({
          success: false,
          error: `Failed to delete Radar geofence`,
          details: radar.message,
        });
      }

      await db.delete(table).where(eq(table.id, id));

      return res.json({
        success: true,
        message: `${tableName} deleted`,
        deletedId: id,
        radar: { status: radar.code }, // 200 or 404
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

  // DELETE BY USER (bulk)
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'Add ?confirm=true to proceed.' });
      }

      const rows = await db.select().from(table).where(eq(table.userId, Number(userId)));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found for user ${userId}` });
      }

      let radarDeleted = 0;
      const deletableIds: string[] = [];
      const radarErrors: Array<{ id: string; message: string }> = [];

      for (const r of rows) {
        const externalId = `dealer:${r.id}`;
        const result = await deleteRadarGeofence(externalId);
        if (result.ok) {
          radarDeleted++;
          deletableIds.push(r.id);
        } else {
          radarErrors.push({ id: r.id, message: result.message ?? 'Radar delete failed' });
        }
      }

      if (deletableIds.length) {
        await db.delete(table).where(inArray(table.id, deletableIds));
      }

      return res.json({
        success: true,
        message: `${deletableIds.length}/${rows.length} ${tableName}(s) deleted for user ${userId}`,
        deletedCount: deletableIds.length,
        radarDeleted,
        radarErrors,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // DELETE BY PARENT DEALER (bulk)
  app.delete(`/api/${endpoint}/parent/:parentDealerId`, async (req: Request, res: Response) => {
    try {
      const { parentDealerId } = req.params;
      if (req.query.confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'Add ?confirm=true to proceed.' });
      }

      const rows = await db.select().from(table).where(eq(table.parentDealerId, parentDealerId));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName}s found for parent ${parentDealerId}` });
      }

      let radarDeleted = 0;
      const deletableIds: string[] = [];
      const radarErrors: Array<{ id: string; message: string }> = [];

      for (const r of rows) {
        const externalId = `dealer:${r.id}`;
        const result = await deleteRadarGeofence(externalId);
        if (result.ok) {
          radarDeleted++;
          deletableIds.push(r.id);
        } else {
          radarErrors.push({ id: r.id, message: result.message ?? 'Radar delete failed' });
        }
      }

      if (deletableIds.length) {
        await db.delete(table).where(inArray(table.id, deletableIds));
      }

      return res.json({
        success: true,
        message: `${deletableIds.length}/${rows.length} ${tableName}(s) deleted for parent ${parentDealerId}`,
        deletedCount: deletableIds.length,
        radarDeleted,
        radarErrors,
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Parent error:`, error);
      // --- ✅ TS FIX: Changed 5Z00 to 500 ---
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  // BULK DELETE BY DATE RANGE (uses dateField)
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, confirm } = req.query as Record<string, string>;
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, error: 'startDate and endDate are required (YYYY-MM-DD)' });
      }
      if (confirm !== 'true') {
        return res.status(400).json({ success: false, error: 'Add ?confirm=true to proceed.' });
      }
      if (!dateField) {
        return res.status(400).json({ success: false, error: `Date field not available for ${tableName}` });
      }

      const whereCondition = and(
        gte(table[dateField], new Date(startDate)),
        lte(table[dateField], new Date(endDate))
      );

      const rows = await db.select().from(table).where(whereCondition);
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName}s in specified date range` });
      }

      let radarDeleted = 0;
      const deletableIds: string[] = [];
      const radarErrors: Array<{ id: string; message: string }> = [];

      for (const r of rows) {
        const externalId = `dealer:${r.id}`;
        const result = await deleteRadarGeofence(externalId);
        if (result.ok) {
          radarDeleted++;
          deletableIds.push(r.id);
        } else {
          radarErrors.push({ id: r.id, message: result.message ?? 'Radar delete failed' });
        }
      }

      if (deletableIds.length) {
        await db.delete(table).where(inArray(table.id, deletableIds));
      }

      return res.json({
        success: true,
        message: `${deletableIds.length}/${rows.length} ${tableName}(s) deleted in range ${startDate}..${endDate}`,
        deletedCount: deletableIds.length,
        radarDeleted,
        radarErrors,
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

// ---- Wire-up ----
export default function setupDealersDeleteRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealers',
    table: dealers,
    tableName: 'Dealer',
    dateField: 'createdAt',
  });
  console.log('✅ Dealers DELETE endpoints + Radar cleanup ready');
}