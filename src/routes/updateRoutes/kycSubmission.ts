// server/src/routes/updateRoutes/kycSubmissions.ts
// KYC Submissions PATCH endpoint for TSO to approve/reject

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { kycSubmissions, masonPcSide } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for TSO approval/rejection fields.
const kycApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  remark: z.string().max(500).optional().nullable(),
}).strict();


export default function setupKycSubmissionsPatchRoute(app: Express) {
  
  app.patch('/api/kyc-submissions/:id', async (req: Request, res: Response) => {
    const tableName = 'KYC Submission';
    try {
      const { id } = req.params;
      if (!z.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: 'Invalid Submission ID format. Expected UUID.' });
      }
      
      // 1. Validate incoming data
      const input = kycApprovalSchema.parse(req.body);

      // 2. Find existing record
      const [existingRecord] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName} with ID '${id}' not found.` });
      }
      
      const { status, remark } = input;
      const masonId = existingRecord.masonId;

      // 3. Transactional Update
      const [updatedSubmission] = await db.transaction(async (tx) => {
        
        // A. Update KYC Submission Record
        const [submission] = await tx.update(kycSubmissions)
          .set({
              status: status,
              remark: remark ?? null,
              updatedAt: new Date(),
          })
          .where(eq(kycSubmissions.id, id))
          .returning();
          
        // B. Update Mason's primary kycStatus based on approval status
        await tx.update(masonPcSide)
          .set({ kycStatus: status })
          .where(eq(masonPcSide.id, masonId));
          
        // FIX: 'submission' is the updated row object. Return it in an array.
        return [submission];
      });


      // 4. Send success response
      res.json({
        success: true,
        message: `KYC submission status updated to '${updatedSubmission.status}' and Mason's status updated.`,
        data: updatedSubmission,
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      console.error(`PATCH ${tableName} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName} status.`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ KYC Submissions PATCH (Approval) endpoint setup complete');
}