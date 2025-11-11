// server/src/routes/formSubmissionRoutes/masonOnScheme.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { masonOnScheme } from '../../db/schema';
import { z } from 'zod';

// Zod schema for validating the request body.
// 'enrolledAt' has a defaultNow() in the database.
const insertMasonOnSchemeSchema = z.object({
  masonId: z.string().uuid("Invalid Mason ID format. Expected UUID."),
  schemeId: z.string().uuid("Invalid Scheme ID format. Expected UUID."),
  status: z.string().min(1, "Status is required.").optional().nullable(), // Allow optional status
});

export default function setupMasonOnSchemePostRoutes(app: Express) {
  
  app.post('/api/masons-on-scheme', async (req: Request, res: Response) => {
    const tableName = 'Mason on Scheme';
    try {
      // 1. Validate the request body
      const validated = insertMasonOnSchemeSchema.parse(req.body);

      const insertData = {
        masonId: validated.masonId,
        schemeId: validated.schemeId,
        ...(validated.status && { status: validated.status }), // Only add status if provided
      };

      // 2. Insert the new record
      // 'enrolledAt' will be set by the database default
      const [newRecord] = await db
        .insert(masonOnScheme)
        .values(insertData)
        .returning();

      // 3. Send success response
      return res.status(201).json({
        success: true,
        message: `${tableName} enrollment created successfully`,
        data: newRecord,
      });

    } catch (err: any) {
      // 4. Handle errors
      console.error(`Create ${tableName} error:`, {
        message: err?.message,
        code: err?.code, // SQLSTATE (e.g., 23505 for duplicate, 23503 for FK)
        constraint: err?.constraint,
        detail: err?.detail,
      });

      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: err.errors 
        });
      }

      const msg = String(err?.message ?? '').toLowerCase();
      
      // Handle Duplicate Key (Composite PK) - SQLSTATE 23505
      if (err?.code === '23505' || msg.includes('duplicate key') || msg.includes('mason_on_scheme_pkey')) {
        return res.status(409).json({ // 409 Conflict
          success: false, 
          error: 'This mason is already enrolled in this scheme' 
        });
      }

      // Handle Foreign Key Violation - SQLSTATE 23503
      if (err?.code === '23503' || msg.includes('foreign key constraint')) {
        return res.status(400).json({ // 400 Bad Request
          success: false, 
          error: 'Foreign key violation: The specified mason or scheme does not exist',
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

  console.log('✅ Masons on Scheme POST endpoint setup complete');
}