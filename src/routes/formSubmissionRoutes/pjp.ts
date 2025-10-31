// server/src/routes/postRoutes/permanentJourneyPlans.ts
// --- UPDATED to use dealerId ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { permanentJourneyPlans } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// --- helpers ---
const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
const strOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  return String(val).trim();
}, z.string().nullable().optional());


// --- input schema UPDATED ---
const pjpInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  createdById: z.coerce.number().int().positive(),
  
  // --- ✅ FIX ---
  dealerId: strOrNull, // Replaced visitDealerName
  // --- END FIX ---
  
  planDate: z.coerce.date(),
  areaToBeVisited: z.string().max(500).min(1),
  description: strOrNull,
  status: z.string().max(50).min(1).default('PENDING'),
  verificationStatus: strOrNull,
  additionalVisitRemarks: strOrNull,
}).strict();


export default function setupPermanentJourneyPlansPostRoutes(app: Express) {
  app.post('/api/pjp', async (req: Request, res: Response) => {
    try {
      // 1) validate
      const input = pjpInputSchema.parse(req.body);

      // 2) map to insert
      const insertData = {
        id: randomUUID(),
        userId: input.userId,
        createdById: input.createdById,
        
        // --- ✅ FIX ---
        dealerId: input.dealerId ?? null, // Use the new dealerId
        // --- END FIX ---

        planDate: toDateOnly(input.planDate),
        areaToBeVisited: input.areaToBeVisited,
        description: input.description ?? null,
        status: input.status,
        verificationStatus: input.verificationStatus ?? null,
        additionalVisitRemarks: input.additionalVisitRemarks ?? null,
      };

      // 3) insert
      const [record] = await db.insert(permanentJourneyPlans).values(insertData).returning();
      
      return res.status(201).json({
        success: true,
        message: 'Permanent Journey Plan created successfully',
        data: record,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      console.error('Create PJP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create PJP',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ PJP POST endpoints (using dealerId) setup complete');
}