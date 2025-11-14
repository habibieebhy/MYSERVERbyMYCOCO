// src/routes/formSubmissionRoutes/masonpcSide.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonPcSide } from '../../db/schema';
import { z } from 'zod';
import { InferInsertModel } from 'drizzle-orm'; 

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
  // UPDATED: Field renamed from pointsGained to pointsBalance
  pointsBalance: intOrNull,
  isReferred: z.boolean().nullable().optional(),
  referredByUser: strOrNull,
  referredToUser: strOrNull,
  dealerId: strOrNull, // Will be validated by DB foreign key
  userId: intOrNull,    // Will be validated by DB foreign key
}).strict(); // Use .strict() to catch any extra fields

type NewMason = InferInsertModel<typeof masonPcSide>;

export default function setupMasonPcSidePostRoutes(app: Express) {
  
  app.post('/api/masons', async (req: Request, res: Response) => {
    const tableName = 'Mason';
    try {
      // 1. Validate and coerce the request body
      const validated = insertMasonPcSideSchema.parse(req.body);

      // 2. Map validated data to the database schema
      const insertData = {
        name: validated.name,
        phoneNumber: validated.phoneNumber,
        kycDocumentName: validated.kycDocumentName ?? null,
        kycDocumentIdNum: validated.kycDocumentIdNum ?? null,
        // UPDATED: Mapping kycStatus
        kycStatus: validated.kycStatus ?? null, 
        bagsLifted: validated.bagsLifted ?? null,
        // UPDATED: Mapping pointsBalance
        pointsBalance: validated.pointsBalance ?? null,
        isReferred: validated.isReferred ?? null,
        referredByUser: validated.referredByUser ?? null,
        referredToUser: validated.referredToUser ?? null,
        dealerId: validated.dealerId ?? null,
        userId: validated.userId ?? null,
      } as NewMason;

      // 3. Insert the new record
      const [newRecord] = await db
        .insert(masonPcSide)
        .values(insertData)
        .returning();

      // 4. Send success response
      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord,
      });

    } catch (err: any) {
      // 5. Handle errors
      console.error(`Create ${tableName} error:`, {
        message: err?.message,
        code: err?.code, // SQLSTATE (e.g., 23503 for FK)
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
        
        return res.status(400).json({ // 400 Bad Request
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

  console.log('✅ Masons POST endpoint setup complete');
}