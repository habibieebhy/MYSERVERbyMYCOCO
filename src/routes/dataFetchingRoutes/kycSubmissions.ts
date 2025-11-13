//  server/src/routes/dataFetchingRoutes/kycSubmissions.ts 
// KYC Submissions GET endpoints using a generalized CRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { kycSubmissions, insertKycSubmissionSchema } from '../../db/schema';
import { eq, and, desc, SQL, Column } from 'drizzle-orm'; 
import { z } from 'zod';

// Helper function to handle BigInt safety (if needed, though Drizzle handles UUIDs fine)
function toJsonSafe(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof kycSubmissions,
  schema: z.ZodSchema,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  // --- GET ALL - with optional filtering ---
  // /api/kyc-submissions?masonId=...&status=pending&limit=50
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { limit = '50', status, masonId, ...filters } = req.query;

      // Allow undefined for initial state
      let whereCondition: SQL | undefined = undefined; 

      // Filter by status
      if (status) {
        const condition = eq(table.status, status as string);
        whereCondition = whereCondition
          ? and(whereCondition, condition)
          : condition;
      }

      // Filter by masonId (UUID)
      if (masonId) {
        const condition = eq(table.masonId, masonId as string);
        whereCondition = whereCondition
          ? and(whereCondition, condition)
          : condition;
      }

      // Additional filters for other fields (e.g., aadhaarNumber, panNumber, etc.)
      Object.entries(filters).forEach(([key, value]) => {
        // Safely check if the key corresponds to a column on the Drizzle table object
        const column = table[key as keyof typeof table];
        
        // Fix: Check if the column exists and isn't a function/method
        if (value && column && typeof column !== 'function') {
          // Explicitly cast to a generic Drizzle column type to satisfy the `eq()` overload
          const drizzleColumn = column as Column<any, any, any>;
          
          const condition = eq(drizzleColumn, value);
          whereCondition = whereCondition
            ? and(whereCondition, condition)
            : condition;
        }
      });

      let query = db.select().from(table);

      // Drizzle's .where() can take SQL | undefined
      const records = await query
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // --- GET BY ID ---
  // /api/kyc-submissions/:id (UUID)
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Assuming 'id' is a string UUID
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }

      res.json({ success: true, data: toJsonSafe(record) });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // --- GET BY MASON ID ---
  // /api/kyc-submissions/mason/:masonId (UUID)
  app.get(`/api/${endpoint}/mason/:masonId`, async (req: Request, res: Response) => {
    try {
      const { masonId } = req.params;
      const { limit = '50', status } = req.query;

      // FIX: Use an array to collect mandatory and optional conditions
      const conditions: (SQL | undefined)[] = [
        eq(table.masonId, masonId as string) // Mandatory filter
      ];

      // Filter by status (optional)
      if (status) {
        conditions.push(eq(table.status, status as string));
      }
      
      // Combine all conditions using `and` and filter out undefined/null.
      // The `c is SQL` assertion handles the type narrowing needed for the spread operator.
      const whereCondition = and(...conditions.filter((c): c is SQL => c !== undefined && c !== null));

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Mason ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // --- GET BY STATUS ---
  // /api/kyc-submissions/status/:status
  app.get(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const { limit = '50', masonId } = req.query;

      // FIX: Use an array to collect mandatory and optional conditions
      const conditions: (SQL | undefined)[] = [
        eq(table.status, status as string) // Mandatory filter
      ];

      // Filter by masonId (optional)
      if (masonId) {
        conditions.push(eq(table.masonId, masonId as string));
      }

      // Combine all conditions using `and` and filter out undefined/null.
      // The `c is SQL` assertion handles the type narrowing needed for the spread operator.
      const whereCondition = and(...conditions.filter((c): c is SQL => c !== undefined && c !== null));

      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(table.createdAt))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: toJsonSafe(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Function call in the same file
export default function setupKycSubmissionsRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'kyc-submissions',
    table: kycSubmissions,
    schema: insertKycSubmissionSchema, // Placeholder, assuming it exists
    tableName: 'KYC Submission',
  });
  
  console.log('✅ KYC Submissions GET endpoints setup complete');
}