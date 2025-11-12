// src/routes/formSubmissionRoutes/bagsLift.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { bagLifts, insertBagLiftSchema } from '../../db/schema'; // Removed pointsLedger and masonPcSide imports (no longer needed here)
import { z } from 'zod';
import { randomUUID } from 'crypto'; 
import { InferInsertModel } from 'drizzle-orm'; // Added InferInsertModel for better typing

// Define the core BagLift type for use in the insert, excluding the memo that's not in the table
type BagLiftInsert = InferInsertModel<typeof bagLifts>;

/**
 * Zod schema for the Bag Lift data submission.
 */
const bagLiftSubmissionSchema = insertBagLiftSchema.omit({
    id: true,
    status: true, // Handled manually to ensure 'pending'
    approvedBy: true, 
    approvedAt: true,
    createdAt: true, 
}).extend({
    masonId: z.string().uuid({ message: 'A valid Mason ID (UUID) is required.' }),
    dealerId: z.string().min(1, 'Dealer ID is required.'),
    purchaseDate: z.string().transform(str => new Date(str)), 
    bagCount: z.number().int().positive('Bag count must be a positive integer.'),
    pointsCredited: z.number().int().nonnegative('Points credited must be a non-negative integer.'),
    memo: z.string().max(500).optional(), // Note: Not inserted, but validated
});

/**
 * Sets up the POST route for the bag_lifts table.
 * * POST /api/bag-lifts
 * - Creates a new bag_lift record with status 'pending'.
 * - DOES NOT credit points. Points will be credited upon TSO approval via PATCH.
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
            const { masonId, pointsCredited, ...bagLiftBody } = validatedData;
            
            const generatedBagLiftId = randomUUID();
            
            // 2. Insert the Bag Lift record (Transaction removed as we only do one DB write now)
            const insertData: BagLiftInsert = {
                ...(bagLiftBody as any), // Use as any to manage the Date/string coercion safely
                id: generatedBagLiftId, 
                masonId: masonId, 
                pointsCredited: pointsCredited,
                status: 'pending', // ✅ FIX: Set status to PENDING
                approvedBy: null, // Ensure these are null on initial submission
                approvedAt: null, 
            };
            
            // Note: Since we are no longer updating ledger/balance, a transaction is not strictly required.
            const [newBagLift] = await db.insert(bagLifts)
                .values(insertData)
                .returning();

            if (!newBagLift) {
                // If the insert failed for some reason (e.g., FK constraint), throw an error.
                throw new Error('Failed to insert new bag lift record.');
            }

            // 3. Send success response
            res.status(201).json({ 
                success: true, 
                message: 'Bag Lift successfully submitted for TSO approval.', // ✅ UPDATED MESSAGE
                data: newBagLift,
                // Removed ledgerEntry from response as it's no longer created here
            });

        } catch (error: any) {
            console.error(`POST Bag Lift error:`, error);
            
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

            res.status(500).json({
                success: false,
                error: `Failed to create bag lift entry.`,
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    console.log('✅ Bag Lifts POST endpoint setup complete (Now defaults to PENDING status)');
}