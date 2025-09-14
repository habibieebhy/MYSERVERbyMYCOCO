// server/src/routes/postRoutes/dealers.ts
// Dealers POST endpoints using createAutoCRUD patterns

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealers, insertDealerSchema } from '../../db/schema';
import { z } from 'zod';
import { InferInsertModel } from 'drizzle-orm';

// --- Define input schema with Zod (loosely typed to avoid infinite inference) ---
// export const insertDealerSchema = z.object({
//   userId: z.number().optional(),
//   type: z.string().min(1),
//   parentDealerId: z.string().optional().nullable(),
//   name: z.string().min(1),
//   region: z.string().min(1),
//   area: z.string().min(1),
//   phoneNo: z.string().min(1),
//   address: z.string().min(1),
//   pinCode: z.string().optional().nullable(),
//   latitude: z.number().optional().nullable(),
//   longitude: z.number().optional().nullable(),
//   dateOfBirth: z.string().optional().nullable(),
//   anniversaryDate: z.string().optional().nullable(),
//   totalPotential: z.number(),
//   bestPotential: z.number(),
//   brandSelling: z.array(z.string()),
//   feedbacks: z.string().min(1),
//   remarks: z.string().optional().nullable(),
// });

// Type for insert payload
type DealerInsert = InferInsertModel<typeof dealers>;

// Auto CRUD creator
function createAutoCRUD(
  app: Express,
  config: {
    endpoint: string;
    table: typeof dealers;
    schema: z.ZodSchema<any>;
    tableName: string;
    autoFields?: Record<string, () => any>;
  }
) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  // CREATE NEW RECORD
  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // Call all autoFields
      const autoValues = Object.fromEntries(
        Object.entries(autoFields).map(([k, fn]) => [k, fn()])
      );

      const validatedData = schema.parse({
        ...req.body,
        ...autoValues,
      }) as DealerInsert;

      const [newRecord] = await db.insert(table).values(validatedData).returning();

      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord,
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues,
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Setup dealer routes
export default function setupDealersPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealers',
    table: dealers,
    schema: insertDealerSchema,
    tableName: 'Dealer',
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date(),
    },
  });

  console.log('✅ Dealers POST endpoints setup complete');
}