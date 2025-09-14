//  server/src/routes/deleteRoutes/dailytasks.ts 
// Daily Tasks DELETE endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dailyTasks, insertDailyTaskSchema } from '../../db/schema';
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

  // DELETE BY Assigned By User ID
  app.delete(`/api/${endpoint}/assigned-by/:assignedByUserId`, async (req: Request, res: Response) => {
    try {
      const { assignedByUserId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.assignedByUserId, parseInt(assignedByUserId)));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found assigned by user ${assignedByUserId}`
        });
      }

      // Delete all records assigned by this user
      await db.delete(table).where(eq(table.assignedByUserId, parseInt(assignedByUserId)));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully assigned by user ${assignedByUserId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Assigned By User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Status
  app.delete(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.status, status));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with status ${status}`
        });
      }

      // Delete all records with this status
      await db.delete(table).where(eq(table.status, status));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with status ${status}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Related Dealer ID
  app.delete(`/api/${endpoint}/dealer/:relatedDealerId`, async (req: Request, res: Response) => {
    try {
      const { relatedDealerId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(eq(table.relatedDealerId, relatedDealerId));
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for dealer ${relatedDealerId}`
        });
      }

      // Delete all records for this dealer
      await db.delete(table).where(eq(table.relatedDealerId, relatedDealerId));

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for dealer ${relatedDealerId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // BULK DELETE BY DATE RANGE
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
export default function setupDailyTasksDeleteRoutes(app: Express) {
  // Daily Tasks DELETE endpoints
  createAutoCRUD(app, {
    endpoint: 'daily-tasks',
    table: dailyTasks,
    schema: insertDailyTaskSchema,
    tableName: 'Daily Task',
    dateField: 'taskDate',
    autoFields: {
      createdAt: () => new Date().toISOString(),
      updatedAt: () => new Date().toISOString()
    }
  });
  
  console.log('✅ Daily Tasks DELETE endpoints setup complete');
}