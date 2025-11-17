// server/src/routes/postRoutes/technicalSites.ts

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { technicalSites, insertTechnicalSiteSchema } from '../../db/schema'; 
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { InferInsertModel } from 'drizzle-orm';

// Define the required insert type for better safety
type TechnicalSiteInsert = InferInsertModel<typeof technicalSites>;

// --- Helper for simplified Auto CRUD POST operations ---
function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof technicalSites,
  schema: z.ZodSchema<any>,
  tableName: string,
}) {
  const { endpoint, table, schema, tableName } = config;

  // CREATE NEW RECORD
  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // 1. Validate the payload against the schema
      const parsed = schema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed for Technical Site submission.', 
          details: parsed.error.errors 
        });
      }

      const validatedData = parsed.data;

      // 2. Generate a UUID for the primary key
      const generatedId = randomUUID();
      
      // 3. Prepare data for insertion, handling date coercion if needed
      const insertData: TechnicalSiteInsert = {
        ...validatedData,
        id: generatedId,
        // Drizzle will handle the default timestamps (createdAt/updatedAt) if not provided,
        // but it's often safer to explicitly cast/set Date fields from Zod strings.
        constructionStartDate: validatedData.constructionStartDate ? new Date(validatedData.constructionStartDate) : null,
        constructionEndDate: validatedData.constructionEndDate ? new Date(validatedData.constructionEndDate) : null,
        firstVistDate: validatedData.firstVistDate ? new Date(validatedData.firstVistDate) : null,
        lastVisitDate: validatedData.lastVisitDate ? new Date(validatedData.lastVisitDate) : null,
      };

      // 4. Insert the record
      const [newRecord] = await db.insert(table).values(insertData as any).returning();

      // 5. Send success response
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully with ID ${newRecord.id}`,
        data: newRecord
      });
    } catch (error: any) {
      console.error(`Create ${tableName} error:`, error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      // Handle Foreign Key (23503) or Unique Constraint (23505) violations if the database returns them
      const msg = String(error?.message ?? '').toLowerCase();
      if (error?.code === '23503' || msg.includes('violates foreign key constraint')) {
        return res.status(400).json({ success: false, error: 'Foreign Key violation: Related Dealer/Mason/PC ID does not exist.' });
      }

      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Function call in the same file
export default function setupTechnicalSitesPostRoutes(app: Express) {
  // NOTE: Assuming insertTechnicalSiteSchema is defined in schema.ts
  createAutoCRUD(app, {
    endpoint: 'technical-sites',
    table: technicalSites,
    schema: insertTechnicalSiteSchema,
    tableName: 'Technical Site',
  });
  
  console.log('✅ Technical Sites POST endpoint setup complete');
}