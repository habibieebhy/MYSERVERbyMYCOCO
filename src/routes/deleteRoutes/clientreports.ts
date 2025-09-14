//  server/src/routes/deleteRoutes/clientreports.ts 
// Client Reports DELETE endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { clientReports, insertClientReportSchema } from '../../db/schema';
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
      const [existingRecord] = await db.select().from(table).where(eq(table.id, id)).limit(1);
      
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }

      // Delete the record
      await db.delete(table).where(eq(table.id, id));

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

  // DELETE BY Dealer Type
  app.delete(`/api/${endpoint}/dealer-type/:dealerType`, async (req: Request, res: Response) => {
    try {
      const { dealerType } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.dealerType, dealerType));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with dealer type ${dealerType}`
        });
      }

      // Delete all records with this dealer type
      await db.delete(table).where(eq(table.dealerType, dealerType));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with dealer type ${dealerType}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // BULK DELETE BY DATE RANGE (using createdAt since no specific date field)
  app.delete(`/api/${endpoint}/bulk/date-range`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, confirm } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate parameters are required'
        });
      }

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }

      const whereCondition = and(
        gte(table[dateField], startDate as string),
        lte(table[dateField], endDate as string)
      );

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }

      // Delete records in date range
      await db.delete(table).where(whereCondition);

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully from date range ${startDate} to ${endDate}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}

// Function call in the same file
export default function setupClientReportsDeleteRoutes(app: Express) {
  // Client Reports DELETE endpoints
  createAutoCRUD(app, {
    endpoint: 'client-reports',
    table: clientReports,
    schema: insertClientReportSchema,
    tableName: 'Client Report',
    dateField: 'createdAt',
    autoFields: {
      createdAt: () => new Date().toISOString(),
      updatedAt: () => new Date().toISOString()
    }
  });
  
  console.log('✅ Client Reports DELETE endpoints setup complete');
}