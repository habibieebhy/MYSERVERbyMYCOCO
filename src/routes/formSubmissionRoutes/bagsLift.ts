// src/routes/formSubmissionRoutes/bagsLift.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { bagLifts, pointsLedger, insertBagLiftSchema } from '../../db/schema';
import { z } from 'zod';
// Import randomUUID for manual ID generation, following the sample routes pattern
import { randomUUID } from 'crypto'; 

/**
 * Zod schema for the Bag Lift data submission.
 * We extend the Drizzle insert schema to enforce specific types and remove auto-generated fields 
 * like `id`, `createdAt`, `approvedAt`, which will be handled manually or by defaults.
 */
const bagLiftSubmissionSchema = insertBagLiftSchema.omit({
    id: true,
    // Status, approvedBy/At will be set during insertion based on approval logic
    status: true,
    approvedBy: true, 
    approvedAt: true,
    createdAt: true, // Handled by DB default or manually
}).extend({
    // Explicitly define required fields and transformations
    masonId: z.string().uuid({ message: 'A valid Mason ID (UUID) is required.' }),
    dealerId: z.string().min(1, 'Dealer ID is required.'),
    // Allow date string and transform it to a Date object for DB insertion
    purchaseDate: z.string().transform(str => new Date(str)), 
    bagCount: z.number().int().positive('Bag count must be a positive integer.'),
    pointsCredited: z.number().int().nonnegative('Points credited must be a non-negative integer.'),
    // Optional memo for the points ledger entry (not part of bagLifts table, but used for ledger)
    memo: z.string().max(500).optional(), 
});

/**
 * Sets up the POST route for the bag_lifts table.
 *
 * POST /api/bag-lifts
 * - Handles the creation of a new bag_lift record.
 * - Manages the transactional creation of a corresponding points_ledger entry.
 * - Status is set to 'approved' immediately (this logic may need adjustment in a real app).
 */
export default function setupBagLiftsPostRoute(app: Express) {

    app.post('/api/bag-lifts', async (req: Request, res: Response) => {
        try {
            // 1. Validate incoming data
            const validationResult = bagLiftSubmissionSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Validation failed for Bag Lift submission.', 
                    details: validationResult.error.errors 
                });
            }

            const validatedData = validationResult.data;
            // Destructure the parts intended for bagLifts vs. pointsLedger
            const { masonId, pointsCredited, memo, ...bagLiftBody } = validatedData;
            
            // Generate ID manually, matching the pattern in the sample files
            const generatedBagLiftId = randomUUID();

            // Start a Drizzle transaction to ensure both writes succeed or fail together (atomicity)
            const result = await db.transaction(async (tx) => {
                
                // 2. Insert the Bag Lift record
                const [newBagLift] = await tx.insert(bagLifts)
                    .values({
                        ...bagLiftBody,
                        id: generatedBagLiftId, // Use the manually generated ID
                        masonId: masonId, 
                        pointsCredited: pointsCredited,
                        status: 'approved', 
                        // approvedBy: req.user.id, // Requires user auth to be implemented
                        approvedAt: new Date(), 
                    })
                    .returning();

                if (!newBagLift) {
                    tx.rollback();
                    throw new Error('Failed to insert new bag lift record.');
                }
                
                // 3. Insert the corresponding Points Ledger credit entry
                const [newLedgerEntry] = await tx.insert(pointsLedger)
                    .values({
                        masonId: newBagLift.masonId,
                        sourceType: 'bag_lift',
                        sourceId: newBagLift.id, // Link to the newly created bag lift ID
                        points: newBagLift.pointsCredited, // Points are positive (credit)
                        memo: memo || `Credit for ${newBagLift.bagCount} bags purchased on ${newBagLift.purchaseDate.toDateString()}`,
                    })
                    .returning();

                if (!newLedgerEntry) {
                    tx.rollback();
                    throw new Error('Failed to insert corresponding points ledger entry.');
                }
                
                return { bagLift: newBagLift, ledger: newLedgerEntry };
            });

            // If the transaction completed successfully
            res.status(201).json({ 
                success: true, 
                message: 'Bag Lift successfully recorded and points credited.', 
                data: result.bagLift,
                ledgerEntry: result.ledger
            });

        } catch (error: any) {
            console.error(`POST Bag Lift error:`, error);
            
            // Handle Zod validation error specifically (matches sample files)
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code
                    }))
                });
            }

            // General server error
            res.status(500).json({
                success: false,
                error: `Failed to create bag lift entry and credit points.`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    console.log('✅ Bag Lifts POST endpoint setup complete');
}