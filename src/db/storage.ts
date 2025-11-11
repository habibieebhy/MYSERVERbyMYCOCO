// server/src/db/storage.ts
import {
  users,
  companies,
  dailyVisitReports,
  technicalVisitReports,
  permanentJourneyPlans,
  dealers,
  salesmanAttendance,
  salesmanLeaveApplications,
  competitionReports,
  geoTracking,
  salesOrders,
  dailyTasks,
  dealerReportsAndScores,
  ratings,
  brands,
  dealerBrandMapping,
  tsoMeetings,
  rewards, // Mapped from GiftInventory
  rewardCategories, // NEW
  rewardRedemptions, // NEW
  giftAllocationLogs,
  masonPcSide,
  otpVerifications,
  schemesOffers,
  masonOnScheme,
  masonsOnMeetings,
  kycSubmissions, // NEW
  tsoAssignments, // NEW
  bagLifts, // NEW
  pointsLedger, // NEW
} from "../db/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, isNull } from "drizzle-orm";

// Local Drizzle type aliases inferred from schema (to avoid importing types)
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type DailyVisitReport = typeof dailyVisitReports.$inferSelect;
export type InsertDailyVisitReport = typeof dailyVisitReports.$inferInsert;
export type TechnicalVisitReport = typeof technicalVisitReports.$inferSelect;
export type InsertTechnicalVisitReport = typeof technicalVisitReports.$inferInsert;
export type PermanentJourneyPlan = typeof permanentJourneyPlans.$inferSelect;
export type InsertPermanentJourneyPlan = typeof permanentJourneyPlans.$inferInsert;
export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = typeof dealers.$inferInsert;
export type SalesmanAttendance = typeof salesmanAttendance.$inferSelect;
export type InsertSalesmanAttendance = typeof salesmanAttendance.$inferInsert;
export type SalesmanLeaveApplication = typeof salesmanLeaveApplications.$inferSelect;
export type InsertSalesmanLeaveApplication = typeof salesmanLeaveApplications.$inferInsert;
export type CompetitionReport = typeof competitionReports.$inferSelect;
export type InsertCompetitionReport = typeof competitionReports.$inferInsert;
export type GeoTracking = typeof geoTracking.$inferSelect;
export type InsertGeoTracking = typeof geoTracking.$inferInsert;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = typeof dailyTasks.$inferInsert;
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;
export type DealerReportsAndScores = typeof dealerReportsAndScores.$inferSelect;
export type InsertDealerReportsAndScores = typeof dealerReportsAndScores.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;
export type DealerBrandMap = typeof dealerBrandMapping.$inferSelect;
export type InsertDealerBrandMap = typeof dealerBrandMapping.$inferInsert;
export type TSOMeeting = typeof tsoMeetings.$inferSelect;
export type InsertTSOMeeting = typeof tsoMeetings.$inferInsert;

// UPDATED: Renamed from GiftInventory to Reward
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

export type GiftAllocationLog = typeof giftAllocationLogs.$inferSelect;
export type InsertGiftAllocationLog = typeof giftAllocationLogs.$inferInsert;
export type MasonPcSide = typeof masonPcSide.$inferSelect;
export type InsertMasonPcSide = typeof masonPcSide.$inferInsert;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;
export type SchemeOffer = typeof schemesOffers.$inferSelect;
export type InsertSchemeOffer = typeof schemesOffers.$inferInsert;
export type MasonOnScheme = typeof masonOnScheme.$inferSelect;
export type InsertMasonOnScheme = typeof masonOnScheme.$inferInsert;
export type MasonsOnMeetings = typeof masonsOnMeetings.$inferSelect;
export type InsertMasonsOnMeetings = typeof masonsOnMeetings.$inferInsert;

// NEW TYPES
export type RewardCategory = typeof rewardCategories.$inferSelect;
export type InsertRewardCategory = typeof rewardCategories.$inferInsert;
export type KYCSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKYCSubmission = typeof kycSubmissions.$inferInsert;
export type TSOAssignment = typeof tsoAssignments.$inferSelect;
export type InsertTSOAssignment = typeof tsoAssignments.$inferInsert;
export type BagLift = typeof bagLifts.$inferSelect;
export type InsertBagLift = typeof bagLifts.$inferInsert;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;
export type PointsLedger = typeof pointsLedger.$inferSelect;
export type InsertPointsLedger = typeof pointsLedger.$inferInsert;


