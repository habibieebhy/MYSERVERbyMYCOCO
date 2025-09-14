//  server/src/routes/deleteRoutes/brands.ts 
// Brands DELETE endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { brands, insertBrandSchema } from '../../db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: any,
  schema: z.ZodSchema,
  tableName: string,
  autoFields?: { [key: string]: () => any },
  dateField?: string
}) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;

  // DELETE BY ID
  app.delete(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if record exists
      const [existingRecord] = await db.select().from(table).where(eq(table.id, parseInt(id))).limit(1);
      
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }

      // Delete the record
      await db.delete(table).where(eq(table.id, parseInt(id)));

      res.json({ 
        success: true, 
        message: `${tableName} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Brand Name
  app.delete(`/api/${endpoint}/name/:name`, async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Check if record exists
      const [existingRecord] = await db.select().from(table).where(eq(table.name, name)).limit(1);
      
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} with name '${name}' not found`
        });
      }

      // Delete the record
      await db.delete(table).where(eq(table.name, name));

      res.json({ 
        success: true, 
        message: `${tableName} '${name}' deleted successfully`,
        deletedName: name
      });
    } catch (error) {
      console.error(`Delete ${tableName} by Name error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // BULK DELETE ALL (WARNING: Deletes all brands)
  app.delete(`/api/${endpoint}/bulk/all`, async (req: Request, res: Response) => {
    try {
      const { confirm } = req.query;

      if (confirm !== 'DELETE_ALL_BRANDS') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=DELETE_ALL_BRANDS to proceed.'
        });
      }

      // Get count of all records
      const allRecords = await db.select().from(table);
      
      if (allRecords.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found to delete`
        });
      }

      // Delete all records
      await db.delete(table);

      res.json({ 
        success: true, 
        message: `All ${allRecords.length} ${tableName}(s) deleted successfully`,
        deletedCount: allRecords.length
      });
    } catch (error) {
      console.error(`Bulk delete all ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupBrandsDeleteRoutes(app: Express) {
  // Brands DELETE endpoints
  createAutoCRUD(app, {
    endpoint: 'brands',
    table: brands,
    schema: insertBrandSchema,
    tableName: 'Brand',
    autoFields: {}
  });
  
  console.log('✅ Brands DELETE endpoints setup complete');
}