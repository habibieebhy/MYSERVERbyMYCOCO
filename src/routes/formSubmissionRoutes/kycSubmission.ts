// server/src/routes/formSubmissionRoutes/kycSubmissions.ts
// KYC Submissions POST endpoint for masons to submit KYC details

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { kycSubmissions, masonPcSide } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm'; // Import necessary type

// Define the type of the inserted row for strong typing
type KycSubmission = InferSelectModel<typeof kycSubmissions>;

// Zod schema for KYC submission
const kycSubmissionSchema = z.object({
  masonId: z.string().uuid({ message: 'A valid Mason ID (UUID) is required.' }),
  aadhaarNumber: z.string().max(20).optional().nullable(),
  panNumber: z.string().max(20).optional().nullable(),
  voterIdNumber: z.string().max(20).optional().nullable(),
  // Documents should be a JSON object of URLs/metadata
  documents: z.object({
    aadhaarFrontUrl: z.string().url().optional(),
    aadhaarBackUrl: z.string().url().optional(),
    panUrl: z.string().url().optional(),
    voterUrl: z.string().url().optional(),
  }).optional().nullable(),
  remark: z.string().max(500).optional().nullable(),
}).strict();


export default function setupKycSubmissionsPostRoute(app: Express) {
  
  app.post('/api/kyc-submissions', async (req: Request, res: Response) => {
    const tableName = 'KYC Submission';
    try {
      // 1. Validate input
      const input = kycSubmissionSchema.parse(req.body);
      
      const { masonId, documents, ...rest } = input;
      
      // 2. Check if Mason exists
      const [mason] = await db.select({ id: masonPcSide.id }).from(masonPcSide).where(eq(masonPcSide.id, masonId)).limit(1);
      if (!mason) {
        return res.status(404).json({ success: false, error: 'Mason not found.' });
      }

      // 3. Insert KYC Submission record
      const [newRecord]: [KycSubmission] = await db.transaction(async (tx) => {
        
        // A. Insert submission
        // Destructuring the result ensures 'submission' is the single object
        const [submission] = await tx.insert(kycSubmissions)
          .values({
            id: randomUUID(),
            masonId,
            ...rest,
            // Convert JS object to JSON string for Postgres
            documents: documents ? JSON.stringify(documents) : null,
            status: 'pending', // Default status on submission
          })
          .returning();
          
        // B. Update Mason's primary kycStatus to 'pending'
        await tx.update(masonPcSide)
          .set({ kycStatus: 'pending' })
          .where(eq(masonPcSide.id, masonId));
          
        // FIX: Return the single row object wrapped in an array to satisfy outer destructuring.
        return [submission];
      });

      // 4. Send success response
      // FIX: 'newRecord' is the single row object. Access it directly.
      return res.status(201).json({
        success: true,
        message: `${tableName} submitted successfully and awaiting TSO approval.`,
        data: newRecord,
      });

    } catch (err: any) {
      console.error(`Create ${tableName} error:`, err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
      }
      return res.status(500).json({ 
        success: false, 
        error: `Failed to create ${tableName}`, 
        details: err?.message ?? 'Unknown error' 
      });
    }
  });

  console.log('✅ KYC Submissions POST endpoint setup complete');
}