//  server/src/routes/deleteRoutes/ratings.ts 
// Ratings DELETE endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { ratings, insertRatingSchema } from '../../db/schema';
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

  // DELETE BY User ID
  app.delete(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.userId, parseInt(userId)));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }

      // Delete all records for this user
      await db.delete(table).where(eq(table.userId, parseInt(userId)));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for user ${userId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Area
  app.delete(`/api/${endpoint}/area/:area`, async (req: Request, res: Response) => {
    try {
      const { area } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.area, area));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for area ${area}`
        });
      }

      // Delete all records for this area
      await db.delete(table).where(eq(table.area, area));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for area ${area}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Area error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Region
  app.delete(`/api/${endpoint}/region/:region`, async (req: Request, res: Response) => {
    try {
      const { region } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.region, region));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for region ${region}`
        });
      }

      // Delete all records for this region
      await db.delete(table).where(eq(table.region, region));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for region ${region}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Rating Value
  app.delete(`/api/${endpoint}/rating/:rating`, async (req: Request, res: Response) => {
    try {
      const { rating } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.rating, parseInt(rating)));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with rating ${rating}`
        });
      }

      // Delete all records with this rating
      await db.delete(table).where(eq(table.rating, parseInt(rating)));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with rating ${rating}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Rating error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupRatingsDeleteRoutes(app: Express) {
  // Ratings DELETE endpoints
  createAutoCRUD(app, {
    endpoint: 'ratings',
    table: ratings,
    schema: insertRatingSchema,
    tableName: 'Rating',
    autoFields: {}
  });
  
  console.log('✅ Ratings DELETE endpoints setup complete');
}