export interface IStorage {
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByAdminUserId(adminUserId: string): Promise<Company | undefined>;
  getCompaniesByRegion(region: string): Promise<Company[]>;
  createCompany(insertCompany: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company>;

  getUser(id: number): Promise<User | undefined>;
  getUserByWorkosUserId(workosUserId: string): Promise<User | undefined>;
  getUserBySalesmanLoginId(salesmanLoginId: string): Promise<User | undefined>;
  getUsersByCompanyId(companyId: number): Promise<User[]>;
  getUsersByRegion(region: string): Promise<User[]>;
  getUsersByArea(area: string): Promise<User[]>;
  getUserHierarchy(userId: number): Promise<User[]>;
  getDirectReports(managerId: number): Promise<User[]>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  getDailyVisitReport(id: string): Promise<DailyVisitReport | undefined>;
  getDailyVisitReportsByUserId(userId: number): Promise<DailyVisitReport[]>;
  getDailyVisitReportsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<DailyVisitReport[]>;
  getDailyVisitReportsByCompanyDateRange(companyId: number, startDate: Date, endDate: Date): Promise<DailyVisitReport[]>;
  createDailyVisitReport(insertReport: InsertDailyVisitReport): Promise<DailyVisitReport>;
  updateDailyVisitReport(id: string, updates: Partial<InsertDailyVisitReport>): Promise<DailyVisitReport>;

  getTechnicalVisitReport(id: string): Promise<TechnicalVisitReport | undefined>;
  getTechnicalVisitReportsByUserId(userId: number): Promise<TechnicalVisitReport[]>;
  getTechnicalVisitReportsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<TechnicalVisitReport[]>;
  createTechnicalVisitReport(insertReport: InsertTechnicalVisitReport): Promise<TechnicalVisitReport>;
  updateTechnicalVisitReport(id: string, updates: Partial<InsertTechnicalVisitReport>): Promise<TechnicalVisitReport>;

  getPermanentJourneyPlan(id: string): Promise<PermanentJourneyPlan | undefined>;
  getPermanentJourneyPlansByUserId(userId: number): Promise<PermanentJourneyPlan[]>;
  getPermanentJourneyPlansAssignedToUser(userId: number): Promise<PermanentJourneyPlan[]>;
  createPermanentJourneyPlan(insertPlan: InsertPermanentJourneyPlan): Promise<PermanentJourneyPlan>;
  updatePermanentJourneyPlan(id: string, updates: Partial<InsertPermanentJourneyPlan>): Promise<PermanentJourneyPlan>;

  getDealer(id: string): Promise<Dealer | undefined>;
  getDealersByUserId(userId: number): Promise<Dealer[]>;
  getDealersByRegion(region: string): Promise<Dealer[]>;
  getDealersByArea(area: string): Promise<Dealer[]>;
  createDealer(insertDealer: InsertDealer): Promise<Dealer>;
  updateDealer(id: string, updates: Partial<InsertDealer>): Promise<Dealer>;

  getSalesmanAttendance(id: string): Promise<SalesmanAttendance | undefined>;
  getSalesmanAttendanceByUserId(userId: number): Promise<SalesmanAttendance[]>;
  getSalesmanAttendanceByDate(userId: number, date: string): Promise<SalesmanAttendance | undefined>;
  createSalesmanAttendance(insertAttendance: InsertSalesmanAttendance): Promise<SalesmanAttendance>;
  updateSalesmanAttendance(id: string, updates: Partial<InsertSalesmanAttendance>): Promise<SalesmanAttendance>;

  getSalesmanLeaveApplication(id: string): Promise<SalesmanLeaveApplication | undefined>;
  getSalesmanLeaveApplicationsByUserId(userId: number): Promise<SalesmanLeaveApplication[]>;
  getSalesmanLeaveApplicationsByStatus(status: string): Promise<SalesmanLeaveApplication[]>;
  createSalesmanLeaveApplication(insertLeave: InsertSalesmanLeaveApplication): Promise<SalesmanLeaveApplication>;
  updateSalesmanLeaveApplication(id: string, updates: Partial<InsertSalesmanLeaveApplication>): Promise<SalesmanLeaveApplication>;

  getCompetitionReport(id: string): Promise<CompetitionReport | undefined>;
  getCompetitionReportsByUserId(userId: number): Promise<CompetitionReport[]>;
  createCompetitionReport(insertReport: InsertCompetitionReport): Promise<CompetitionReport>;
  updateCompetitionReport(id: string, updates: Partial<InsertCompetitionReport>): Promise<CompetitionReport>;

  getGeoTracking(id: string): Promise<GeoTracking | undefined>;
  getGeoTrackingByUserId(userId: number): Promise<GeoTracking[]>;
  createGeoTracking(insertGeo: InsertGeoTracking): Promise<GeoTracking>;
  updateGeoTracking(id: string, updates: Partial<InsertGeoTracking>): Promise<GeoTracking>;

  getDailyTask(id: string): Promise<DailyTask | undefined>;
  getDailyTasksByUserId(userId: number): Promise<DailyTask[]>;
  getDailyTasksAssignedByUserId(assignedByUserId: number): Promise<DailyTask[]>;
  createDailyTask(insertTask: InsertDailyTask): Promise<DailyTask>;
  updateDailyTask(id: string, updates: Partial<InsertDailyTask>): Promise<DailyTask>;

  getDealerReportsAndScores(id: string): Promise<DealerReportsAndScores | undefined>;
  getDealerReportsAndScoresByDealerId(dealerId: string): Promise<DealerReportsAndScores | undefined>;
  upsertDealerReportsAndScores(data: InsertDealerReportsAndScores): Promise<DealerReportsAndScores>;

  getBusinessMetrics(companyId: number): Promise<any>;
  assignTaskToUser(taskData: InsertDailyTask): Promise<DailyTask>;

  // SALES ORDERS
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  getSalesOrdersBySalesmanId(salesmanId: number): Promise<SalesOrder[]>;
  getSalesOrdersByDealerId(dealerId: string): Promise<SalesOrder[]>;
  createSalesOrder(data: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: string, updates: Partial<InsertSalesOrder>): Promise<SalesOrder>;

  // RATINGS
  getRating(id: number): Promise<Rating | undefined>;
  getRatingsByUserId(userId: number): Promise<Rating[]>;
  createRating(data: InsertRating): Promise<Rating>;
  updateRating(id: number, updates: Partial<InsertRating>): Promise<Rating>;

  // BRANDS
  getBrand(id: number): Promise<Brand | undefined>;
  getBrandByName(name: string): Promise<Brand | undefined>;
  listBrands(): Promise<Brand[]>;
  createBrand(data: InsertBrand): Promise<Brand>;
  updateBrand(id: number, updates: Partial<InsertBrand>): Promise<Brand>;

  // DEALER BRAND MAPPING
  getDealerBrandMap(id: string): Promise<DealerBrandMap | undefined>;
  getDealerBrandMapsByDealerId(dealerId: string): Promise<DealerBrandMap[]>;
  getDealerBrandMapsByBrandId(brandId: number): Promise<DealerBrandMap[]>;
  upsertDealerBrandMap(data: InsertDealerBrandMap): Promise<DealerBrandMap>;

  // --- TSO MEETINGS
  getTSOMeeting(id: string): Promise<TSOMeeting | undefined>;
  getTSOMeetingsByUserId(userId: number): Promise<TSOMeeting[]>;
  createTSOMeeting(data: InsertTSOMeeting): Promise<TSOMeeting>;
  updateTSOMeeting(id: string, updates: Partial<InsertTSOMeeting>): Promise<TSOMeeting>;

  // --- REWARDS (UPDATED from Gift Inventory) ---
  getRewardItem(id: number): Promise<Reward | undefined>;
  listRewards(): Promise<Reward[]>;
  createRewardItem(data: InsertReward): Promise<Reward>;
  updateRewardItem(id: number, updates: Partial<InsertReward>): Promise<Reward>;

  // --- REWARD CATEGORIES (NEW) ---
  getRewardCategory(id: number): Promise<RewardCategory | undefined>;
  listRewardCategories(): Promise<RewardCategory[]>;
  createRewardCategory(data: InsertRewardCategory): Promise<RewardCategory>;
  updateRewardCategory(id: number, updates: Partial<InsertRewardCategory>): Promise<RewardCategory>;

  // --- GIFT ALLOCATION LOGS
  getGiftAllocationLog(id: string): Promise<GiftAllocationLog | undefined>;
  getGiftAllocationLogsByUserId(userId: number): Promise<GiftAllocationLog[]>;
  getGiftAllocationLogsByGiftId(giftId: number): Promise<GiftAllocationLog[]>;
  createGiftAllocationLog(data: InsertGiftAllocationLog): Promise<GiftAllocationLog>;

  // --- MASON / PC SIDE
  getMason(id: string): Promise<MasonPcSide | undefined>;
  getMasonsByUserId(userId: number): Promise<MasonPcSide[]>;
  getMasonsByDealerId(dealerId: string): Promise<MasonPcSide[]>;
  createMason(data: InsertMasonPcSide): Promise<MasonPcSide>;
  updateMason(id: string, updates: Partial<InsertMasonPcSide>): Promise<MasonPcSide>;

  // --- KYC SUBMISSIONS (NEW) ---
  getKYCSubmission(id: string): Promise<KYCSubmission | undefined>;
  getKYCSubmissionByMasonId(masonId: string): Promise<KYCSubmission | undefined>;
  createKYCSubmission(data: InsertKYCSubmission): Promise<KYCSubmission>;
  updateKYCSubmission(id: string, updates: Partial<InsertKYCSubmission>): Promise<KYCSubmission>;

  // --- TSO ASSIGNMENTS (NEW - Composite PK) ---
  getTSOAssignment(tsoId: number, masonId: string): Promise<TSOAssignment | undefined>;
  getTSOAssignmentsByTSOId(tsoId: number): Promise<TSOAssignment[]>;
  getTSOAssignmentsByMasonId(masonId: string): Promise<TSOAssignment[]>;
  addTSOAssignment(data: InsertTSOAssignment): Promise<TSOAssignment>;
  removeTSOAssignment(tsoId: number, masonId: string): Promise<void>;

  // --- BAG LIFTS (NEW) ---
  getBagLift(id: string): Promise<BagLift | undefined>;
  getBagLiftsByMasonId(masonId: string): Promise<BagLift[]>;
  getBagLiftsByDealerId(dealerId: string): Promise<BagLift[]>;
  createBagLift(data: InsertBagLift): Promise<BagLift>;
  updateBagLift(id: string, updates: Partial<InsertBagLift>): Promise<BagLift>;

  // --- REWARD REDEMPTIONS (NEW) ---
  getRewardRedemption(id: string): Promise<RewardRedemption | undefined>;
  getRewardRedemptionsByMasonId(masonId: string): Promise<RewardRedemption[]>;
  createRewardRedemption(data: InsertRewardRedemption): Promise<RewardRedemption>;
  updateRewardRedemption(id: string, updates: Partial<InsertRewardRedemption>): Promise<RewardRedemption>;

  // --- POINTS LEDGER (NEW) ---
  getPointsLedgerEntry(id: string): Promise<PointsLedger | undefined>;
  getPointsLedgerByMasonId(masonId: string): Promise<PointsLedger[]>;
  createPointsLedgerEntry(data: InsertPointsLedger): Promise<PointsLedger>;
  // Note: PointsLedger entries are typically immutable, so no update method

  // --- OTP VERIFICATIONS
  getOtp(id: string): Promise<OtpVerification | undefined>;
  findOtpByMasonId(masonId: string): Promise<OtpVerification | undefined>;
  createOtp(data: InsertOtpVerification): Promise<OtpVerification>;
  deleteOtp(id: string): Promise<void>;

  // --- SCHEMES & OFFERS
  getScheme(id: string): Promise<SchemeOffer | undefined>;
  listSchemes(): Promise<SchemeOffer[]>;
  createScheme(data: InsertSchemeOffer): Promise<SchemeOffer>;
  updateScheme(id: string, updates: Partial<InsertSchemeOffer>): Promise<SchemeOffer>;

  // --- MASON ON SCHEME
  getMasonOnScheme(masonId: string, schemeId: string): Promise<MasonOnScheme | undefined>;
  getSchemesForMason(masonId: string): Promise<MasonOnScheme[]>;
  getMasonsForScheme(schemeId: string): Promise<MasonOnScheme[]>;
  addMasonToScheme(data: InsertMasonOnScheme): Promise<MasonOnScheme>;
  removeMasonFromScheme(masonId: string, schemeId: string): Promise<void>;

  // --- MASONS ON MEETINGS
  getMasonOnMeeting(masonId: string, meetingId: string): Promise<MasonsOnMeetings | undefined>;
  getMeetingsForMason(masonId: string): Promise<MasonsOnMeetings[]>;
  getMasonsForMeeting(meetingId: string): Promise<MasonsOnMeetings[]>;
  addMasonToMeeting(data: InsertMasonsOnMeetings): Promise<MasonsOnMeetings>;
  removeMasonFromMeeting(masonId: string, meetingId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ========================================
  // COMPANY OPERATIONS
  // ========================================

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByAdminUserId(adminUserId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.adminUserId, adminUserId));
    return company || undefined;
  }

