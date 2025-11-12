// server/src/routes/updateRoutes/bagsLift.ts
// Bags Lift PATCH endpoint for TSO approval and points update

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { bagLifts, pointsLedger, masonPcSide } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Zod schema for TSO approval/rejection fields.
const bagLiftApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  // In a real app, this should come from req.user.id (auth middleware)
  approvedBy: z.coerce.number().int().positive().optional(), 
  memo: z.string().max(500).optional(),
}).strict();

export default function setupBagLiftsPatchRoute(app: Express) {
  
  app.patch('/api/bag-lifts/:id', async (req: Request, res: Response) => {
    const tableName = 'Bag Lift';
    try {
      const { id } = req.params;
      
      // 1. Validate incoming data
      const input = bagLiftApprovalSchema.parse(req.body);

      // 2. Find existing record
      const [existingRecord] = await db.select().from(bagLifts).where(eq(bagLifts.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }
      
      const { status, approvedBy, memo } = input;
      const currentStatus = existingRecord.status;
      const masonId = existingRecord.masonId;
      const points = existingRecord.pointsCredited;

      // 3. Logic check to prevent double points or approval of wrong status
      if (status === currentStatus) {
         return res.status(400).json({ success: false, error: `Status is already '${currentStatus}'.` });
      }
      if (status === 'approved' && currentStatus === 'rejected') {
         return res.status(400).json({ success: false, error: 'Cannot directly approve a previously rejected transaction.' });
      }

      // --- Transactional Update ---
      // Fix 1: The transaction returns an array of updated records, so we wrap the single record we get in an array.
      const [updatedBagLift] = await db.transaction(async (tx) => {
        
        // 3.1. Approving a Pending/New Lift (Credit Points)
        if (status === 'approved' && currentStatus === 'pending') {
            
            // A. Update Bag Lift Record
            const [updated] = await tx.update(bagLifts)
              .set({
                  status: 'approved',
                  approvedBy: approvedBy ?? null,
                  approvedAt: new Date(),
                  // FIX 3: Removed 'updatedAt' as it's not in the bagLifts schema
              })
              .where(eq(bagLifts.id, id))
              .returning();
              
            // B. Create Points Ledger Entry (Credit)
            await tx.insert(pointsLedger)
                .values({
                    masonId: masonId,
                    sourceType: 'bag_lift',
                    sourceId: updated.id, // 'updated' is the single object due to inner destructuring
                    points: points, 
                    memo: memo || `Credit for ${updated.bagCount} bags (approved by TSO)`,
                })
                .returning();
            
            // C. Update Mason's Balance
            await tx.update(masonPcSide)
              .set({
                  pointsBalance: sql`${masonPcSide.pointsBalance} + ${points}`
              })
              .where(eq(masonPcSide.id, masonId));

            return [updated]; // Fix 1: Wrap single object in array
        } 
        
        // 3.2. Rejecting an Approved Lift (Unwind/Debit Points)
        else if (status === 'rejected' && currentStatus === 'approved') {
            
            // A. Update Bag Lift Record
            const [updated] = await tx.update(bagLifts)
                .set({
                    status: 'rejected',
                    // FIX 3: Removed 'updatedAt' as it's not in the bagLifts schema
                })
                .where(eq(bagLifts.id, id))
                .returning();
                
            // B. Create Points Ledger Entry (Debit to reverse)
            await tx.insert(pointsLedger)
                .values({
                    masonId: masonId,
                    sourceType: 'adjustment', 
                    sourceId: randomUUID(), // New UUID for the adjustment record
                    points: -points, // Negative points for debit
                    memo: memo || `Debit adjustment: Bag Lift ${id} rejected.`,
                })
                .returning();
                
            // C. Update Mason's Balance (Deduct points)
            await tx.update(masonPcSide)
                .set({
                    pointsBalance: sql`${masonPcSide.pointsBalance} - ${points}`
                })
                .where(eq(masonPcSide.id, masonId));

            return [updated]; // Fix 1: Wrap single object in array
        }

        // 3.3. Simple Status Update (e.g., pending -> rejected, no points change)
        else {
            const [updated] = await tx.update(bagLifts)
                .set({ status: status }) // FIX 3: Removed 'updatedAt'
                .where(eq(bagLifts.id, id))
                .returning();
            return [updated]; // Fix 1: Wrap single object in array
        }
      });


      // 4. Return success
      res.json({
        success: true,
        // FIX 2: updatedBagLift is the single object, remove the [0] index.
        message: `Bag Lift status updated to '${updatedBagLift.status}' successfully.`,
        data: updatedBagLift, // FIX 2: updatedBagLift is the single object.
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error(`PATCH Bag Lift error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to update Bag Lift status.`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Bag Lifts PATCH (Approval) endpoint setup complete');
}