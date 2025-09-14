//  server/src/routes/dataFetchingRoutes/dailyTasks.ts 
// Daily Tasks GET endpoints using createAutoCRUD pattern

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

  // GET ALL - with optional filtering and date range
  app.get(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, limit = '50', status, userId, assignedByUserId, visitType, relatedDealerId, pjpId, ...filters } = req.query;

      let whereCondition: any = undefined;

      // Date range filtering using taskDate
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      // Filter by status
      if (status) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.status, status as string))
          : eq(table.status, status as string);
      }

      // Filter by userId (assigned to)
      if (userId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.userId, parseInt(userId as string)))
          : eq(table.userId, parseInt(userId as string));
      }

      // Filter by assignedByUserId (created by)
      if (assignedByUserId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.assignedByUserId, parseInt(assignedByUserId as string)))
          : eq(table.assignedByUserId, parseInt(assignedByUserId as string));
      }

      // Filter by visitType
      if (visitType) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.visitType, visitType as string))
          : eq(table.visitType, visitType as string);
      }

      // Filter by relatedDealerId
      if (relatedDealerId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.relatedDealerId, relatedDealerId as string))
          : eq(table.relatedDealerId, relatedDealerId as string);
      }

      // Filter by pjpId
      if (pjpId) {
        whereCondition = whereCondition 
          ? and(whereCondition, eq(table.pjpId, pjpId as string))
          : eq(table.pjpId, pjpId as string);
      }

      // Additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          whereCondition = whereCondition
            ? and(whereCondition, eq(table[key], value))
            : eq(table[key], value);
        }
      });

      let query = db.select().from(table);
      
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      const orderField = table[dateField] || table.createdAt;
      const records = await query
        .orderBy(desc(orderField))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY User ID (assigned to user)
  app.get(`/api/${endpoint}/user/:userId`, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = '50', status, visitType } = req.query;

      let whereCondition = eq(table.userId, parseInt(userId));

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      // Additional filters
      if (status) {
        whereCondition = and(whereCondition, eq(table.status, status as string));
      }
      if (visitType) {
        whereCondition = and(whereCondition, eq(table.visitType, visitType as string));
      }

      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(orderField))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY ID
  app.get(`/api/${endpoint}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }

      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Assigned By User ID (created by user)
  app.get(`/api/${endpoint}/assigned-by/:assignedByUserId`, async (req: Request, res: Response) => {
    try {
      const { assignedByUserId } = req.params;
      const { startDate, endDate, limit = '50', status, userId } = req.query;

      let whereCondition = eq(table.assignedByUserId, parseInt(assignedByUserId));

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      // Additional filters
      if (status) {
        whereCondition = and(whereCondition, eq(table.status, status as string));
      }
      if (userId) {
        whereCondition = and(whereCondition, eq(table.userId, parseInt(userId as string)));
      }

      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(orderField))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Assigner error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET BY Status
  app.get(`/api/${endpoint}/status/:status`, async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = '50', userId, assignedByUserId } = req.query;

      let whereCondition = eq(table.status, status);

      // Date range filtering
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and(
          whereCondition,
          gte(table[dateField], startDate as string),
          lte(table[dateField], endDate as string)
        );
      }

      // Additional filters
      if (userId) {
        whereCondition = and(whereCondition, eq(table.userId, parseInt(userId as string)));
      }
      if (assignedByUserId) {
        whereCondition = and(whereCondition, eq(table.assignedByUserId, parseInt(assignedByUserId as string)));
      }

      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table)
        .where(whereCondition)
        .orderBy(desc(orderField))
        .limit(parseInt(limit as string));

      res.json({ success: true, data: records });
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
export default function setupDailyTasksRoutes(app: Express) {
  // Daily Tasks - date field, auto taskDate and status
  createAutoCRUD(app, {
    endpoint: 'daily-tasks',
    table: dailyTasks,
    schema: insertDailyTaskSchema,
    tableName: 'Daily Task',
    dateField: 'taskDate',
    autoFields: {
      taskDate: () => new Date().toISOString().split('T')[0], // date type
      status: () => 'Assigned' // default status
    }
  });
  
  console.log('✅ Daily Tasks GET endpoints setup complete');
}