  async getCompaniesByRegion(region: string): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.region, region));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db.update(companies).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(companies.id, id)).returning();
    return company;
  }

  // ========================================
  // SALES ORDERS
  // ========================================
  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const [row] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return row || undefined;
  }
  async getSalesOrdersBySalesmanId(salesmanId: number): Promise<SalesOrder[]> {
    // @ts-ignore - Property 'salesmanId' does not exist on type 'salesOrders'. It's 'userId'.
    return await db.select().from(salesOrders).where(eq(salesOrders.userId, salesmanId));
  }
  async getSalesOrdersByDealerId(dealerId: string): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders).where(eq(salesOrders.dealerId, dealerId));
  }
  async createSalesOrder(data: InsertSalesOrder): Promise<SalesOrder> {
    const [row] = await db.insert(salesOrders).values(data).returning();
    return row;
  }
  async updateSalesOrder(id: string, updates: Partial<InsertSalesOrder>): Promise<SalesOrder> {
    const [row] = await db.update(salesOrders).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(salesOrders.id, id)).returning();
    return row;
  }

  // ========================================
  // USER OPERATIONS
  // ========================================

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByWorkosUserId(workosUserId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.workosUserId, workosUserId));
    return user || undefined;
  }

  async getUserBySalesmanLoginId(salesmanLoginId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.salesmanLoginId, salesmanLoginId));
    return user || undefined;
  }

  async getUsersByCompanyId(companyId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.companyId, companyId));
  }

  async getUsersByRegion(region: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.region, region));
  }

  async getUsersByArea(area: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.area, area));
  }

  async getUserHierarchy(userId: number): Promise<User[]> {
    const results = await db.execute(sql`
      WITH RECURSIVE hierarchy AS (
        SELECT * FROM users WHERE id = ${userId}
        UNION ALL
        SELECT u.* FROM users u
        JOIN hierarchy h ON u.reports_to_id = h.id
      )
      SELECT * FROM hierarchy;
    `);
    // @ts-ignore drizzle execute returns rows
    return results.rows as User[];
  }

  async getDirectReports(managerId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.reportsToId, managerId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }

  // ========================================
  // DAILY VISIT REPORTS
  // ========================================

  async getDailyVisitReport(id: string): Promise<DailyVisitReport | undefined> {
    const [report] = await db.select().from(dailyVisitReports).where(eq(dailyVisitReports.id, id));
    return report || undefined;
  }

  async getDailyVisitReportsByUserId(userId: number): Promise<DailyVisitReport[]> {
    return await db.select().from(dailyVisitReports).where(eq(dailyVisitReports.userId, userId)).orderBy(desc(dailyVisitReports.createdAt));
  }

  async getDailyVisitReportsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<DailyVisitReport[]> {
    return await db.select().from(dailyVisitReports).where(
      and(
        eq(dailyVisitReports.userId, userId),
        gte(dailyVisitReports.createdAt, startDate),
        lte(dailyVisitReports.createdAt, endDate)
      )
    ).orderBy(desc(dailyVisitReports.createdAt));
  }

  async getDailyVisitReportsByCompanyDateRange(companyId: number, startDate: Date, endDate: Date): Promise<DailyVisitReport[]> {
    return await db.execute(sql`
      SELECT dvr.*
      FROM daily_visit_reports dvr
      JOIN users u ON u.id = dvr.user_id
      WHERE u.company_id = ${companyId}
        AND dvr.created_at >= ${startDate}
        AND dvr.created_at <= ${endDate}
      ORDER BY dvr.created_at DESC
    `).then(res => (res as any).rows as DailyVisitReport[]);
  }

  async createDailyVisitReport(insertReport: InsertDailyVisitReport): Promise<DailyVisitReport> {
    const [report] = await db.insert(dailyVisitReports).values(insertReport).returning();
    return report;
  }

  async updateDailyVisitReport(id: string, updates: Partial<InsertDailyVisitReport>): Promise<DailyVisitReport> {
    const [report] = await db.update(dailyVisitReports).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(dailyVisitReports.id, id)).returning();
    return report;
  }

  // ========================================
  // TECHNICAL VISIT REPORTS
  // ========================================

  async getTechnicalVisitReport(id: string): Promise<TechnicalVisitReport | undefined> {
    const [report] = await db.select().from(technicalVisitReports).where(eq(technicalVisitReports.id, id));
    return report || undefined;
  }

  async getTechnicalVisitReportsByUserId(userId: number): Promise<TechnicalVisitReport[]> {
    return await db.select().from(technicalVisitReports).where(eq(technicalVisitReports.userId, userId)).orderBy(desc(technicalVisitReports.createdAt));
  }

  async getTechnicalVisitReportsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<TechnicalVisitReport[]> {
    return await db.select().from(technicalVisitReports).where(
      and(
        eq(technicalVisitReports.userId, userId),
        gte(technicalVisitReports.createdAt, startDate),
        lte(technicalVisitReports.createdAt, endDate)
      )
    ).orderBy(desc(technicalVisitReports.createdAt));
  }

  async createTechnicalVisitReport(insertReport: InsertTechnicalVisitReport): Promise<TechnicalVisitReport> {
    const [report] = await db.insert(technicalVisitReports).values(insertReport).returning();
    return report;
  }

  async updateTechnicalVisitReport(id: string, updates: Partial<InsertTechnicalVisitReport>): Promise<TechnicalVisitReport> {
    const [report] = await db.update(technicalVisitReports).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(technicalVisitReports.id, id)).returning();
    return report;
  }

  // ========================================
  // PERMANENT JOURNEY PLANS
  // ========================================

  async getPermanentJourneyPlan(id: string): Promise<PermanentJourneyPlan | undefined> {
    const [plan] = await db.select().from(permanentJourneyPlans).where(eq(permanentJourneyPlans.id, id));
    return plan || undefined;
  }

  async getPermanentJourneyPlansByUserId(userId: number): Promise<PermanentJourneyPlan[]> {
    return await db.select().from(permanentJourneyPlans).where(eq(permanentJourneyPlans.createdById, userId)).orderBy(desc(permanentJourneyPlans.createdAt));
  }

  async getPermanentJourneyPlansAssignedToUser(userId: number): Promise<PermanentJourneyPlan[]> {
    return await db.select().from(permanentJourneyPlans).where(eq(permanentJourneyPlans.userId, userId)).orderBy(desc(permanentJourneyPlans.createdAt));
  }

  async createPermanentJourneyPlan(insertPlan: InsertPermanentJourneyPlan): Promise<PermanentJourneyPlan> {
    const [plan] = await db.insert(permanentJourneyPlans).values(insertPlan).returning();
    return plan;
  }

  async updatePermanentJourneyPlan(id: string, updates: Partial<InsertPermanentJourneyPlan>): Promise<PermanentJourneyPlan> {
    const [plan] = await db.update(permanentJourneyPlans).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(permanentJourneyPlans.id, id)).returning();
    return plan;
  }

  // ========================================
  // DEALERS
  // ========================================

  async getDealer(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer || undefined;
  }

  async getDealersByUserId(userId: number): Promise<Dealer[]> {
    return await db.select().from(dealers).where(eq(dealers.userId, userId));
  }

  async getDealersByRegion(region: string): Promise<Dealer[]> {
    return await db.select().from(dealers).where(eq(dealers.region, region));
  }

  async getDealersByArea(area: string): Promise<Dealer[]> {
    return await db.select().from(dealers).where(eq(dealers.area, area));
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const [dealer] = await db.insert(dealers).values(insertDealer).returning();
    return dealer;
  }

  async updateDealer(id: string, updates: Partial<InsertDealer>): Promise<Dealer> {
    const [dealer] = await db.update(dealers).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(dealers.id, id)).returning();
    return dealer;
  }

  // ========================================
  // SALESMAN ATTENDANCE
  // ========================================

  async getSalesmanAttendance(id: string): Promise<SalesmanAttendance | undefined> {
    const [attendance] = await db.select().from(salesmanAttendance).where(eq(salesmanAttendance.id, id));
    return attendance || undefined;
  }

  async getSalesmanAttendanceByUserId(userId: number): Promise<SalesmanAttendance[]> {
    return await db.select().from(salesmanAttendance).where(eq(salesmanAttendance.userId, userId)).orderBy(desc(salesmanAttendance.createdAt));
  }

  async getSalesmanAttendanceByDate(userId: number, date: string): Promise<SalesmanAttendance | undefined> {
    const [attendance] = await db.select().from(salesmanAttendance).where(
      and(eq(salesmanAttendance.userId, userId), eq(salesmanAttendance.attendanceDate, date))
    );
    return attendance || undefined;
  }

  async createSalesmanAttendance(insertAttendance: InsertSalesmanAttendance): Promise<SalesmanAttendance> {
    const [attendance] = await db.insert(salesmanAttendance).values(insertAttendance).returning();
    return attendance;
  }

  async updateSalesmanAttendance(id: string, updates: Partial<InsertSalesmanAttendance>): Promise<SalesmanAttendance> {
    const [attendance] = await db.update(salesmanAttendance).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(salesmanAttendance.id, id)).returning();
    return attendance;
  }

  // ========================================
  // LEAVE APPLICATIONS
  // ========================================

  async getSalesmanLeaveApplication(id: string): Promise<SalesmanLeaveApplication | undefined> {
    const [leave] = await db.select().from(salesmanLeaveApplications).where(eq(salesmanLeaveApplications.id, id));
    return leave || undefined;
  }

  async getSalesmanLeaveApplicationsByUserId(userId: number): Promise<SalesmanLeaveApplication[]> {
    return await db.select().from(salesmanLeaveApplications).where(eq(salesmanLeaveApplications.userId, userId)).orderBy(desc(salesmanLeaveApplications.createdAt));
  }

  async getSalesmanLeaveApplicationsByStatus(status: string): Promise<SalesmanLeaveApplication[]> {
    return await db.select().from(salesmanLeaveApplications).where(eq(salesmanLeaveApplications.status, status)).orderBy(desc(salesmanLeaveApplications.createdAt));
  }

  async createSalesmanLeaveApplication(insertLeave: InsertSalesmanLeaveApplication): Promise<SalesmanLeaveApplication> {
    const [leave] = await db.insert(salesmanLeaveApplications).values(insertLeave).returning();
    return leave;
  }

  async updateSalesmanLeaveApplication(id: string, updates: Partial<InsertSalesmanLeaveApplication>): Promise<SalesmanLeaveApplication> {
    const [leave] = await db.update(salesmanLeaveApplications).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(salesmanLeaveApplications.id, id)).returning();
    return leave;
  }

  // ========================================
  // COMPETITION REPORTS
  // ========================================

  async getCompetitionReport(id: string): Promise<CompetitionReport | undefined> {
    const [report] = await db.select().from(competitionReports).where(eq(competitionReports.id, id));
    return report || undefined;
  }

  async getCompetitionReportsByUserId(userId: number): Promise<CompetitionReport[]> {
    return await db.select().from(competitionReports).where(eq(competitionReports.userId, userId)).orderBy(desc(competitionReports.createdAt));
  }

  async createCompetitionReport(insertReport: InsertCompetitionReport): Promise<CompetitionReport> {
    const [report] = await db.insert(competitionReports).values(insertReport).returning();
    return report;
  }

  async updateCompetitionReport(id: string, updates: Partial<InsertCompetitionReport>): Promise<CompetitionReport> {
    const [report] = await db.update(competitionReports).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(competitionReports.id, id)).returning();
    return report;
  }

  // ========================================
  // GEO TRACKING
  // ========================================

  async getGeoTracking(id: string): Promise<GeoTracking | undefined> {
    const [geo] = await db.select().from(geoTracking).where(eq(geoTracking.id, id));
    return geo || undefined;
  }

  async getGeoTrackingByUserId(userId: number): Promise<GeoTracking[]> {
    return await db.select().from(geoTracking).where(eq(geoTracking.userId, userId)).orderBy(desc(geoTracking.createdAt));
  }

  async createGeoTracking(insertGeo: InsertGeoTracking): Promise<GeoTracking> {
    const [geo] = await db.insert(geoTracking).values(insertGeo).returning();
    return geo;
  }

  async updateGeoTracking(id: string, updates: Partial<InsertGeoTracking>): Promise<GeoTracking> {
    const [geo] = await db.update(geoTracking).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(geoTracking.id, id)).returning();
    return geo;
  }

  // ========================================
  // DAILY TASKS
  // ========================================

  async getDailyTask(id: string): Promise<DailyTask | undefined> {
    const [task] = await db.select().from(dailyTasks).where(eq(dailyTasks.id, id));
    return task || undefined;
  }

  async getDailyTasksByUserId(userId: number): Promise<DailyTask[]> {
    return await db.select().from(dailyTasks).where(eq(dailyTasks.userId, userId)).orderBy(desc(dailyTasks.createdAt));
  }

  async getDailyTasksAssignedByUserId(assignedByUserId: number): Promise<DailyTask[]> {
    return await db.select().from(dailyTasks).where(eq(dailyTasks.assignedByUserId, assignedByUserId)).orderBy(desc(dailyTasks.createdAt));
  }

  async createDailyTask(insertTask: InsertDailyTask): Promise<DailyTask> {
    const [task] = await db.insert(dailyTasks).values(insertTask).returning();
    return task;
  }

  async updateDailyTask(id: string, updates: Partial<InsertDailyTask>): Promise<DailyTask> {
    const [task] = await db.update(dailyTasks).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(dailyTasks.id, id)).returning();
    return task;
  }

  // ========================================
  // DEALER REPORTS AND SCORES
  // ========================================

  async getDealerReportsAndScores(id: string): Promise<DealerReportsAndScores | undefined> {
    const [row] = await db.select().from(dealerReportsAndScores).where(eq(dealerReportsAndScores.id, id));
    return row || undefined;
  }

  async getDealerReportsAndScoresByDealerId(dealerId: string): Promise<DealerReportsAndScores | undefined> {
    const [row] = await db.select().from(dealerReportsAndScores).where(eq(dealerReportsAndScores.dealerId, dealerId));
    return row || undefined;
  }

  async upsertDealerReportsAndScores(data: InsertDealerReportsAndScores): Promise<DealerReportsAndScores> {
    // try insert; on conflict update
    try {
      const [row] = await db.insert(dealerReportsAndScores).values(data).returning();
      return row;
    } catch {
      const [row] = await db.update(dealerReportsAndScores)
        .set({
          dealerScore: (data as any).dealerScore,
          trustWorthinessScore: (data as any).trustWorthinessScore,
          creditWorthinessScore: (data as any).creditWorthinessScore,
          orderHistoryScore: (data as any).orderHistoryScore,
          visitFrequencyScore: (data as any).visitFrequencyScore,
          lastUpdatedDate: (data as any).lastUpdatedDate,
          updatedAt: new Date()
        })
        .where(eq(dealerReportsAndScores.dealerId, (data as any).dealerId))
        .returning();
      return row;
    }
  }

  // ========================================
  // BUSINESS METRICS (example aggregate)
  // ========================================

  async getBusinessMetrics(companyId: number): Promise<any> {
    try {
      const totalUsers = await db.execute(sql`SELECT COUNT(*) FROM users WHERE company_id = ${companyId}`);
      const totalReports = await db.execute(sql`
        SELECT COUNT(*) FROM (
          SELECT id FROM daily_visit_reports dvr
          JOIN users u ON u.id = dvr.user_id
          WHERE u.company_id = ${companyId}
          UNION ALL
          SELECT id FROM technical_visit_reports tvr
          JOIN users u ON u.id = tvr.user_id
          WHERE u.company_id = ${companyId}
        ) q
      `);
      const activeDealers = await db.execute(sql`
        SELECT COUNT(DISTINCT d.id) 
        FROM dealers d
        WHERE d.user_id IN (
          SELECT id FROM users WHERE company_id = ${companyId}
        )
      `);
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyAttendance = await db.select({ count: sql<number>`COUNT(*)` })
        .from(salesmanAttendance)
        .innerJoin(users, eq(salesmanAttendance.userId, users.id))
        .where(
          and(
            eq(users.companyId, companyId),
            gte(salesmanAttendance.attendanceDate, firstDayOfMonth.toISOString().split('T')[0])
          )
        );

      return {
        // Access the .rows property from the db.execute result
        totalUsers: Number(totalUsers.rows[0]?.count || 0),
        totalReports: Number(totalReports.rows[0]?.count || 0),
        activeDealers: Number(activeDealers.rows[0]?.count || 0),
        monthlyAttendance: Number(monthlyAttendance[0]?.count || 0),
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      throw error;
    }
  }

  // ========================================
  // TASK ASSIGNMENT (helper)
  // ========================================

  async assignTaskToUser(taskData: InsertDailyTask): Promise<DailyTask> {
    try {
      const task = await this.createDailyTask(taskData);
      console.log(`Task assigned to user ${taskData.userId} by user ${taskData.assignedByUserId}`);
      return task;
    } catch (error) {
      console.error('Error assigning task to user:', error);
      throw error;
    }
  }

  // ========================================
  // RATINGS
  // ========================================
  async getRating(id: number): Promise<Rating | undefined> {
    const [row] = await db.select().from(ratings).where(eq(ratings.id, id));
    return row || undefined;
  }
  async getRatingsByUserId(userId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.userId, userId));
  }
  async createRating(data: InsertRating): Promise<Rating> {
    const [row] = await db.insert(ratings).values(data).returning();
    return row;
  }
  async updateRating(id: number, updates: Partial<InsertRating>): Promise<Rating> {
    const [row] = await db.update(ratings).set({ ...updates }).where(eq(ratings.id, id)).returning();
    return row;
  }

  // ========================================
  // BRANDS
  // ========================================
  async getBrand(id: number): Promise<Brand | undefined> {
    const [row] = await db.select().from(brands).where(eq(brands.id, id));
    return row || undefined;
  }
  async getBrandByName(name: string): Promise<Brand | undefined> {
    const [row] = await db.select().from(brands).where(eq(brands.name, name));
    return row || undefined;
  }
  async listBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(asc(brands.name));
  }
  async createBrand(data: InsertBrand): Promise<Brand> {
    const [row] = await db.insert(brands).values(data).returning();
    return row;
  }
  async updateBrand(id: number, updates: Partial<InsertBrand>): Promise<Brand> {
    const [row] = await db.update(brands).set({ ...updates }).where(eq(brands.id, id)).returning();
    return row;
  }

  // ========================================
  // DEALER BRAND MAPPING
  // ========================================
  async getDealerBrandMap(id: string): Promise<DealerBrandMap | undefined> {
    const [row] = await db.select().from(dealerBrandMapping).where(eq(dealerBrandMapping.id, id));
    return row || undefined;
  }
  async getDealerBrandMapsByDealerId(dealerId: string): Promise<DealerBrandMap[]> {
    return await db.select().from(dealerBrandMapping).where(eq(dealerBrandMapping.dealerId, dealerId));
  }
  async getDealerBrandMapsByBrandId(brandId: number): Promise<DealerBrandMap[]> {
    return await db.select().from(dealerBrandMapping).where(eq(dealerBrandMapping.brandId, brandId));
  }
  async upsertDealerBrandMap(data: InsertDealerBrandMap): Promise<DealerBrandMap> {
    try {
      const [row] = await db.insert(dealerBrandMapping).values(data).returning();
      return row;
    } catch (e) {
      const [row] = await db.update(dealerBrandMapping)
        .set({ capacityMT: (data as any).capacityMT })
        .where(and(eq(dealerBrandMapping.dealerId, (data as any).dealerId), eq(dealerBrandMapping.brandId, (data as any).brandId)))
        .returning();
      return row;
    }
  }

  // ========================================
  // TSO MEETINGS
  // ========================================
  async getTSOMeeting(id: string): Promise<TSOMeeting | undefined> {
    const [row] = await db.select().from(tsoMeetings).where(eq(tsoMeetings.id, id));
    return row || undefined;
  }
  async getTSOMeetingsByUserId(userId: number): Promise<TSOMeeting[]> {
    return await db.select().from(tsoMeetings).where(eq(tsoMeetings.createdByUserId, userId)).orderBy(desc(tsoMeetings.date));
  }
  async createTSOMeeting(data: InsertTSOMeeting): Promise<TSOMeeting> {
    const [row] = await db.insert(tsoMeetings).values(data).returning();
    return row;
  }
  async updateTSOMeeting(id: string, updates: Partial<InsertTSOMeeting>): Promise<TSOMeeting> {
    const [row] = await db.update(tsoMeetings).set({ ...updates, updatedAt: new Date() }).where(eq(tsoMeetings.id, id)).returning();
    return row;
  }

  // ========================================
  // REWARDS (UPDATED from GIFT INVENTORY)
  // ========================================
  async getRewardItem(id: number): Promise<Reward | undefined> {
    const [row] = await db.select().from(rewards).where(eq(rewards.id, id));
    return row || undefined;
  }
  async listRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).orderBy(asc(rewards.itemName));
  }
  async createRewardItem(data: InsertReward): Promise<Reward> {
    const [row] = await db.insert(rewards).values(data).returning();
    return row;
  }
  async updateRewardItem(id: number, updates: Partial<InsertReward>): Promise<Reward> {
    const [row] = await db.update(rewards).set({ ...updates, updatedAt: new Date() }).where(eq(rewards.id, id)).returning();
    return row;
  }

  // ========================================
  // REWARD CATEGORIES (NEW)
  // ========================================
  async getRewardCategory(id: number): Promise<RewardCategory | undefined> {
    const [row] = await db.select().from(rewardCategories).where(eq(rewardCategories.id, id));
    return row || undefined;
  }
  async listRewardCategories(): Promise<RewardCategory[]> {
    return await db.select().from(rewardCategories).orderBy(asc(rewardCategories.name));
  }
  async createRewardCategory(data: InsertRewardCategory): Promise<RewardCategory> {
    const [row] = await db.insert(rewardCategories).values(data).returning();
    return row;
  }
  async updateRewardCategory(id: number, updates: Partial<InsertRewardCategory>): Promise<RewardCategory> {
    const [row] = await db.update(rewardCategories).set(updates).where(eq(rewardCategories.id, id)).returning();
    return row;
  }

  // ========================================
  // GIFT ALLOCATION LOGS
  // ========================================
  async getGiftAllocationLog(id: string): Promise<GiftAllocationLog | undefined> {
    const [row] = await db.select().from(giftAllocationLogs).where(eq(giftAllocationLogs.id, id));
    return row || undefined;
  }
  async getGiftAllocationLogsByUserId(userId: number): Promise<GiftAllocationLog[]> {
    return await db.select().from(giftAllocationLogs).where(eq(giftAllocationLogs.userId, userId)).orderBy(desc(giftAllocationLogs.createdAt));
  }
  async getGiftAllocationLogsByGiftId(giftId: number): Promise<GiftAllocationLog[]> {
    return await db.select().from(giftAllocationLogs).where(eq(giftAllocationLogs.giftId, giftId)).orderBy(desc(giftAllocationLogs.createdAt));
  }
  async createGiftAllocationLog(data: InsertGiftAllocationLog): Promise<GiftAllocationLog> {
    const [row] = await db.insert(giftAllocationLogs).values(data).returning();
    return row;
  }

  // ========================================
  // MASON / PC SIDE
  // ========================================
  async getMason(id: string): Promise<MasonPcSide | undefined> {
    const [row] = await db.select().from(masonPcSide).where(eq(masonPcSide.id, id));
    return row || undefined;
  }
  async getMasonsByUserId(userId: number): Promise<MasonPcSide[]> {
    return await db.select().from(masonPcSide).where(eq(masonPcSide.userId, userId));
  }
  async getMasonsByDealerId(dealerId: string): Promise<MasonPcSide[]> {
    return await db.select().from(masonPcSide).where(eq(masonPcSide.dealerId, dealerId));
  }
  async createMason(data: InsertMasonPcSide): Promise<MasonPcSide> {
    const [row] = await db.insert(masonPcSide).values(data).returning();
    return row;
  }
  async updateMason(id: string, updates: Partial<InsertMasonPcSide>): Promise<MasonPcSide> {
    const [row] = await db.update(masonPcSide).set(updates).where(eq(masonPcSide.id, id)).returning();
    return row;
  }
  
  // ========================================
  // KYC SUBMISSIONS (NEW)
  // ========================================
  async getKYCSubmission(id: string): Promise<KYCSubmission | undefined> {
    const [row] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, id));
    return row || undefined;
  }
  async getKYCSubmissionByMasonId(masonId: string): Promise<KYCSubmission | undefined> {
    // Find the most recent submission
    const [row] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.masonId, masonId)).orderBy(desc(kycSubmissions.createdAt)).limit(1);
    return row || undefined;
  }
  async createKYCSubmission(data: InsertKYCSubmission): Promise<KYCSubmission> {
    const [row] = await db.insert(kycSubmissions).values(data).returning();
    return row;
  }
  async updateKYCSubmission(id: string, updates: Partial<InsertKYCSubmission>): Promise<KYCSubmission> {
    const [row] = await db.update(kycSubmissions).set({ ...updates, updatedAt: new Date() }).where(eq(kycSubmissions.id, id)).returning();
    return row;
  }

  // ========================================
  // TSO ASSIGNMENTS (NEW - Composite PK)
  // ========================================
  async getTSOAssignment(tsoId: number, masonId: string): Promise<TSOAssignment | undefined> {
    const [row] = await db.select().from(tsoAssignments).where(and(eq(tsoAssignments.tsoId, tsoId), eq(tsoAssignments.masonId, masonId)));
    return row || undefined;
  }
  async getTSOAssignmentsByTSOId(tsoId: number): Promise<TSOAssignment[]> {
    return await db.select().from(tsoAssignments).where(eq(tsoAssignments.tsoId, tsoId)).orderBy(desc(tsoAssignments.createdAt));
  }
  async getTSOAssignmentsByMasonId(masonId: string): Promise<TSOAssignment[]> {
    return await db.select().from(tsoAssignments).where(eq(tsoAssignments.masonId, masonId)).orderBy(desc(tsoAssignments.createdAt));
  }
  async addTSOAssignment(data: InsertTSOAssignment): Promise<TSOAssignment> {
    const [row] = await db.insert(tsoAssignments).values(data).returning();
    return row;
  }
  async removeTSOAssignment(tsoId: number, masonId: string): Promise<void> {
    await db.delete(tsoAssignments).where(and(eq(tsoAssignments.tsoId, tsoId), eq(tsoAssignments.masonId, masonId)));
  }

  // ========================================
  // BAG LIFTS (NEW)
  // ========================================
  async getBagLift(id: string): Promise<BagLift | undefined> {
    const [row] = await db.select().from(bagLifts).where(eq(bagLifts.id, id));
    return row || undefined;
  }
  async getBagLiftsByMasonId(masonId: string): Promise<BagLift[]> {
    return await db.select().from(bagLifts).where(eq(bagLifts.masonId, masonId)).orderBy(desc(bagLifts.purchaseDate));
  }
  async getBagLiftsByDealerId(dealerId: string): Promise<BagLift[]> {
    return await db.select().from(bagLifts).where(eq(bagLifts.dealerId, dealerId)).orderBy(desc(bagLifts.purchaseDate));
  }
  async createBagLift(data: InsertBagLift): Promise<BagLift> {
    const [row] = await db.insert(bagLifts).values(data).returning();
    return row;
  }
  async updateBagLift(id: string, updates: Partial<InsertBagLift>): Promise<BagLift> {
    const [row] = await db.update(bagLifts).set(updates).where(eq(bagLifts.id, id)).returning();
    return row;
  }

  // ========================================
  // REWARD REDEMPTIONS (NEW)
  // ========================================
  async getRewardRedemption(id: string): Promise<RewardRedemption | undefined> {
    const [row] = await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.id, id));
    return row || undefined;
  }
  async getRewardRedemptionsByMasonId(masonId: string): Promise<RewardRedemption[]> {
    return await db.select().from(rewardRedemptions).where(eq(rewardRedemptions.masonId, masonId)).orderBy(desc(rewardRedemptions.createdAt));
  }
  async createRewardRedemption(data: InsertRewardRedemption): Promise<RewardRedemption> {
    const [row] = await db.insert(rewardRedemptions).values(data).returning();
    return row;
  }
  async updateRewardRedemption(id: string, updates: Partial<InsertRewardRedemption>): Promise<RewardRedemption> {
    const [row] = await db.update(rewardRedemptions).set({ ...updates, updatedAt: new Date() }).where(eq(rewardRedemptions.id, id)).returning();
    return row;
  }

  // ========================================
  // POINTS LEDGER (NEW)
  // ========================================
  async getPointsLedgerEntry(id: string): Promise<PointsLedger | undefined> {
    const [row] = await db.select().from(pointsLedger).where(eq(pointsLedger.id, id));
    return row || undefined;
  }
  async getPointsLedgerByMasonId(masonId: string): Promise<PointsLedger[]> {
    return await db.select().from(pointsLedger).where(eq(pointsLedger.masonId, masonId)).orderBy(desc(pointsLedger.createdAt));
  }
  async createPointsLedgerEntry(data: InsertPointsLedger): Promise<PointsLedger> {
    const [row] = await db.insert(pointsLedger).values(data).returning();
    return row;
  }

  // ========================================
  // OTP VERIFICATIONS
  // ========================================
  async getOtp(id: string): Promise<OtpVerification | undefined> {
    const [row] = await db.select().from(otpVerifications).where(eq(otpVerifications.id, id));
    return row || undefined;
  }
  async findOtpByMasonId(masonId: string): Promise<OtpVerification | undefined> {
    // Find the most recent OTP for a mason
    const [row] = await db.select().from(otpVerifications).where(eq(otpVerifications.masonId, masonId)).orderBy(desc(otpVerifications.expiresAt)).limit(1);
    return row || undefined;
  }
  async createOtp(data: InsertOtpVerification): Promise<OtpVerification> {
    const [row] = await db.insert(otpVerifications).values(data).returning();
    return row;
  }
  async deleteOtp(id: string): Promise<void> {
    await db.delete(otpVerifications).where(eq(otpVerifications.id, id));
  }

  // ========================================
  // SCHEMES & OFFERS
  // ========================================
  async getScheme(id: string): Promise<SchemeOffer | undefined> {
    const [row] = await db.select().from(schemesOffers).where(eq(schemesOffers.id, id));
    return row || undefined;
  }
  async listSchemes(): Promise<SchemeOffer[]> {
    return await db.select().from(schemesOffers).orderBy(asc(schemesOffers.name));
  }
  async createScheme(data: InsertSchemeOffer): Promise<SchemeOffer> {
    const [row] = await db.insert(schemesOffers).values(data).returning();
    return row;
  }
  async updateScheme(id: string, updates: Partial<InsertSchemeOffer>): Promise<SchemeOffer> {
    const [row] = await db.update(schemesOffers).set(updates).where(eq(schemesOffers.id, id)).returning();
    return row;
  }

  // ========================================
  // MASON ON SCHEME
  // ========================================
  async getMasonOnScheme(masonId: string, schemeId: string): Promise<MasonOnScheme | undefined> {
    const [row] = await db.select().from(masonOnScheme).where(and(eq(masonOnScheme.masonId, masonId), eq(masonOnScheme.schemeId, schemeId)));
    return row || undefined;
  }
  async getSchemesForMason(masonId: string): Promise<MasonOnScheme[]> {
    return await db.select().from(masonOnScheme).where(eq(masonOnScheme.masonId, masonId));
  }
  async getMasonsForScheme(schemeId: string): Promise<MasonOnScheme[]> {
    return await db.select().from(masonOnScheme).where(eq(masonOnScheme.schemeId, schemeId));
  }
  async addMasonToScheme(data: InsertMasonOnScheme): Promise<MasonOnScheme> {
    const [row] = await db.insert(masonOnScheme).values(data).returning();
    return row;
  }
  async removeMasonFromScheme(masonId: string, schemeId: string): Promise<void> {
    await db.delete(masonOnScheme).where(and(eq(masonOnScheme.masonId, masonId), eq(masonOnScheme.schemeId, schemeId)));
  }

  // ========================================
  // MASONS ON MEETINGS
  // ========================================
  async getMasonOnMeeting(masonId: string, meetingId: string): Promise<MasonsOnMeetings | undefined> {
    const [row] = await db.select().from(masonsOnMeetings).where(and(eq(masonsOnMeetings.masonId, masonId), eq(masonsOnMeetings.meetingId, meetingId)));
    return row || undefined;
  }
  async getMeetingsForMason(masonId: string): Promise<MasonsOnMeetings[]> {
    return await db.select().from(masonsOnMeetings).where(eq(masonsOnMeetings.masonId, masonId));
  }
  async getMasonsForMeeting(meetingId: string): Promise<MasonsOnMeetings[]> {
    return await db.select().from(masonsOnMeetings).where(eq(masonsOnMeetings.meetingId, meetingId));
  }
  async addMasonToMeeting(data: InsertMasonsOnMeetings): Promise<MasonsOnMeetings> {
    const [row] = await db.insert(masonsOnMeetings).values(data).returning();
    return row;
  }
  async removeMasonFromMeeting(masonId: string, meetingId: string): Promise<void> {
    await db.delete(masonsOnMeetings).where(and(eq(masonsOnMeetings.masonId, masonId), eq(masonsOnMeetings.meetingId, meetingId)));
  }
}

export const storage = new DatabaseStorage();