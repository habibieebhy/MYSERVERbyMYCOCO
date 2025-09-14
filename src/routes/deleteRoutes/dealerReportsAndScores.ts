//  server/src/routes/deleteRoutes/dealerReportsAndScores.ts 
// Dealer Reports and Scores DELETE endpoints using createAutoCRUD pattern

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { dealerReportsAndScores, insertDealerReportsAndScoresSchema } from '../../db/schema';
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

  // DELETE BY Dealer ID
  app.delete(`/api/${endpoint}/dealer/:dealerId`, async (req: Request, res: Response) => {
    try {
      const { dealerId } = req.params;
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      // Check if record exists (since dealerId is unique)
      const [existingRecord] = await db.select().from(table).where(eq(table.dealerId, dealerId)).limit(1);
      
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName} found for dealer ${dealerId}`
        });
      }

      // Delete the record for this dealer
      await db.delete(table).where(eq(table.dealerId, dealerId));

      res.json({ 
        success: true, 
        message: `${tableName} deleted successfully for dealer ${dealerId}`,
        deletedDealerId: dealerId
      });
    } catch (error) {
      console.error(`Delete ${tableName} by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE BY Score Range
  app.delete(`/api/${endpoint}/score-range`, async (req: Request, res: Response) => {
    try {
      const { minScore, maxScore, scoreType = 'dealerScore', confirm } = req.query;

      if (!minScore || !maxScore) {
        return res.status(400).json({
          success: false,
          error: 'minScore and maxScore parameters are required'
        });
      }

      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'This action requires confirmation. Add ?confirm=true to proceed.'
        });
      }

      const whereCondition = and(
        gte(table[scoreType as string], parseFloat(minScore as string)),
        lte(table[scoreType as string], parseFloat(maxScore as string))
      );

      // Get count of records to be deleted
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified score range`
        });
      }

      // Delete records in score range
      await db.delete(table).where(whereCondition);

      res.json({ 
        success: true, 
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with ${scoreType} between ${minScore} and ${maxScore}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Score Range error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s by score range`,
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
export default function setupDealerReportsAndScoresDeleteRoutes(app: Express) {
  // Dealer Reports and Scores DELETE endpoints
  createAutoCRUD(app, {
    endpoint: 'dealer-reports-scores',
    table: dealerReportsAndScores,
    schema: insertDealerReportsAndScoresSchema,
    tableName: 'Dealer Reports and Scores',
    dateField: 'lastUpdatedDate',
    autoFields: {
      lastUpdatedDate: () => new Date().toISOString(),
      createdAt: () => new Date().toISOString(),
      updatedAt: () => new Date().toISOString()
    }
  });
  
  console.log('✅ Dealer Reports and Scores DELETE endpoints setup complete');
}