// src/routes/formSubmissionRoutes/masonpcSide.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonPcSide, pointsLedger } from '../../db/schema'; // <<<--- pointsLedger imported
import { z } from 'zod';
import { InferInsertModel, eq, sql } from 'drizzle-orm'; 
import { randomUUID } from 'crypto'; // For generating ledger ID
import { calculateJoiningBonusPoints } from '../../utils/pointsCalcLogic'; // <<<--- IMPORTED NEW LOGIC

// -------- Helpers (from addDealer.ts) --------

// empty string -> null for strings
export const strOrNull = z.preprocess((val) => {
  if (val === '') return null;
  if (typeof val === 'string') {
    const t = val.trim();
    return t === '' ? null : t;
  }
  return val;
}, z.string().nullable().optional());

// int (coerced) nullable, empty string -> null
export const intOrNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z.number().int().nullable().optional());

// -------- Input Schema --------

// Zod schema for validating the request body for a new mason.
const insertMasonPcSideSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  kycDocumentName: strOrNull,
  kycDocumentIdNum: strOrNull,
  // UPDATED: Field renamed from verificationStatus to kycStatus
  kycStatus: strOrNull, 
  bagsLifted: intOrNull,
  // pointsBalance is removed from the POST body as it's set by the server
  isReferred: z.boolean().nullable().optional(),
  referredByUser: strOrNull,
  referredToUser: strOrNull,
  dealerId: strOrNull, // Will be validated by DB foreign key
  userId: intOrNull,    // Will be validated by DB foreign key
}).strict(); 

type NewMason = InferInsertModel<typeof masonPcSide>;

export default function setupMasonPcSidePostRoutes(app: Express) {
  
  app.post('/api/masons', async (req: Request, res: Response) => {
    const tableName = 'Mason';
    const joiningPoints = calculateJoiningBonusPoints(); // Calculate points once
    
    try {
      // 1. Validate and coerce the request body
      const validated = insertMasonPcSideSchema.parse(req.body);
      const generatedMasonId = randomUUID(); // Generate Mason ID now
      
      let newRecord;
      let ledgerEntry;

      // --- 2. Start Transaction for Atomic Creation and Point Credit ---
      const transactionResult = await db.transaction(async (tx) => {
        
        // A. Map validated data to the database schema
        const insertData: NewMason = {
          id: generatedMasonId, // Use the generated ID
          name: validated.name,
          phoneNumber: validated.phoneNumber,
          kycDocumentName: validated.kycDocumentName ?? null,
          kycDocumentIdNum: validated.kycDocumentIdNum ?? null,
          kycStatus: validated.kycStatus ?? 'pending', // Default to pending if not provided
          bagsLifted: validated.bagsLifted ?? 0,
          pointsBalance: joiningPoints, // <<<--- SET INITIAL BALANCE
          isReferred: validated.isReferred ?? null,
          referredByUser: validated.referredByUser ?? null,
          referredToUser: validated.referredToUser ?? null,
          dealerId: validated.dealerId ?? null,
          userId: validated.userId ?? null,
        };

        // B. Insert the new Mason record
        const [mason] = await tx
          .insert(masonPcSide)
          .values(insertData)
          .returning();
          
        if (!mason) {
          tx.rollback();
          throw new Error('Failed to create new mason record.');
        }

        // C. Create Points Ledger Entry for Joining Bonus
        const [ledger] = await tx.insert(pointsLedger)
          .values({
            id: randomUUID(),
            masonId: generatedMasonId,
            sourceType: 'adjustment', // Use 'adjustment' or similar for one-time bonuses
            sourceId: generatedMasonId, // Link ledger entry to the newly created Mason ID
            points: joiningPoints,
            memo: 'Credit for one-time joining bonus',
          })
          .returning();
          
        if (!ledger) {
          tx.rollback();
          throw new Error('Failed to create joining bonus ledger entry.');
        }

        return { mason, ledger };
      });
      // --- End Transaction ---

      newRecord = transactionResult.mason;
      ledgerEntry = transactionResult.ledger;

      // 3. Send success response
      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully. Joining bonus of ${joiningPoints} points credited.`,
        data: newRecord,
        ledgerEntry: ledgerEntry,
      });

    } catch (err: any) {
      // 4. Handle errors
      console.error(`Create ${tableName} error:`, {
        message: err?.message,
        code: err?.code,
        constraint: err?.constraint,
        detail: err?.detail,
      });

      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })) 
        });
      }

      const msg = String(err?.message ?? '').toLowerCase();
      
      // Handle Foreign Key Violation - SQLSTATE 23503
      if (err?.code === '23503' || msg.includes('foreign key constraint')) {
        let field = 'related record';
        if (msg.includes('mason_pc_side_dealer_id_fkey')) {
          field = 'dealerId';
        } else if (msg.includes('mason_pc_side_user_id_fkey')) {
          field = 'userId';
        }
        
        return res.status(400).json({ 
          success: false, 
          error: `Foreign key violation: The specified ${field} does not exist.`,
          details: err?.detail ?? err?.message 
        });
      }

      // Handle other database or server errors
      return res.status(500).json({ 
        success: false, 
        error: `Failed to create ${tableName}`, 
        details: err?.message ?? 'Unknown error' 
      });
    }
  });

  console.log('✅ Masons POST endpoint setup complete (with Joining Bonus transaction)');
}