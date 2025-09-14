// server/src/routes/postRoutes/brands.ts
// Brands POST endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { brands, insertBrandSchema } from '../../db/schema';
import { z } from 'zod';

// Input validation schema
// export const insertBrandSchema = z.object({
//   name: z.string().min(1, 'Brand name is required'),
// });

function createAutoCRUD(
  app: Express,
  config: {
    endpoint: string;
    table: typeof brands;
    schema: z.ZodSchema<any>;
    tableName: string;
    autoFields?: Record<string, () => any>;
  }
) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;

  // CREATE NEW RECORD
  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const autoValues = Object.fromEntries(
        Object.entries(autoFields).map(([k, fn]) => [k, fn()])
      );

      const validatedData = schema.parse({
        ...req.body,
        ...autoValues,
      });

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
          details: error.errors,
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

export default function setupBrandsPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'brands',
    table: brands,
    schema: insertBrandSchema,
    tableName: 'Brand',
    autoFields: {}, // no timestamps here, just the raw insert
  });

  console.log('✅ Brands POST endpoints setup complete');
}