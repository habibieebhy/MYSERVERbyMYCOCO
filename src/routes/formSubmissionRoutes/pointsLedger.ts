// src/routes/formSubmissionRoutes/pointsLedger.ts
// Endpoints for manual TSO adjustments (POST) and viewing the ledger (GET)

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { pointsLedger, masonPcSide } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// --- TSO AUTH IMPORT ---
import { tsoAuth } from '../../middleware/tsoAuth';
// ---

// --- Define CustomRequest to access req.auth ---
interface CustomRequest extends Request {
    auth?: {
        sub: string; // User ID from 'users' table (TSO)
        role: string;
        phone: string;
        kyc: string;
    };
}
// ---

// Zod schema for manual TSO adjustment
const manualAdjustmentSchema = z.object({
  masonId: z.string().uuid("Invalid Mason ID format. Expected UUID."),
  points: z.number().int("Points must be an integer.").safe("Points value is too large.").refine(
    (val) => val !== 0,
    { message: "Points must be a non-zero value (positive for credit, negative for debit)." }
  ),
  memo: z.string().min(5, "Memo must be at least 5 characters long.").max(500).optional(),
}).strict();

// Zod schema for query parameters (GET)
const ledgerQuerySchema = z.object({
  masonId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});


export default function setupPointsLedgerRoutes(app: Express) {
  
  // --- POST /api/points-ledger ---
  // Manually add a credit/debit adjustment. (TSO Auth Required)
  // --- TSO AUTH ADDED TO THE ROUTE ---
  app.post('/api/points-ledger', tsoAuth, async (req: CustomRequest, res: Response) => {
    const tableName = 'Points Ledger Adjustment';
    try {
      // 1. Get Authenticated TSO User ID
      // --- REDUNDANT CHECK REMOVED ---
      // tsoAuth middleware guarantees req.auth.sub exists
      const tsoUserId = parseInt(req.auth!.sub, 10);
      
      // 2. Validate input
      const input = manualAdjustmentSchema.parse(req.body);
      const { masonId, points, memo } = input;

      // 3. Verify Mason exists
      const [mason] = await db.select({ id: masonPcSide.id })
        .from(masonPcSide)
        .where(eq(masonPcSide.id, masonId))
        .limit(1);

      if (!mason) {
        return res.status(404).json({ success: false, error: `Mason with ID '${masonId}' not found.` });
      }

      // 4. Perform Transaction
      const [newLedgerEntry] = await db.transaction(async (tx) => {
        // A. Create the ledger entry
        const [ledgerEntry] = await tx.insert(pointsLedger)
          .values({
              masonId: masonId,
              sourceType: 'adjustment', 
              sourceId: randomUUID(), // New UUID for this manual adjustment
              points: points,
              memo: memo || `Manual adjustment by TSO ${tsoUserId}.`,
          })
          .returning();
          
        // B. Atomically update the mason's points balance
        await tx.update(masonPcSide)
          .set({
              pointsBalance: sql`${masonPcSide.pointsBalance} + ${points}`,
          })
          .where(eq(masonPcSide.id, masonId));

        return [ledgerEntry]; // Return the new ledger entry
      });

      // 5. Return success
      res.status(201).json({
        success: true,
        message: `Manual adjustment of ${points} points for Mason ${masonId} processed successfully.`,
        data: newLedgerEntry,
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error(`POST ${tableName} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}.`,
      });
    }
  });

  // --- GET /api/points-ledger ---
  // View the full points ledger. (TSO Auth Required)
  // Can be filtered by ?masonId=...
  // --- TSO AUTH ADDED TO THE ROUTE ---
  app.get('/api/points-ledger', tsoAuth, async (req: CustomRequest, res: Response) => {
    try {
      // 1. Authenticate (tsoAuth middleware has already run)
       // --- REDUNDANT CHECK REMOVED ---
       // if (!req.auth || !req.auth.sub) { ... }

      // 2. Validate query parameters
      const queryParams = ledgerQuerySchema.parse(req.query);
      const { masonId, page, limit } = queryParams;
      const offset = (page - 1) * limit;

      // 3. Build query
      let query = db.select()
        .from(pointsLedger)
        .orderBy(desc(pointsLedger.createdAt))
        .limit(limit)
        .offset(offset);

      // Apply filter if masonId is provided
      if (masonId) {
        query.where(eq(pointsLedger.masonId, masonId));
      }

      // 4. Execute query
      const ledgerEntries = await query;

      // 5. Return results
      res.json({
        success: true,
        message: "Ledger entries retrieved successfully.",
        data: ledgerEntries,
        meta: {
          page,
          limit,
          filter: masonId ? { masonId } : "all"
        }
      });

    } catch (error: any) {
       if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: error.issues });
      }
      console.error(`GET Points Ledger error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to retrieve points ledger.`,
      });
    }
  });


  console.log('✅ Points Ledger (GET/POST) endpoints setup complete (Now protected by tsoAuth middleware)');
}