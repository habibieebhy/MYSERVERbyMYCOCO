// server/src/routes/postRoutes/dealerBrandMapping.ts
import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealerBrandMapping, insertDealerBrandMappingSchema } from '../../db/schema';
import { z } from 'zod';

// const insertDealerBrandMappingSchema = z.object({
//   dealerId: z.string().min(1, 'Dealer ID is required'),
//   brandId: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int('Brand ID must be an integer')),
//   capacityMT: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().positive('Capacity must be greater than zero')),
// });

function createAutoCRUD(
  app: Express,
  config: {
    endpoint: string;
    table: typeof dealerBrandMapping;
    schema: z.ZodSchema<any>;
    tableName: string;
  }
) {
  const { endpoint, table, schema, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const validated = schema.parse(req.body);

      // numeric(12,2) -> ensure fixed 2 decimals and pass as string
      const capacityStr = Number(validated.capacityMT).toFixed(2); // "12.50"

      const [newRecord] = await db
        .insert(table)
        .values({
          dealerId: validated.dealerId,
          brandId: validated.brandId,
          capacityMT: capacityStr,
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord,
      });
    } catch (err: any) {
      // Log *everything* useful for Neon/Postgres/Drizzle wrappers
      console.error(`Create ${tableName} error:`, {
        message: err?.message,
        code: err?.code, // SQLSTATE like 23503/23505 sometimes present
        constraint: err?.constraint,
        detail: err?.detail,
        hint: err?.hint,
        cause: err?.cause ?? err?.response ?? null, // stack of nested errors providers sometimes set here
        stack: err?.stack?.split('\n').slice(0, 5).join('\n'),
      });

      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
      }

      // Detect duplicate: common SQLSTATE 23505 OR message includes expected names
      const msg = String(err?.message ?? '').toLowerCase();
      if (err?.code === '23505' || msg.includes('duplicate') || msg.includes('dealer_brand_mapping_dealer_id_brand_id_unique') || msg.includes('dealer_brand_mapping_dealer_id_brand_id_key')) {
        return res.status(409).json({ success: false, error: 'This dealer is already mapped to this brand' });
      }

      // Foreign key violation (missing parent): SQLSTATE 23503
      if (err?.code === '23503' || msg.includes('foreign key') || msg.includes('violates foreign key constraint')) {
        return res.status(400).json({ success: false, error: 'Foreign key violation — dealer or brand does not exist', details: err?.detail ?? err?.message });
      }

      return res.status(500).json({ success: false, error: `Failed to create ${tableName}`, details: err?.message ?? 'Unknown error' });
    }
  });
}

export default function setupDealerBrandMappingPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'dealer-brand-mapping',
    table: dealerBrandMapping,
    schema: insertDealerBrandMappingSchema,
    tableName: 'Dealer Brand Mapping',
  });

  console.log('✅ Dealer Brand Mapping POST endpoints setup complete');
}