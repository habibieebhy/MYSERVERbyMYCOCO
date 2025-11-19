var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// index.ts
import express from "express";
import cors from "cors";
import path from "path";
import dotenv2 from "dotenv";

// src/db/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  authSessions: () => authSessions,
  bagLifts: () => bagLifts,
  brands: () => brands,
  companies: () => companies,
  competitionReports: () => competitionReports,
  dailyTasks: () => dailyTasks,
  dailyVisitReports: () => dailyVisitReports,
  dealerBrandMapping: () => dealerBrandMapping,
  dealerReportsAndScores: () => dealerReportsAndScores,
  dealers: () => dealers,
  geoTracking: () => geoTracking,
  giftAllocationLogs: () => giftAllocationLogs,
  insertBagLiftSchema: () => insertBagLiftSchema,
  insertBrandSchema: () => insertBrandSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCompetitionReportSchema: () => insertCompetitionReportSchema,
  insertDailyTaskSchema: () => insertDailyTaskSchema,
  insertDailyVisitReportSchema: () => insertDailyVisitReportSchema,
  insertDealerBrandMappingSchema: () => insertDealerBrandMappingSchema,
  insertDealerReportsAndScoresSchema: () => insertDealerReportsAndScoresSchema,
  insertDealerSchema: () => insertDealerSchema,
  insertGeoTrackingSchema: () => insertGeoTrackingSchema,
  insertGiftAllocationLogSchema: () => insertGiftAllocationLogSchema,
  insertKycSubmissionSchema: () => insertKycSubmissionSchema,
  insertMasonOnSchemeSchema: () => insertMasonOnSchemeSchema,
  insertMasonPcSideSchema: () => insertMasonPcSideSchema,
  insertMasonsOnMeetingsSchema: () => insertMasonsOnMeetingsSchema,
  insertOtpVerificationSchema: () => insertOtpVerificationSchema,
  insertPermanentJourneyPlanSchema: () => insertPermanentJourneyPlanSchema,
  insertPointsLedgerSchema: () => insertPointsLedgerSchema,
  insertRatingSchema: () => insertRatingSchema,
  insertRewardCategorySchema: () => insertRewardCategorySchema,
  insertRewardRedemptionSchema: () => insertRewardRedemptionSchema,
  insertRewardsSchema: () => insertRewardsSchema,
  insertSalesOrderSchema: () => insertSalesOrderSchema,
  insertSalesmanAttendanceSchema: () => insertSalesmanAttendanceSchema,
  insertSalesmanLeaveApplicationSchema: () => insertSalesmanLeaveApplicationSchema,
  insertSchemesOffersSchema: () => insertSchemesOffersSchema,
  insertTallyRawTableSchema: () => insertTallyRawTableSchema,
  insertTechnicalSiteSchema: () => insertTechnicalSiteSchema,
  insertTechnicalVisitReportSchema: () => insertTechnicalVisitReportSchema,
  insertTsoAssignmentSchema: () => insertTsoAssignmentSchema,
  insertTsoMeetingSchema: () => insertTsoMeetingSchema,
  insertUserSchema: () => insertUserSchema,
  insertauthSessionsSchema: () => insertauthSessionsSchema,
  kycSubmissions: () => kycSubmissions,
  masonOnScheme: () => masonOnScheme,
  masonPcSide: () => masonPcSide,
  masonsOnMeetings: () => masonsOnMeetings,
  otpVerifications: () => otpVerifications,
  permanentJourneyPlans: () => permanentJourneyPlans,
  pointsLedger: () => pointsLedger,
  ratings: () => ratings,
  rewardCategories: () => rewardCategories,
  rewardRedemptions: () => rewardRedemptions,
  rewards: () => rewards,
  salesOrders: () => salesOrders,
  salesmanAttendance: () => salesmanAttendance,
  salesmanLeaveApplications: () => salesmanLeaveApplications,
  schemesOffers: () => schemesOffers,
  tallyRaw: () => tallyRaw,
  technicalSites: () => technicalSites,
  technicalVisitReports: () => technicalVisitReports,
  tsoAssignments: () => tsoAssignments,
  tsoMeetings: () => tsoMeetings,
  users: () => users
});
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  numeric,
  uniqueIndex,
  index,
  jsonb,
  uuid,
  primaryKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import crypto from "crypto";
var companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  officeAddress: text("office_address").notNull(),
  isHeadOffice: boolean("is_head_office").notNull().default(true),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  region: text("region"),
  area: text("area"),
  adminUserId: varchar("admin_user_id", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow(),
  workosOrganizationId: varchar("workos_organization_id", { length: 255 }).unique()
}, (t) => [
  index("idx_admin_user_id").on(t.adminUserId)
]);
var authSessions = pgTable("auth_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  workosUserId: varchar("workos_user_id", { length: 255 }).unique(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "no action", onUpdate: "no action" }),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  inviteToken: varchar("inviteToken", { length: 255 }).unique(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  region: varchar("region", { length: 255 }),
  area: varchar("area", { length: 255 }),
  // Salesman app login fields
  salesmanLoginId: varchar("salesman_login_id", { length: 255 }).unique(),
  hashedPassword: text("hashed_password"),
  // --- ADDED FOR TECHNICAL ROLE (PRISMA SYNC) ---
  isTechnicalRole: boolean("is_technical_role").default(false),
  techLoginId: varchar("tech_login_id", { length: 255 }).unique(),
  techHashedPassword: text("tech_hash_password"),
  // Hierarchy
  // Drizzle needs this slightly loose typing for self-ref
  reportsToId: integer("reports_to_id").references(() => users.id, { onDelete: "set null" }),
  // --- ADDED FOR PRISMA PARITY ---
  noOfPJP: integer("no_of_pjp"),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" })
}, (t) => [
  uniqueIndex("users_companyid_email_unique").on(t.companyId, t.email),
  index("idx_user_company_id").on(t.companyId),
  index("idx_workos_user_id").on(t.workosUserId),
  index("idx_user_site_id").on(t.siteId)
]);
var tsoMeetings = pgTable("tso_meetings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: varchar("type", { length: 100 }).notNull(),
  // e.g., "Head Mason Meet"
  date: date("date").notNull(),
  location: varchar("location", { length: 500 }).notNull(),
  budgetAllocated: numeric("budget_allocated", { precision: 12, scale: 2 }),
  participantsCount: integer("participants_count"),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
}, (t) => [
  index("idx_tso_meetings_created_by_user_id").on(t.createdByUserId),
  index("idx_user_site_id").on(t.siteId)
]);
var permanentJourneyPlans = pgTable("permanent_journey_plans", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  // Replaced visitDealerName with a direct, reliable link to the dealers table.
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  planDate: date("plan_date").notNull(),
  areaToBeVisited: varchar("area_to_be_visited", { length: 500 }).notNull(),
  description: varchar("description", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }),
  additionalVisitRemarks: varchar("additional_visit_remarks", { length: 500 }),
  bulkOpId: varchar("bulk_op_id", { length: 50 }),
  idempotencyKey: varchar("idempotency_key", { length: 120 }),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_permanent_journey_plans_user_id").on(t.userId),
  index("idx_permanent_journey_plans_created_by_id").on(t.createdById),
  index("idx_pjp_dealer_id").on(t.dealerId),
  index("idx_pjp_bulk_op_id").on(t.bulkOpId),
  uniqueIndex("uniq_pjp_user_dealer_plan_date").on(t.userId, t.dealerId, t.planDate),
  uniqueIndex("uniq_pjp_idempotency_key_not_null").on(t.idempotencyKey).where(sql`${t.idempotencyKey} IS NOT NULL`),
  index("idx_user_site_id").on(t.siteId)
]);
var dailyVisitReports = pgTable("daily_visit_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // The main dealer this visit is associated with.
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // The specific sub-dealer that was visited (if any).
  subDealerId: varchar("sub_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  reportDate: date("report_date").notNull(),
  dealerType: varchar("dealer_type", { length: 50 }).notNull(),
  // "Dealer" | "Sub Dealer"
  location: varchar("location", { length: 500 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  visitType: varchar("visit_type", { length: 50 }).notNull(),
  dealerTotalPotential: numeric("dealer_total_potential", { precision: 10, scale: 2 }).notNull(),
  dealerBestPotential: numeric("dealer_best_potential", { precision: 10, scale: 2 }).notNull(),
  brandSelling: text("brand_selling").array().notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPersonPhoneNo: varchar("contact_person_phone_no", { length: 20 }),
  todayOrderMt: numeric("today_order_mt", { precision: 10, scale: 2 }).notNull(),
  todayCollectionRupees: numeric("today_collection_rupees", { precision: 10, scale: 2 }).notNull(),
  overdueAmount: numeric("overdue_amount", { precision: 12, scale: 2 }),
  feedbacks: varchar("feedbacks", { length: 500 }).notNull(),
  solutionBySalesperson: varchar("solution_by_salesperson", { length: 500 }),
  anyRemarks: varchar("any_remarks", { length: 500 }),
  checkInTime: timestamp("check_in_time", { withTimezone: true, precision: 6 }).notNull(),
  checkOutTime: timestamp("check_out_time", { withTimezone: true, precision: 6 }),
  // --- ADDED FROM PRISMA SYNC ---
  timeSpentinLoc: varchar("time_spent_in_loc", { length: 255 }),
  // --- END ADDED FIELD ---
  inTimeImageUrl: varchar("in_time_image_url", { length: 500 }),
  outTimeImageUrl: varchar("out_time_image_url", { length: 500 }),
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_daily_visit_reports_user_id").on(t.userId),
  index("idx_daily_visit_reports_pjp_id").on(t.pjpId),
  index("idx_dvr_dealer_id").on(t.dealerId),
  index("idx_dvr_sub_dealer_id").on(t.subDealerId)
]);
var technicalVisitReports = pgTable("technical_visit_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportDate: date("report_date").notNull(),
  visitType: varchar("visit_type", { length: 50 }).notNull(),
  siteNameConcernedPerson: varchar("site_name_concerned_person", { length: 255 }).notNull(),
  phoneNo: varchar("phone_no", { length: 20 }).notNull(),
  emailId: varchar("email_id", { length: 255 }),
  clientsRemarks: varchar("clients_remarks", { length: 500 }).notNull(),
  salespersonRemarks: varchar("salesperson_remarks", { length: 500 }).notNull(),
  checkInTime: timestamp("check_in_time", { withTimezone: true, precision: 6 }).notNull(),
  checkOutTime: timestamp("check_out_time", { withTimezone: true, precision: 6 }),
  inTimeImageUrl: varchar("in_time_image_url", { length: 500 }),
  outTimeImageUrl: varchar("out_time_image_url", { length: 500 }),
  siteVisitBrandInUse: text("site_visit_brand_in_use").array().notNull(),
  siteVisitStage: text("site_visit_stage"),
  conversionFromBrand: text("conversion_from_brand"),
  conversionQuantityValue: numeric("conversion_quantity_value", { precision: 10, scale: 2 }),
  conversionQuantityUnit: varchar("conversion_quantity_unit", { length: 20 }),
  associatedPartyName: text("associated_party_name"),
  influencerType: text("influencer_type").array().notNull(),
  serviceType: text("service_type"),
  qualityComplaint: text("quality_complaint"),
  promotionalActivity: text("promotional_activity"),
  channelPartnerVisit: text("channel_partner_visit"),
  siteVisitType: varchar("site_visit_type", { length: 50 }),
  dhalaiVerificationCode: varchar("dhalai_verification_code", { length: 50 }),
  isVerificationStatus: varchar("is_verification_status", { length: 50 }),
  meetingId: varchar("meeting_id", { length: 255 }).references(() => tsoMeetings.id),
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  timeSpentinLoc: varchar("time_spent_in_loc", { length: 255 }),
  purposeOfVisit: varchar("purpose_of_visit", { length: 500 }),
  sitePhotoUrl: varchar("site_photo_url", { length: 500 }),
  firstVisitTime: timestamp("first_visit_time", { withTimezone: true, precision: 6 }),
  lastVisitTime: timestamp("last_visit_time", { withTimezone: true, precision: 6 }),
  firstVisitDay: varchar("first_visit_day", { length: 255 }),
  lastVisitDay: varchar("last_visit_day", { length: 255 }),
  siteVisitsCount: integer("site_visits_count"),
  otherVisitsCount: integer("other_visits_count"),
  totalVisitsCount: integer("total_visits_count"),
  region: varchar("region", { length: 100 }),
  area: varchar("area", { length: 100 }),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  // Use (): any for forward reference to masonPcSide
  masonId: uuid("mason_id").references(() => masonPcSide.id, { onDelete: "set null" }),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_technical_visit_reports_user_id").on(t.userId),
  index("idx_technical_visit_reports_meeting_id").on(t.meetingId),
  index("idx_technical_visit_reports_pjp_id").on(t.pjpId),
  index("idx_tvr_mason_id").on(t.masonId),
  index("idx_user_site_id").on(t.siteId)
]);
var dealers = pgTable("dealers", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  parentDealerId: varchar("parent_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  area: varchar("area", { length: 255 }).notNull(),
  phoneNo: varchar("phone_no", { length: 20 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  pinCode: varchar("pinCode", { length: 20 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  dateOfBirth: date("dateOfBirth"),
  anniversaryDate: date("anniversaryDate"),
  totalPotential: numeric("total_potential", { precision: 10, scale: 2 }).notNull(),
  bestPotential: numeric("best_potential", { precision: 10, scale: 2 }).notNull(),
  brandSelling: text("brand_selling").array().notNull(),
  feedbacks: varchar("feedbacks", { length: 500 }).notNull(),
  remarks: varchar("remarks", { length: 500 }),
  // --- ADDED FOR PRISMA PARITY ---
  dealerDevelopmentStatus: varchar("dealerdevelopmentstatus", { length: 255 }),
  dealerDevelopmentObstacle: varchar("dealerdevelopmentobstacle", { length: 255 }),
  salesGrowthPercentage: numeric("sales_growth_percentage", { precision: 5, scale: 2 }),
  noOfPJP: integer("no_of_pjp"),
  // -----------------------------
  // Verification & IDs
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("PENDING"),
  whatsappNo: varchar("whatsapp_no", { length: 20 }),
  emailId: varchar("email_id", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  // --- NEW FIELDS ADDED ---
  nameOfFirm: varchar("nameOfFirm", { length: 500 }),
  underSalesPromoterName: varchar("underSalesPromoterName", { length: 200 }),
  // --- END NEW FIELDS ---
  gstinNo: varchar("gstin_no", { length: 20 }).unique(),
  panNo: varchar("pan_no", { length: 20 }),
  tradeLicNo: varchar("trade_lic_no", { length: 150 }),
  aadharNo: varchar("aadhar_no", { length: 20 }),
  // Godown
  godownSizeSqFt: integer("godown_size_sqft"),
  godownCapacityMTBags: varchar("godown_capacity_mt_bags", { length: 255 }),
  godownAddressLine: varchar("godown_address_line", { length: 500 }),
  godownLandMark: varchar("godown_landmark", { length: 255 }),
  godownDistrict: varchar("godown_district", { length: 100 }),
  godownArea: varchar("godown_area", { length: 255 }),
  godownRegion: varchar("godown_region", { length: 100 }),
  godownPinCode: varchar("godown_pincode", { length: 20 }),
  // Residential
  residentialAddressLine: varchar("residential_address_line", { length: 500 }),
  residentialLandMark: varchar("residential_landmark", { length: 255 }),
  residentialDistrict: varchar("residential_district", { length: 100 }),
  residentialArea: varchar("residential_area", { length: 255 }),
  residentialRegion: varchar("residential_region", { length: 100 }),
  residentialPinCode: varchar("residential_pincode", { length: 20 }),
  // Bank
  bankAccountName: varchar("bank_account_name", { length: 255 }),
  bankName: varchar("bank_name", { length: 255 }),
  bankBranchAddress: varchar("bank_branch_address", { length: 500 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  bankIfscCode: varchar("bank_ifsc_code", { length: 50 }),
  // Sales & promoter
  brandName: varchar("brand_name", { length: 255 }),
  monthlySaleMT: numeric("monthly_sale_mt", { precision: 10, scale: 2 }),
  noOfDealers: integer("no_of_dealers"),
  areaCovered: varchar("area_covered", { length: 255 }),
  projectedMonthlySalesBestCementMT: numeric("projected_monthly_sales_best_cement_mt", { precision: 10, scale: 2 }),
  noOfEmployeesInSales: integer("no_of_employees_in_sales"),
  // Declaration
  declarationName: varchar("declaration_name", { length: 255 }),
  declarationPlace: varchar("declaration_place", { length: 100 }),
  declarationDate: date("declaration_date"),
  // Document URLs
  tradeLicencePicUrl: varchar("trade_licence_pic_url", { length: 500 }),
  shopPicUrl: varchar("shop_pic_url", { length: 500 }),
  dealerPicUrl: varchar("dealer_pic_url", { length: 500 }),
  blankChequePicUrl: varchar("blank_cheque_pic_url", { length: 500 }),
  partnershipDeedPicUrl: varchar("partnership_deed_pic_url", { length: 500 }),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_dealers_user_id").on(t.userId),
  index("idx_dealers_parent_dealer_id").on(t.parentDealerId),
  index("idx_user_site_id").on(t.siteId)
]);
var salesmanAttendance = pgTable("salesman_attendance", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  attendanceDate: date("attendance_date").notNull(),
  locationName: varchar("location_name", { length: 500 }).notNull(),
  inTimeTimestamp: timestamp("in_time_timestamp", { withTimezone: true, precision: 6 }).notNull(),
  outTimeTimestamp: timestamp("out_time_timestamp", { withTimezone: true, precision: 6 }),
  inTimeImageCaptured: boolean("in_time_image_captured").notNull(),
  outTimeImageCaptured: boolean("out_time_image_captured").notNull(),
  inTimeImageUrl: varchar("in_time_image_url", { length: 500 }),
  outTimeImageUrl: varchar("out_time_image_url", { length: 500 }),
  inTimeLatitude: numeric("in_time_latitude", { precision: 10, scale: 7 }).notNull(),
  inTimeLongitude: numeric("in_time_longitude", { precision: 10, scale: 7 }).notNull(),
  inTimeAccuracy: numeric("in_time_accuracy", { precision: 10, scale: 2 }),
  inTimeSpeed: numeric("in_time_speed", { precision: 10, scale: 2 }),
  inTimeHeading: numeric("in_time_heading", { precision: 10, scale: 2 }),
  inTimeAltitude: numeric("in_time_altitude", { precision: 10, scale: 2 }),
  outTimeLatitude: numeric("out_time_latitude", { precision: 10, scale: 7 }),
  outTimeLongitude: numeric("out_time_longitude", { precision: 10, scale: 7 }),
  outTimeAccuracy: numeric("out_time_accuracy", { precision: 10, scale: 2 }),
  outTimeSpeed: numeric("out_time_speed", { precision: 10, scale: 2 }),
  outTimeHeading: numeric("out_time_heading", { precision: 10, scale: 2 }),
  outTimeAltitude: numeric("out_time_altitude", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_salesman_attendance_user_id").on(t.userId)
]);
var salesmanLeaveApplications = pgTable("salesman_leave_applications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  leaveType: varchar("leave_type", { length: 100 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  // "Pending" | "Approved" | "Rejected"
  adminRemarks: varchar("admin_remarks", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_salesman_leave_applications_user_id").on(t.userId)
]);
var competitionReports = pgTable("competition_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`substr(replace(cast(gen_random_uuid() as text),'-',''),1,25)`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportDate: date("report_date").notNull(),
  brandName: varchar("brand_name", { length: 255 }).notNull(),
  billing: varchar("billing", { length: 100 }).notNull(),
  nod: varchar("nod", { length: 100 }).notNull(),
  retail: varchar("retail", { length: 100 }).notNull(),
  schemesYesNo: varchar("schemes_yes_no", { length: 10 }).notNull(),
  avgSchemeCost: numeric("avg_scheme_cost", { precision: 10, scale: 2 }).notNull(),
  remarks: varchar("remarks", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("competition_reports_user_idx").on(t.userId)
]);
var geoTracking = pgTable("geo_tracking", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  accuracy: numeric("accuracy", { precision: 10, scale: 2 }),
  speed: numeric("speed", { precision: 10, scale: 2 }),
  heading: numeric("heading", { precision: 10, scale: 2 }),
  altitude: numeric("altitude", { precision: 10, scale: 2 }),
  locationType: varchar("location_type", { length: 50 }),
  activityType: varchar("activity_type", { length: 50 }),
  appState: varchar("app_state", { length: 50 }),
  batteryLevel: numeric("battery_level", { precision: 5, scale: 2 }),
  isCharging: boolean("is_charging"),
  networkStatus: varchar("network_status", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  siteName: varchar("site_name", { length: 255 }),
  checkInTime: timestamp("check_in_time", { withTimezone: true, precision: 6 }),
  checkOutTime: timestamp("check_out_time", { withTimezone: true, precision: 6 }),
  totalDistanceTravelled: numeric("total_distance_travelled", { precision: 10, scale: 3 }),
  journeyId: varchar("journey_id", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  destLat: numeric("dest_lat", { precision: 10, scale: 7 }),
  destLng: numeric("dest_lng", { precision: 10, scale: 7 }),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_geo_user_time").on(t.userId, t.recordedAt),
  index("idx_geo_journey_time").on(t.journeyId, t.recordedAt),
  index("idx_geo_active").on(t.isActive),
  index("idx_geo_tracking_user_id").on(t.userId),
  index("idx_geo_tracking_recorded_at").on(t.recordedAt),
  index("idx_user_site_id").on(t.siteId)
]);
var dailyTasks = pgTable("daily_tasks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedByUserId: integer("assigned_by_user_id").notNull().references(() => users.id, { onDelete: "no action" }),
  taskDate: date("task_date").notNull(),
  visitType: varchar("visit_type", { length: 50 }).notNull(),
  relatedDealerId: varchar("related_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  siteName: varchar("site_name", { length: 255 }),
  description: varchar("description", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull().default("Assigned"),
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_daily_tasks_user_id").on(t.userId),
  index("idx_daily_tasks_assigned_by_user_id").on(t.assignedByUserId),
  index("idx_daily_tasks_task_date").on(t.taskDate),
  index("idx_daily_tasks_pjp_id").on(t.pjpId),
  index("idx_daily_tasks_related_dealer_id").on(t.relatedDealerId),
  index("idx_daily_tasks_date_user").on(t.taskDate, t.userId),
  index("idx_daily_tasks_status").on(t.status),
  index("idx_user_site_id").on(t.siteId)
]);
var dealerReportsAndScores = pgTable("dealer_reports_and_scores", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`substr(replace(cast(gen_random_uuid() as text),'-',''),1,25)`),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().unique().references(() => dealers.id),
  dealerScore: numeric("dealer_score", { precision: 10, scale: 2 }).notNull(),
  trustWorthinessScore: numeric("trust_worthiness_score", { precision: 10, scale: 2 }).notNull(),
  creditWorthinessScore: numeric("credit_worthiness_score", { precision: 10, scale: 2 }).notNull(),
  orderHistoryScore: numeric("order_history_score", { precision: 10, scale: 2 }).notNull(),
  visitFrequencyScore: numeric("visit_frequency_score", { precision: 10, scale: 2 }).notNull(),
  lastUpdatedDate: timestamp("last_updated_date", { withTimezone: true, precision: 6 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
});
var ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  area: text("area").notNull(),
  region: text("region").notNull(),
  rating: integer("rating").notNull()
});
var brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("brand_name", { length: 255 }).notNull().unique()
});
var dealerBrandMapping = pgTable("dealer_brand_mapping", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`substr(replace(cast(gen_random_uuid() as text),'-',''),1,25)`),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  capacityMT: numeric("capacity_mt", { precision: 12, scale: 2 }).notNull(),
  // --- ADDED FOR PRISMA PARITY ---
  bestCapacityMT: numeric("best_capacity_mt", { precision: 12, scale: 2 }),
  brandGrowthCapacityPercent: numeric("brand_growth_capacity_percent", { precision: 5, scale: 2 }),
  userId: integer("user_id").references(() => users.id)
  // -----------------------------
}, (t) => [
  uniqueIndex("dealer_brand_mapping_dealer_id_brand_id_unique").on(t.dealerId, t.brandId)
]);
var rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => rewardCategories.id, { onDelete: "no action" }),
  itemName: varchar("item_name", { length: 255 }).notNull().unique(),
  pointCost: integer("point_cost").notNull(),
  totalAvailableQuantity: integer("total_available_quantity").notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  meta: jsonb("meta"),
  // {imageUrl, brand, variant}
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
}, (t) => [
  index("idx_rewards_category_id").on(t.categoryId)
]);
var giftAllocationLogs = pgTable("gift_allocation_logs", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  giftId: integer("gift_id").notNull().references(() => rewards.id),
  // References renamed table
  userId: integer("user_id").notNull().references(() => users.id),
  // TSO/Salesman who managed the gift
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  // Allocation | Transfer | Distribution | Deduction
  quantity: integer("quantity").notNull(),
  sourceUserId: integer("source_user_id").references(() => users.id, { onDelete: "set null" }),
  destinationUserId: integer("destination_user_id").references(() => users.id, { onDelete: "set null" }),
  // --- MODIFIED FOR PRISMA SYNC ---
  technicalVisitReportId: varchar("technical_visit_report_id", { length: 255 }).references(() => technicalVisitReports.id, { onDelete: "set null" }),
  dealerVisitReportId: varchar("dealer_visit_report_id", { length: 255 }).references(() => dailyVisitReports.id, { onDelete: "set null" }),
  // --- END MODIFICATION ---
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_gift_logs_gift_id").on(t.giftId),
  index("idx_gift_logs_user_id").on(t.userId),
  index("idx_gift_logs_source_user_id").on(t.sourceUserId),
  index("idx_gift_logs_destination_user_id").on(t.destinationUserId),
  // --- ADDED INDEXES ---
  index("idx_gift_logs_tvr_id").on(t.technicalVisitReportId),
  index("idx_gift_logs_dvr_id").on(t.dealerVisitReportId)
]);
var salesOrders = pgTable("sales_orders", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  // Relations
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  dvrId: varchar("dvr_id", { length: 255 }).references(() => dailyVisitReports.id, { onDelete: "set null" }),
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  // Business fields
  orderDate: date("order_date").notNull(),
  orderPartyName: varchar("order_party_name", { length: 255 }).notNull(),
  // Party details
  partyPhoneNo: varchar("party_phone_no", { length: 20 }),
  partyArea: varchar("party_area", { length: 255 }),
  partyRegion: varchar("party_region", { length: 255 }),
  partyAddress: varchar("party_address", { length: 500 }),
  // Delivery details
  deliveryDate: date("delivery_date"),
  deliveryArea: varchar("delivery_area", { length: 255 }),
  deliveryRegion: varchar("delivery_region", { length: 255 }),
  deliveryAddress: varchar("delivery_address", { length: 500 }),
  deliveryLocPincode: varchar("delivery_loc_pincode", { length: 10 }),
  // Payment
  paymentMode: varchar("payment_mode", { length: 50 }),
  paymentTerms: varchar("payment_terms", { length: 500 }),
  paymentAmount: numeric("payment_amount", { precision: 12, scale: 2 }),
  receivedPayment: numeric("received_payment", { precision: 12, scale: 2 }),
  receivedPaymentDate: date("received_payment_date"),
  pendingPayment: numeric("pending_payment", { precision: 12, scale: 2 }),
  // Qty & unit
  orderQty: numeric("order_qty", { precision: 12, scale: 3 }),
  orderUnit: varchar("order_unit", { length: 20 }),
  // "MT" | "BAGS"
  // Pricing & discounts
  itemPrice: numeric("item_price", { precision: 12, scale: 2 }),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }),
  itemPriceAfterDiscount: numeric("item_price_after_discount", { precision: 12, scale: 2 }),
  // Product classification
  itemType: varchar("item_type", { length: 20 }),
  // "PPC" | "OPC"
  itemGrade: varchar("item_grade", { length: 10 }),
  // "33" | "43" | "53"
  // Added status field for the Admin approval workflow
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
  // e.g., "Pending", "Approved", "Rejected"
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_sales_orders_dvr_id").on(t.dvrId),
  index("idx_sales_orders_pjp_id").on(t.pjpId),
  index("idx_sales_orders_order_date").on(t.orderDate),
  index("idx_sales_orders_dealer_id").on(t.dealerId),
  index("idx_sales_orders_status").on(t.status)
]);
var tallyRaw = pgTable("tally_raw", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionName: text("collection_name").notNull(),
  rawData: jsonb("raw_data").notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull()
});
var masonPcSide = pgTable("mason_pc_side", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  phoneNumber: text("phone_number").notNull(),
  kycDocumentName: varchar("kyc_doc_name", { length: 100 }),
  kycDocumentIdNum: varchar("kyc_doc_id_num", { length: 150 }),
  // Renamed verificationStatus to kycStatus for consistency with loyalty app
  kycStatus: varchar("kyc_status", { length: 50 }).default("none"),
  // "none" | "pending" | "approved" | "rejected"
  // Renamed pointsGained to pointsBalance for consistency with loyalty app
  pointsBalance: integer("points_balance").notNull().default(0),
  firebaseUid: varchar("firebase_uid", { length: 128 }).unique(),
  bagsLifted: integer("bags_lifted"),
  // Keep for historical tracking of volume
  isReferred: boolean("is_referred"),
  referredByUser: text("referred_by_user"),
  referredToUser: text("referred_to_user"),
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null", onUpdate: "cascade" }),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" })
  // TSO/Salesperson ID
}, (t) => [
  index("idx_mason_pc_side_dealer_id").on(t.dealerId),
  index("idx_mason_pc_side_user_id").on(t.userId),
  index("idx_user_site_id").on(t.siteId)
]);
var otpVerifications = pgTable("otp_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  otpCode: varchar("otp_code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, precision: 6 }).notNull(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" })
}, (t) => [
  index("idx_otp_verifications_mason_id").on(t.masonId)
]);
var schemesOffers = pgTable("schemes_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { withTimezone: true, precision: 6 }),
  endDate: timestamp("end_date", { withTimezone: true, precision: 6 })
});
var masonOnScheme = pgTable("mason_on_scheme", {
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade", onUpdate: "cascade" }),
  schemeId: uuid("scheme_id").notNull().references(() => schemesOffers.id, { onDelete: "cascade", onUpdate: "cascade" }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true, precision: 6 }).defaultNow(),
  siteId: uuid("site_id").references(() => technicalSites.id, { onDelete: "set null" }),
  status: varchar("status", { length: 255 })
}, (t) => ({
  pk: primaryKey({ columns: [t.masonId, t.schemeId] }),
  siteIndex: index("idx_user_site_id").on(t.siteId)
}));
var masonsOnMeetings = pgTable("masons_on_meetings", {
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  meetingId: varchar("meeting_id", { length: 255 }).notNull().references(() => tsoMeetings.id, { onDelete: "cascade" }),
  attendedAt: timestamp("attended_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => ({
  pk: primaryKey({ columns: [t.masonId, t.meetingId] }),
  meetingIdIndex: index("idx_masons_on_meetings_meeting_id").on(t.meetingId)
}));
var rewardCategories = pgTable("reward_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique()
});
var kycSubmissions = pgTable("kyc_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References masonPcSide ID (UUID)
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  aadhaarNumber: varchar("aadhaar_number", { length: 20 }),
  panNumber: varchar("pan_number", { length: 20 }),
  voterIdNumber: varchar("voter_id_number", { length: 20 }),
  documents: jsonb("documents"),
  // {aadhaarFrontUrl, aadhaarBackUrl, panUrl, voterUrl}
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  // "none", "pending", "approved", "rejected"
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
}, (t) => [
  index("idx_kyc_submissions_mason_id").on(t.masonId)
]);
var tsoAssignments = pgTable("tso_assignments", {
  tsoId: integer("tso_id").notNull().references(() => users.id),
  // TSO is a regular user
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  // The mason being managed
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => ({
  pk: primaryKey({ columns: [t.tsoId, t.masonId] }),
  // Only index on tsoId to match Prisma's @@index([tsoId])
  tsoIdIndex: index("idx_tso_assignments_tso_id").on(t.tsoId)
}));
var bagLifts = pgTable("bag_lifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  purchaseDate: timestamp("purchase_date", { withTimezone: true, precision: 6 }).notNull(),
  bagCount: integer("bag_count").notNull(),
  pointsCredited: integer("points_credited").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  imageUrl: text("image_url"),
  approvedBy: integer("approved_by").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at", { withTimezone: true, precision: 6 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_bag_lifts_mason_id").on(t.masonId),
  index("idx_bag_lifts_dealer_id").on(t.dealerId),
  index("idx_bag_lifts_status").on(t.status)
]);
var pointsLedger = pgTable("points_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type", { length: 32 }).notNull(),
  // "bag_lift" | "redemption" | "adjustment"
  sourceId: uuid("source_id"),
  // References bag_lifts.id or rewardRedemptions.id
  points: integer("points").notNull(),
  // +ve for credit, -ve for debit
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  // Added unique index on sourceId to match Prisma's @@unique constraint
  uniqueIndex("points_ledger_source_id_unique").on(t.sourceId),
  index("idx_points_ledger_mason_id").on(t.masonId),
  index("idx_points_ledger_source_id").on(t.sourceId)
]);
var rewardRedemptions = pgTable("reward_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  masonId: uuid("mason_id").notNull().references(() => masonPcSide.id, { onDelete: "cascade" }),
  rewardId: integer("reward_id").notNull().references(() => rewards.id, { onDelete: "no action" }),
  quantity: integer("quantity").notNull().default(1),
  status: varchar("status", { length: 20 }).notNull().default("placed"),
  // "placed", "approved", "shipped", "delivered", "rejected"
  pointsDebited: integer("points_debited").notNull(),
  // Delivery details
  deliveryName: varchar("delivery_name", { length: 160 }),
  deliveryPhone: varchar("delivery_phone", { length: 20 }),
  deliveryAddress: text("delivery_address"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
}, (t) => [
  index("idx_reward_redemptions_mason_id").on(t.masonId),
  index("idx_reward_redemptions_status").on(t.status)
]);
var technicalSites = pgTable("technical_sites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  // PRIMARY CONTACT INFO
  concernedPerson: varchar("concerned_person", { length: 255 }).notNull(),
  phoneNo: varchar("phone_no", { length: 20 }).notNull(),
  address: text("address"),
  // LOCATION AND GEOGRAPHY
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  siteType: varchar("site_type", { length: 50 }),
  area: varchar("area", { length: 100 }),
  region: varchar("region", { length: 100 }),
  // SECONDARY/KEYPERSON DETAILS
  keyPersonName: varchar("key_person_name", { length: 255 }),
  keyPersonPhoneNum: varchar("key_person_phone_num", { length: 20 }),
  // PROJECT/CONSTRUCTION STATUS
  stageOfConstruction: varchar("stage_of_construction", { length: 100 }),
  constructionStartDate: date("construction_start_date"),
  constructionEndDate: date("construction_end_date"),
  // SALES/TSO TRACKING FIELDS
  convertedSite: boolean("converted_site").default(false),
  firstVistDate: date("first_visit_date"),
  lastVisitDate: date("last_visit_date"),
  needFollowUp: boolean("need_follow_up").default(false),
  // PRIMARY RELATIONS (Foreign Keys)
  relatedDealerID: varchar("related_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  relatedMasonpcID: uuid("related_mason_pc_id").references(() => masonPcSide.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_technical_sites_dealer_id").on(t.relatedDealerID),
  index("idx_technical_sites_mason_id").on(t.relatedMasonpcID)
]);
var insertCompanySchema = createInsertSchema(companies);
var insertUserSchema = createInsertSchema(users);
var insertDailyVisitReportSchema = createInsertSchema(dailyVisitReports);
var insertTechnicalVisitReportSchema = createInsertSchema(technicalVisitReports);
var insertPermanentJourneyPlanSchema = createInsertSchema(permanentJourneyPlans);
var insertDealerSchema = createInsertSchema(dealers);
var insertSalesmanAttendanceSchema = createInsertSchema(salesmanAttendance);
var insertSalesmanLeaveApplicationSchema = createInsertSchema(salesmanLeaveApplications);
var insertCompetitionReportSchema = createInsertSchema(competitionReports);
var insertGeoTrackingSchema = createInsertSchema(geoTracking);
var insertDailyTaskSchema = createInsertSchema(dailyTasks);
var insertDealerReportsAndScoresSchema = createInsertSchema(dealerReportsAndScores);
var insertRatingSchema = createInsertSchema(ratings);
var insertSalesOrderSchema = createInsertSchema(salesOrders);
var insertBrandSchema = createInsertSchema(brands);
var insertDealerBrandMappingSchema = createInsertSchema(dealerBrandMapping);
var insertTsoMeetingSchema = createInsertSchema(tsoMeetings);
var insertauthSessionsSchema = createInsertSchema(authSessions);
var insertRewardsSchema = createInsertSchema(rewards);
var insertGiftAllocationLogSchema = createInsertSchema(giftAllocationLogs);
var insertTallyRawTableSchema = createInsertSchema(tallyRaw);
var insertMasonPcSideSchema = createInsertSchema(masonPcSide);
var insertOtpVerificationSchema = createInsertSchema(otpVerifications);
var insertSchemesOffersSchema = createInsertSchema(schemesOffers);
var insertMasonOnSchemeSchema = createInsertSchema(masonOnScheme);
var insertMasonsOnMeetingsSchema = createInsertSchema(masonsOnMeetings);
var insertRewardCategorySchema = createInsertSchema(rewardCategories);
var insertKycSubmissionSchema = createInsertSchema(kycSubmissions);
var insertTsoAssignmentSchema = createInsertSchema(tsoAssignments);
var insertBagLiftSchema = createInsertSchema(bagLifts);
var insertPointsLedgerSchema = createInsertSchema(pointsLedger);
var insertRewardRedemptionSchema = createInsertSchema(rewardRedemptions);
var insertTechnicalSiteSchema = createInsertSchema(technicalSites);

// src/db/db.ts
neonConfig.webSocketConstructor = ws;
var DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var globalForDb = globalThis;
var pool = globalForDb.__NEON_POOL__ ?? new Pool({
  connectionString: DATABASE_URL,
  // Optional: Neon is TLS by default; if you ever pass a naked PG URL locally,
  // uncomment the next line to enforce SSL in non-local envs.
  // ssl: { rejectUnauthorized: true },
  // Optional: keep things sane under load
  max: 10,
  // pool size
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 1e4
});
var db = globalForDb.__DRIZZLE_DB__ ?? drizzle({
  client: pool,
  schema: schema_exports
  // typed queries, thanks
});
if (process.env.NODE_ENV !== "production") {
  globalForDb.__NEON_POOL__ = pool;
  globalForDb.__DRIZZLE_DB__ = db;
}

// src/routes/auth.ts
import { eq, or } from "drizzle-orm";
import pkg from "jsonwebtoken";
var { sign, verify } = pkg;
function toJsonSafe(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (_, value) => typeof value === "bigint" ? Number(value) : value
  ));
}
var verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "Access token is missing" });
  }
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Cannot verify token.");
    return res.status(500).json({ error: "Server configuration error" });
  }
  verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ error: "Token is invalid or expired" });
    }
    req.user = user;
    next();
  });
};
function setupAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const loginId = String(req.body?.loginId ?? "").trim();
      const password = String(req.body?.password ?? "");
      if (!loginId || !password)
        return res.status(400).json({ error: "Login ID and password are required" });
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in .env. Login is impossible.");
        return res.status(500).json({ error: "Server configuration error" });
      }
      const [row] = await db.select({
        id: users.id,
        email: users.email,
        status: users.status,
        hashedPassword: users.hashedPassword,
        // This column holds plain text
        role: users.role,
        isTechnicalRole: users.isTechnicalRole,
        salesmanLoginId: users.salesmanLoginId,
        techLoginId: users.techLoginId,
        techHashedPassword: users.techHashedPassword
      }).from(users).where(or(eq(users.salesmanLoginId, loginId), eq(users.email, loginId), eq(users.techLoginId, loginId))).limit(1);
      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      if (row.status !== "active") return res.status(401).json({ error: "Account is not active" });
      let isAuthenticated = false;
      const primaryPasswordMatches = row.hashedPassword && row.hashedPassword === password;
      if (primaryPasswordMatches) {
        isAuthenticated = true;
      }
      const technicalPasswordMatches = row.techHashedPassword && row.techHashedPassword === password;
      const isTechLoginValid = row.techLoginId === loginId && technicalPasswordMatches && row.isTechnicalRole;
      if (isTechLoginValid) {
        isAuthenticated = true;
      }
      if (!isAuthenticated) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const payload = { id: row.id, email: row.email, role: row.role };
      const token = sign(
        // --- (END FIX) ---
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        token,
        userId: row.id
        // Your app parses this as an int
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });
  app2.get("/api/users/:id", verifyToken, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
      }
      const tokenUser = req.user;
      if (tokenUser.id !== userId) {
        return res.status(403).json({ error: "Forbidden: You cannot access this user's profile" });
      }
      const rows = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        phoneNumber: users.phoneNumber,
        companyId: users.companyId,
        companyName: companies.companyName,
        region: users.region,
        area: users.area,
        salesmanLoginId: users.salesmanLoginId,
        status: users.status,
        reportsToId: users.reportsToId,
        isTechnicalRole: users.isTechnicalRole,
        techLoginId: users.techLoginId,
        noOfPJP: users.noOfPJP
      }).from(users).leftJoin(companies, eq(companies.id, users.companyId)).where(eq(users.id, userId)).limit(1);
      if (!rows.length) {
        return res.status(404).json({ error: "User not found" });
      }
      const row = rows[0];
      const userPayload = {
        id: row.id,
        email: row.email,
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        role: row.role,
        phoneNumber: row.phoneNumber ?? null,
        region: row.region ?? null,
        area: row.area ?? null,
        salesmanLoginId: row.salesmanLoginId ?? null,
        status: row.status,
        reportsToId: row.reportsToId ?? null,
        isTechnicalRole: row.isTechnicalRole ?? false,
        techLoginId: row.techLoginId ?? null,
        noOfPJP: row.noOfPJP ?? null,
        company: row.companyId ? { id: row.companyId, companyName: row.companyName ?? "" } : null
      };
      res.json({ data: toJsonSafe(userPayload) });
    } catch (err) {
      console.error("GET /api/users error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });
  console.log("\u2705 Authentication endpoints setup complete");
}

// src/routes/users.ts
import { eq as eq2, and, desc, or as or2, ilike } from "drizzle-orm";
function toJsonSafe2(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (_, value) => typeof value === "bigint" ? Number(value) : value
  ));
}
var userPublicSelect = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  role: users.role,
  phoneNumber: users.phoneNumber,
  region: users.region,
  area: users.area,
  salesmanLoginId: users.salesmanLoginId,
  status: users.status,
  companyId: users.companyId,
  reportsToId: users.reportsToId,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  workosUserId: users.workosUserId,
  inviteToken: users.inviteToken,
  noOfPJP: users.noOfPJP,
  isTechnicalRole: users.isTechnicalRole,
  techLoginId: users.techLoginId
};
function parseBooleanQuery(value) {
  if (typeof value === "undefined") return void 0;
  const s = String(value).trim().toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  return void 0;
}
function createAutoCRUD(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const {
        limit = "50",
        role,
        region,
        area,
        status,
        companyId,
        reportsToId,
        search,
        isTechnical,
        isTechnicalRole
      } = req.query;
      let conditions = [];
      if (search) {
        const searchPattern = `%${String(search).trim()}%`;
        conditions.push(
          or2(
            ilike(table4.email, searchPattern),
            ilike(table4.firstName, searchPattern),
            ilike(table4.lastName, searchPattern)
          )
        );
      }
      if (role) conditions.push(eq2(table4.role, role));
      if (region) conditions.push(eq2(table4.region, region));
      if (area) conditions.push(eq2(table4.area, area));
      if (status) conditions.push(eq2(table4.status, status));
      if (companyId) {
        const id = parseInt(companyId, 10);
        if (!isNaN(id)) conditions.push(eq2(table4.companyId, id));
      }
      if (reportsToId) {
        const id = parseInt(reportsToId, 10);
        if (!isNaN(id)) conditions.push(eq2(table4.reportsToId, id));
      }
      const parsedIsTech = parseBooleanQuery(isTechnical) ?? parseBooleanQuery(isTechnicalRole);
      if (typeof parsedIsTech === "boolean") {
        conditions.push(eq2(table4.isTechnicalRole, parsedIsTech));
      }
      const baseQuery = db.select(userPublicSelect).from(table4);
      let query = baseQuery.$dynamic();
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      const records = await query.orderBy(desc(table4.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe2(records) });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/company/:companyId`, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        return res.status(400).json({ success: false, error: "Invalid company id" });
      }
      const { limit = "50", role, region, area, status, isTechnical, isTechnicalRole } = req.query;
      let conditions = [eq2(table4.companyId, companyId)];
      if (role) conditions.push(eq2(table4.role, role));
      if (region) conditions.push(eq2(table4.region, region));
      if (area) conditions.push(eq2(table4.area, area));
      if (status) conditions.push(eq2(table4.status, status));
      const parsedIsTech = parseBooleanQuery(isTechnical) ?? parseBooleanQuery(isTechnicalRole);
      if (typeof parsedIsTech === "boolean") {
        conditions.push(eq2(table4.isTechnicalRole, parsedIsTech));
      }
      const records = await db.select(userPublicSelect).from(table4).where(and(...conditions)).orderBy(desc(table4.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe2(records) });
    } catch (error) {
      console.error(`Get ${tableName4}s by Company error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid user id" });
      }
      const [record] = await db.select(userPublicSelect).from(table4).where(eq2(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: toJsonSafe2(record) });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupUsersRoutes(app2) {
  createAutoCRUD(app2, {
    endpoint: "users",
    table: users,
    schema: insertUserSchema,
    tableName: "User"
  });
  console.log("\u2705 Users GET endpoints setup complete");
}

// src/routes/companies.ts
import { eq as eq3, desc as desc2, and as and2 } from "drizzle-orm";
function toJsonSafe3(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (_, value) => typeof value === "bigint" ? Number(value) : value
  ));
}
function setupCompaniesRoutes(app2) {
  app2.get("/api/companies", async (req, res) => {
    try {
      const { limit = "50", region, area } = req.query;
      let whereCondition;
      if (region) {
        whereCondition = eq3(companies.region, region);
      }
      if (area) {
        whereCondition = whereCondition ? and2(whereCondition, eq3(companies.area, area)) : eq3(companies.area, area);
      }
      const baseSelect = db.select({
        id: companies.id,
        companyName: companies.companyName,
        officeAddress: companies.officeAddress,
        isHeadOffice: companies.isHeadOffice,
        phoneNumber: companies.phoneNumber,
        region: companies.region,
        area: companies.area,
        adminUserId: companies.adminUserId,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        workosOrganizationId: companies.workosOrganizationId
      }).from(companies);
      const query = whereCondition ? baseSelect.where(whereCondition) : baseSelect;
      const records = await query.orderBy(desc2(companies.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe3(records) });
    } catch (error) {
      console.error("Get Companies error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch companies",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid company id" });
      }
      const [record] = await db.select({
        id: companies.id,
        companyName: companies.companyName,
        officeAddress: companies.officeAddress,
        isHeadOffice: companies.isHeadOffice,
        phoneNumber: companies.phoneNumber,
        region: companies.region,
        area: companies.area,
        adminUserId: companies.adminUserId,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        workosOrganizationId: companies.workosOrganizationId
      }).from(companies).where(eq3(companies.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: "Company not found" });
      }
      res.json({ success: true, data: toJsonSafe3(record) });
    } catch (error) {
      console.error("Get Company by ID error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch company",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Companies GET endpoints setup complete");
}

// src/routes/logout.ts
function setupLogoutAuthRoutes(app2) {
  app2.post("/api/auth/logout", (req, res) => {
    try {
      console.log("User logged out successfully from the backend.");
      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, error: "An error occurred during logout." });
    }
  });
  console.log("\u2705 Auth (logout) endpoint setup complete");
}

// src/routes/cloudfareRoutes/cloudfare.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
var {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL
} = process.env;
var s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});
var upload = multer({
  storage: multer.memoryStorage()
});
function setupR2Upload(app2) {
  app2.post("/api/r2/upload-direct", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file was uploaded." });
    }
    try {
      console.log(`Received file: ${req.file.originalname}. Starting upload to R2...`);
      const objectKey = `${Date.now()}-${req.file.originalname}`;
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      });
      await s3.send(command);
      console.log(`Successfully uploaded ${objectKey} to bucket ${R2_BUCKET_NAME}.`);
      const publicUrl = `${R2_PUBLIC_URL}/${objectKey}`;
      return res.json({
        success: true,
        publicUrl
      });
    } catch (err) {
      console.error("--- R2 UPLOAD FAILED ---");
      console.error(err);
      console.error("--- END OF ERROR ---");
      return res.status(500).json({ success: false, error: err.message || "Upload failed due to an unknown error." });
    }
  });
}

// src/routes/dataFetchingRoutes/brandMappingFetch.ts
import { eq as eq4, and as and3, desc as desc3, like as like2 } from "drizzle-orm";
function createAutoCRUD2(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  if (endpoint === "brands") {
    app2.get(`/api/${endpoint}`, async (req, res) => {
      try {
        const { limit = "50", search, name, ...filters } = req.query;
        let whereCondition = void 0;
        if (search) {
          whereCondition = like2(table4.name, `%${search}%`);
        }
        if (name) {
          whereCondition = whereCondition ? and3(whereCondition, eq4(table4.name, name)) : eq4(table4.name, name);
        }
        Object.entries(filters).forEach(([key, value]) => {
          if (value && table4[key]) {
            whereCondition = whereCondition ? and3(whereCondition, eq4(table4[key], value)) : eq4(table4[key], value);
          }
        });
        let query = db.select().from(table4);
        if (whereCondition) {
          query = query.where(whereCondition);
        }
        const records = await query.orderBy(table4.name).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName4}s error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/:id`, async (req, res) => {
      try {
        const { id } = req.params;
        const [record] = await db.select().from(table4).where(eq4(table4.id, parseInt(id))).limit(1);
        if (!record) {
          return res.status(404).json({
            success: false,
            error: `${tableName4} not found`
          });
        }
        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Get ${tableName4} error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/name/:name`, async (req, res) => {
      try {
        const { name } = req.params;
        const [record] = await db.select().from(table4).where(eq4(table4.name, name)).limit(1);
        if (!record) {
          return res.status(404).json({
            success: false,
            error: `${tableName4} with name '${name}' not found`
          });
        }
        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Get ${tableName4} by name error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  }
  if (endpoint === "dealer-brand-mapping") {
    app2.get(`/api/${endpoint}`, async (req, res) => {
      try {
        const { limit = "50", dealerId, brandId, ...filters } = req.query;
        let whereCondition = void 0;
        if (dealerId) {
          whereCondition = eq4(table4.dealerId, dealerId);
        }
        if (brandId) {
          whereCondition = whereCondition ? and3(whereCondition, eq4(table4.brandId, parseInt(brandId))) : eq4(table4.brandId, parseInt(brandId));
        }
        Object.entries(filters).forEach(([key, value]) => {
          if (value && table4[key]) {
            if (key === "brandId") {
              whereCondition = whereCondition ? and3(whereCondition, eq4(table4[key], parseInt(value))) : eq4(table4[key], parseInt(value));
            } else {
              whereCondition = whereCondition ? and3(whereCondition, eq4(table4[key], value)) : eq4(table4[key], value);
            }
          }
        });
        let query = db.select().from(table4);
        if (whereCondition) {
          query = query.where(whereCondition);
        }
        const records = await query.orderBy(desc3(table4.capacityMT)).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName4}s error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/:id`, async (req, res) => {
      try {
        const { id } = req.params;
        const [record] = await db.select().from(table4).where(eq4(table4.id, id)).limit(1);
        if (!record) {
          return res.status(404).json({
            success: false,
            error: `${tableName4} not found`
          });
        }
        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Get ${tableName4} error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
      try {
        const { dealerId } = req.params;
        const { limit = "50", brandId } = req.query;
        let whereCondition = eq4(table4.dealerId, dealerId);
        if (brandId) {
          whereCondition = and3(whereCondition, eq4(table4.brandId, parseInt(brandId)));
        }
        const records = await db.select().from(table4).where(whereCondition).orderBy(desc3(table4.capacityMT)).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName4}s by Dealer error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/brand/:brandId`, async (req, res) => {
      try {
        const { brandId } = req.params;
        const { limit = "50", dealerId } = req.query;
        let whereCondition = eq4(table4.brandId, parseInt(brandId));
        if (dealerId) {
          whereCondition = and3(whereCondition, eq4(table4.dealerId, dealerId));
        }
        const records = await db.select().from(table4).where(whereCondition).orderBy(desc3(table4.capacityMT)).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName4}s by Brand error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName4}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  }
}
function setupBrandsAndMappingRoutes(app2) {
  createAutoCRUD2(app2, {
    endpoint: "brands",
    table: brands,
    schema: insertBrandSchema,
    tableName: "Brand"
    // No auto fields or date fields needed
  });
  createAutoCRUD2(app2, {
    endpoint: "dealer-brand-mapping",
    table: dealerBrandMapping,
    schema: insertDealerBrandMappingSchema,
    tableName: "Dealer Brand Mapping"
    // No auto fields or date fields needed
  });
  console.log("\u2705 Brands and Dealer Brand Mapping GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/competetionReports.ts
import { eq as eq5, and as and4, desc as desc4, gte, lte } from "drizzle-orm";
function createAutoCRUD3(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, brandName, schemesYesNo, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and4(
          gte(table4[dateField2], startDate),
          lte(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table4.userId, parseInt(userId))) : eq5(table4.userId, parseInt(userId));
      }
      if (brandName) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table4.brandName, brandName)) : eq5(table4.brandName, brandName);
      }
      if (schemesYesNo) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table4.schemesYesNo, schemesYesNo)) : eq5(table4.schemesYesNo, schemesYesNo);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and4(whereCondition, eq5(table4[key], parseInt(value))) : eq5(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and4(whereCondition, eq5(table4[key], value)) : eq5(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc4(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", brandName } = req.query;
      let whereCondition = eq5(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and4(
          whereCondition,
          gte(table4[dateField2], startDate),
          lte(table4[dateField2], endDate)
        );
      }
      if (brandName) {
        whereCondition = and4(whereCondition, eq5(table4.brandName, brandName));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc4(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq5(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/brand/:brandName`, async (req, res) => {
    try {
      const { brandName } = req.params;
      const { startDate, endDate, limit = "50", userId } = req.query;
      let whereCondition = eq5(table4.brandName, brandName);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and4(
          whereCondition,
          gte(table4[dateField2], startDate),
          lte(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and4(whereCondition, eq5(table4.userId, parseInt(userId)));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc4(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Brand error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCompetitionReportsRoutes(app2) {
  createAutoCRUD3(app2, {
    endpoint: "competition-reports",
    table: competitionReports,
    schema: insertCompetitionReportSchema,
    tableName: "Competition Report",
    dateField: "reportDate",
    autoFields: {
      reportDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Competition Reports GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/dailyTasks.ts
import { eq as eq6, and as and5, desc as desc5, gte as gte2, lte as lte2 } from "drizzle-orm";
function createAutoCRUD4(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", status, userId, assignedByUserId, visitType, relatedDealerId, pjpId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and5(
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.status, status)) : eq6(table4.status, status);
      }
      if (userId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.userId, parseInt(userId))) : eq6(table4.userId, parseInt(userId));
      }
      if (assignedByUserId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.assignedByUserId, parseInt(assignedByUserId))) : eq6(table4.assignedByUserId, parseInt(assignedByUserId));
      }
      if (visitType) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.visitType, visitType)) : eq6(table4.visitType, visitType);
      }
      if (relatedDealerId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.relatedDealerId, relatedDealerId)) : eq6(table4.relatedDealerId, relatedDealerId);
      }
      if (pjpId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.pjpId, pjpId)) : eq6(table4.pjpId, pjpId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          whereCondition = whereCondition ? and5(whereCondition, eq6(table4[key], value)) : eq6(table4[key], value);
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc5(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", status, visitType } = req.query;
      let whereCondition = eq6(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and5(
          whereCondition,
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and5(whereCondition, eq6(table4.status, status));
      }
      if (visitType) {
        whereCondition = and5(whereCondition, eq6(table4.visitType, visitType));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc5(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq6(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/assigned-by/:assignedByUserId`, async (req, res) => {
    try {
      const { assignedByUserId } = req.params;
      const { startDate, endDate, limit = "50", status, userId } = req.query;
      let whereCondition = eq6(table4.assignedByUserId, parseInt(assignedByUserId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and5(
          whereCondition,
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and5(whereCondition, eq6(table4.status, status));
      }
      if (userId) {
        whereCondition = and5(whereCondition, eq6(table4.userId, parseInt(userId)));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc5(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Assigner error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, assignedByUserId } = req.query;
      let whereCondition = eq6(table4.status, status);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and5(
          whereCondition,
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and5(whereCondition, eq6(table4.userId, parseInt(userId)));
      }
      if (assignedByUserId) {
        whereCondition = and5(whereCondition, eq6(table4.assignedByUserId, parseInt(assignedByUserId)));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc5(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyTasksRoutes(app2) {
  createAutoCRUD4(app2, {
    endpoint: "daily-tasks",
    table: dailyTasks,
    schema: insertDailyTaskSchema,
    tableName: "Daily Task",
    dateField: "taskDate",
    autoFields: {
      taskDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      // date type
      status: () => "Assigned"
      // default status
    }
  });
  console.log("\u2705 Daily Tasks GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/dealers.ts
import { eq as eq7, and as and6, desc as desc6, asc, ilike as ilike2, sql as sql2 } from "drizzle-orm";
var numberish = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
var boolish = (v) => {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return void 0;
};
function extractBrands(q) {
  const raw = q.brand ?? q.brands ?? q.brandSelling ?? void 0;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).includes(",") ? String(raw).split(",").map((s) => s.trim()).filter(Boolean) : [String(raw).trim()].filter(Boolean);
  return arr;
}
function toPgArrayLiteral(values) {
  return `{${values.map(
    (v) => String(v).replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}").trim()
  ).join(",")}}`;
}
function createAutoCRUD5(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.region) conds.push(eq7(table4.region, String(q.region)));
    if (q.area) conds.push(eq7(table4.area, String(q.area)));
    if (q.type) conds.push(eq7(table4.type, String(q.type)));
    if (q.userId) {
      const uid = numberish(q.userId);
      if (uid !== void 0) conds.push(eq7(table4.userId, uid));
    }
    if (q.verificationStatus) conds.push(eq7(table4.verificationStatus, String(q.verificationStatus)));
    if (q.pinCode) conds.push(eq7(table4.pinCode, String(q.pinCode)));
    if (q.businessType) conds.push(eq7(table4.businessType, String(q.businessType)));
    if (q.nameOfFirm) {
      conds.push(ilike2(table4.nameOfFirm, `%${String(q.nameOfFirm)}%`));
    }
    if (q.underSalesPromoterName) {
      conds.push(ilike2(table4.underSalesPromoterName, `%${String(q.underSalesPromoterName)}%`));
    }
    const onlyParents = boolish(q.onlyParents);
    const onlySubs = boolish(q.onlySubs);
    const parentDealerId = q.parentDealerId;
    if (parentDealerId) {
      conds.push(eq7(table4.parentDealerId, parentDealerId));
    } else if (onlyParents) {
      conds.push(sql2`${table4.parentDealerId} IS NULL`);
    } else if (onlySubs) {
      conds.push(sql2`${table4.parentDealerId} IS NOT NULL`);
    }
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql2`(${ilike2(table4.name, s)} 
          OR ${ilike2(table4.phoneNo, s)} 
          OR ${ilike2(table4.address, s)} 
          OR ${ilike2(table4.emailId, s)}
          // --- ✅ NEW SEARCH FIELDS ADDED ---
          OR ${ilike2(table4.nameOfFirm, s)}
          OR ${ilike2(table4.underSalesPromoterName, s)}
          // --- END NEW SEARCH FIELDS ---
          )`
      );
    }
    const brands2 = extractBrands(q);
    if (brands2.length) {
      const arrLiteral = toPgArrayLiteral(brands2);
      const anyBrand = boolish(q.anyBrand);
      if (anyBrand) {
        conds.push(sql2`${table4.brandSelling} && ${arrLiteral}::text[]`);
      } else {
        conds.push(sql2`${table4.brandSelling} @> ${arrLiteral}::text[]`);
      }
    }
    const finalConds = conds.filter(Boolean);
    if (finalConds.length === 0) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and6(...finalConds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "name":
        return direction === "asc" ? asc(table4.name) : desc6(table4.name);
      case "region":
        return direction === "asc" ? asc(table4.region) : desc6(table4.region);
      case "area":
        return direction === "asc" ? asc(table4.area) : desc6(table4.area);
      case "type":
        return direction === "asc" ? asc(table4.type) : desc6(table4.type);
      case "verificationStatus":
      case "verification_status":
        return direction === "asc" ? asc(table4.verificationStatus) : desc6(table4.verificationStatus);
      // --- ✅ NEW SORT OPTION ---
      case "salesGrowthPercentage":
        return direction === "asc" ? asc(table4.salesGrowthPercentage) : desc6(table4.salesGrowthPercentage);
      // --- END NEW SORT OPTION ---
      case "createdAt":
        return direction === "asc" ? asc(table4.createdAt) : desc6(table4.createdAt);
      default:
        return desc6(table4.createdAt);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const whereCondition = baseWhere ? extra ? and6(baseWhere, extra) : baseWhere : extra;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  app2.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));
  app2.get(`/api/${endpoint}/user/:userId`, (req, res) => {
    const uid = numberish(req.params.userId);
    if (uid === void 0) {
      return res.status(400).json({ success: false, error: "Invalid User ID" });
    }
    const base = eq7(table4.userId, uid);
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq7(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/region/:region`, (req, res) => {
    const base = eq7(table4.region, String(req.params.region));
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/area/:area`, (req, res) => {
    const base = eq7(table4.area, String(req.params.area));
    return listHandler(req, res, base);
  });
}
function setupDealersRoutes(app2) {
  createAutoCRUD5(app2, {
    endpoint: "dealers",
    table: dealers,
    schema: insertDealerSchema,
    tableName: "Dealer"
  });
  console.log("\u2705 Dealers GET endpoints with brandSelling & no default verification filter ready");
}

// src/routes/dataFetchingRoutes/pjp.ts
import { and as and7, asc as asc2, desc as desc7, eq as eq8, gte as gte3, ilike as ilike3, lte as lte3, sql as sql3 } from "drizzle-orm";
var numberish2 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
var boolish2 = (v) => v === true || v === "true" ? true : v === false || v === "false" ? false : void 0;
function createPJPAutoGET(app2, cfg) {
  const { endpoint, table: table4, tableName: tableName4, dateField: dateField2 } = cfg;
  const SORT_KEYS = {
    planDate: "planDate",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    status: "status",
    areaToBeVisited: "areaToBeVisited",
    dealerId: "dealerId",
    // <-- ✅ ADDED
    verificationStatus: "verificationStatus"
    // visitDealerName: 'visitDealerName', // <-- REMOVED
  };
  const buildWhere3 = (q) => {
    const conds = [];
    const dateColumn = table4[dateField2];
    const { startDate, endDate } = q;
    if (startDate && endDate) {
      conds.push(and7(
        gte3(dateColumn, new Date(String(startDate))),
        lte3(dateColumn, new Date(String(endDate)))
      ));
    }
    if (q.status) conds.push(eq8(table4.status, String(q.status)));
    if (q.verificationStatus) {
      conds.push(eq8(table4.verificationStatus, String(q.verificationStatus)));
    }
    if (q.dealerId) {
      conds.push(eq8(table4.dealerId, String(q.dealerId)));
    }
    const completed = boolish2(q.completed);
    if (completed === true) conds.push(eq8(table4.status, "completed"));
    const userId = numberish2(q.userId);
    if (userId !== void 0) conds.push(eq8(table4.userId, userId));
    const createdById = numberish2(q.createdById);
    if (createdById !== void 0) conds.push(eq8(table4.createdById, createdById));
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      const searchConditions = [ilike3(table4.areaToBeVisited, s)];
      if (table4.description) searchConditions.push(ilike3(table4.description, s));
      if (table4.additionalVisitRemarks) searchConditions.push(ilike3(table4.additionalVisitRemarks, s));
      conds.push(sql3`(${sql3.join(searchConditions, sql3` OR `)})`);
    }
    const finalConds = conds.filter(Boolean);
    return finalConds.length ? finalConds.length === 1 ? finalConds[0] : and7(...finalConds) : void 0;
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const key = sortByRaw && SORT_KEYS[sortByRaw] ? SORT_KEYS[sortByRaw] : "planDate";
    const dir = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    const column = table4[key];
    return dir === "asc" ? asc2(column) : desc7(column);
  };
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCond = buildWhere3(filters);
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq8(table4.userId, parseInt(userId, 10));
      const extra = buildWhere3(rest);
      const whereCond = extra ? and7(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      const data = await db.select().from(table4).where(whereCond).orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/created-by/:createdById`, async (req, res) => {
    try {
      const { createdById } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq8(table4.createdById, parseInt(createdById, 10));
      const extra = buildWhere3(rest);
      const whereCond = extra ? and7(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      const data = await db.select().from(table4).where(whereCond).orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by Creator error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq8(table4.status, status);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and7(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      const data = await db.select().from(table4).where(whereCond).orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by Status error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq8(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}` });
    }
  });
}
function setupPJPRoutes(app2) {
  createPJPAutoGET(app2, {
    endpoint: "pjp",
    table: permanentJourneyPlans,
    tableName: "Permanent Journey Plan",
    dateField: "planDate"
  });
  console.log("\u2705 PJP GET endpoints (using dealerId) ready");
}

// src/routes/dataFetchingRoutes/dealerReportandScores.ts
import { eq as eq9, and as and8, desc as desc8, gte as gte4, lte as lte4 } from "drizzle-orm";
function createAutoCRUD6(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", dealerId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and8(
          gte4(table4[dateField2], startDate),
          lte4(table4[dateField2], endDate)
        );
      }
      if (dealerId) {
        whereCondition = whereCondition ? and8(whereCondition, eq9(table4.dealerId, dealerId)) : eq9(table4.dealerId, dealerId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          whereCondition = whereCondition ? and8(whereCondition, eq9(table4[key], value)) : eq9(table4[key], value);
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await query.orderBy(desc8(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq9(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50" } = req.query;
      let whereCondition = eq9(table4.dealerId, dealerId);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and8(
          whereCondition,
          gte4(table4[dateField2], startDate),
          lte4(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc8(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/score-range`, async (req, res) => {
    try {
      const { minScore, maxScore, scoreType = "dealerScore", limit = "50", startDate, endDate } = req.query;
      if (!minScore || !maxScore) {
        return res.status(400).json({
          success: false,
          error: "minScore and maxScore parameters are required"
        });
      }
      let whereCondition = and8(
        gte4(table4[scoreType], parseFloat(minScore)),
        lte4(table4[scoreType], parseFloat(maxScore))
      );
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and8(
          whereCondition,
          gte4(table4[dateField2], startDate),
          lte4(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc8(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Score Range error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s by score range`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealerReportsAndScoresRoutes(app2) {
  createAutoCRUD6(app2, {
    endpoint: "dealer-reports-scores",
    table: dealerReportsAndScores,
    schema: insertDealerReportsAndScoresSchema,
    tableName: "Dealer Reports and Scores",
    dateField: "lastUpdatedDate",
    autoFields: {
      lastUpdatedDate: () => (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Dealer Reports and Scores GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/ratings.ts
import { eq as eq10, and as and9, desc as desc9 } from "drizzle-orm";
function createAutoCRUD7(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", userId, area, region, rating, ...filters } = req.query;
      let whereCondition = void 0;
      if (userId) {
        whereCondition = eq10(table4.userId, parseInt(userId));
      }
      if (area) {
        whereCondition = whereCondition ? and9(whereCondition, eq10(table4.area, area)) : eq10(table4.area, area);
      }
      if (region) {
        whereCondition = whereCondition ? and9(whereCondition, eq10(table4.region, region)) : eq10(table4.region, region);
      }
      if (rating) {
        whereCondition = whereCondition ? and9(whereCondition, eq10(table4.rating, parseInt(rating))) : eq10(table4.rating, parseInt(rating));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId" || key === "rating") {
            whereCondition = whereCondition ? and9(whereCondition, eq10(table4[key], parseInt(value))) : eq10(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and9(whereCondition, eq10(table4[key], value)) : eq10(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc9(table4.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", area, region, rating } = req.query;
      let whereCondition = eq10(table4.userId, parseInt(userId));
      if (area) {
        whereCondition = and9(whereCondition, eq10(table4.area, area));
      }
      if (region) {
        whereCondition = and9(whereCondition, eq10(table4.region, region));
      }
      if (rating) {
        whereCondition = and9(whereCondition, eq10(table4.rating, parseInt(rating)));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc9(table4.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq10(table4.id, parseInt(id))).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/area/:area`, async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = "50", userId, region } = req.query;
      let whereCondition = eq10(table4.area, area);
      if (userId) {
        whereCondition = and9(whereCondition, eq10(table4.userId, parseInt(userId)));
      }
      if (region) {
        whereCondition = and9(whereCondition, eq10(table4.region, region));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc9(table4.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Area error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/region/:region`, async (req, res) => {
    try {
      const { region } = req.params;
      const { limit = "50", userId, area } = req.query;
      let whereCondition = eq10(table4.region, region);
      if (userId) {
        whereCondition = and9(whereCondition, eq10(table4.userId, parseInt(userId)));
      }
      if (area) {
        whereCondition = and9(whereCondition, eq10(table4.area, area));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc9(table4.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsRoutes(app2) {
  createAutoCRUD7(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating"
    // No auto fields or date fields needed
  });
  console.log("\u2705 Ratings GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/salesmanLeaveApplications.ts
import { eq as eq11, and as and10, desc as desc10, gte as gte6, lte as lte6 } from "drizzle-orm";
function createAutoCRUD8(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, leaveType, status, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          gte6(table4[dateField2], startDate),
          lte6(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table4.userId, parseInt(userId))) : eq11(table4.userId, parseInt(userId));
      }
      if (leaveType) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table4.leaveType, leaveType)) : eq11(table4.leaveType, leaveType);
      }
      if (status) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table4.status, status)) : eq11(table4.status, status);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and10(whereCondition, eq11(table4[key], parseInt(value))) : eq11(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and10(whereCondition, eq11(table4[key], value)) : eq11(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", status, leaveType } = req.query;
      let whereCondition = eq11(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          whereCondition,
          gte6(table4[dateField2], startDate),
          lte6(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and10(whereCondition, eq11(table4.status, status));
      }
      if (leaveType) {
        whereCondition = and10(whereCondition, eq11(table4.leaveType, leaveType));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq11(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, leaveType } = req.query;
      let whereCondition = eq11(table4.status, status);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          whereCondition,
          gte6(table4[dateField2], startDate),
          lte6(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and10(whereCondition, eq11(table4.userId, parseInt(userId)));
      }
      if (leaveType) {
        whereCondition = and10(whereCondition, eq11(table4.leaveType, leaveType));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsRoutes(app2) {
  createAutoCRUD8(app2, {
    endpoint: "leave-applications",
    table: salesmanLeaveApplications,
    schema: insertSalesmanLeaveApplicationSchema,
    tableName: "Leave Application",
    dateField: "startDate",
    autoFields: {
      status: () => "Pending"
      // default status
    }
  });
  console.log("\u2705 Salesman Leave Applications GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/salesOrder.ts
import { eq as eq12, and as and11, gte as gte7, lte as lte7, desc as desc11, asc as asc3, ilike as ilike4, sql as sql4 } from "drizzle-orm";
var numberish3 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : void 0;
};
var integerish = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : void 0;
};
function pickDateColumn(table4, key) {
  switch ((key || "").toLowerCase()) {
    case "deliverydate":
      return table4.deliveryDate;
    case "receivedpaymentdate":
      return table4.receivedPaymentDate;
    case "createdat":
      return table4.createdAt;
    default:
      return table4.orderDate;
  }
}
function createAutoCRUD9(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const dir = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "orderDate":
        return dir === "asc" ? asc3(table4.orderDate) : desc11(table4.orderDate);
      case "deliveryDate":
        return dir === "asc" ? asc3(table4.deliveryDate) : desc11(table4.deliveryDate);
      case "paymentAmount":
        return dir === "asc" ? asc3(table4.paymentAmount) : desc11(table4.paymentAmount);
      case "receivedPayment":
        return dir === "asc" ? asc3(table4.receivedPayment) : desc11(table4.receivedPayment);
      case "pendingPayment":
        return dir === "asc" ? asc3(table4.pendingPayment) : desc11(table4.pendingPayment);
      case "itemPrice":
        return dir === "asc" ? asc3(table4.itemPrice) : desc11(table4.itemPrice);
      case "orderQty":
        return dir === "asc" ? asc3(table4.orderQty) : desc11(table4.orderQty);
      // --- ✅ FIX ---
      case "status":
        return dir === "asc" ? asc3(table4.status) : desc11(table4.status);
      // --- END FIX ---
      case "createdAt":
        return dir === "asc" ? asc3(table4.createdAt) : desc11(table4.createdAt);
      default:
        return desc11(table4.createdAt);
    }
  };
  const buildWhere3 = (q) => {
    const conds = [];
    const uid = integerish(q.userId);
    if (uid !== void 0) conds.push(eq12(table4.userId, uid));
    if (q.dealerId) conds.push(eq12(table4.dealerId, String(q.dealerId)));
    if (q.dvrId) conds.push(eq12(table4.dvrId, String(q.dvrId)));
    if (q.pjpId) conds.push(eq12(table4.pjpId, String(q.pjpId)));
    if (q.orderUnit) conds.push(eq12(table4.orderUnit, String(q.orderUnit)));
    if (q.itemType) conds.push(eq12(table4.itemType, String(q.itemType)));
    if (q.itemGrade) conds.push(eq12(table4.itemGrade, String(q.itemGrade)));
    if (q.paymentMode) conds.push(eq12(table4.paymentMode, String(q.paymentMode)));
    if (q.status) {
      conds.push(eq12(table4.status, String(q.status)));
    }
    const col = pickDateColumn(table4, q.dateField);
    const dateFrom = q.dateFrom ? String(q.dateFrom) : void 0;
    const dateTo = q.dateTo ? String(q.dateTo) : void 0;
    if (dateFrom) conds.push(gte7(col, new Date(dateFrom)));
    if (dateTo) conds.push(lte7(col, new Date(dateTo)));
    const minQty = numberish3(q.minQty), maxQty = numberish3(q.maxQty);
    if (minQty !== void 0) conds.push(gte7(table4.orderQty, minQty));
    if (maxQty !== void 0) conds.push(lte7(table4.orderQty, maxQty));
    const minPay = numberish3(q.minPayment), maxPay = numberish3(q.maxPayment);
    if (minPay !== void 0) conds.push(gte7(table4.paymentAmount, minPay));
    if (maxPay !== void 0) conds.push(lte7(table4.paymentAmount, maxPay));
    const minRecv = numberish3(q.minReceived), maxRecv = numberish3(q.maxReceived);
    if (minRecv !== void 0) conds.push(gte7(table4.receivedPayment, minRecv));
    if (maxRecv !== void 0) conds.push(lte7(table4.receivedPayment, maxRecv));
    const minPending = numberish3(q.minPending), maxPending = numberish3(q.maxPending);
    if (minPending !== void 0) conds.push(gte7(table4.pendingPayment, minPending));
    if (maxPending !== void 0) conds.push(lte7(table4.pendingPayment, maxPending));
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql4`(${ilike4(table4.orderPartyName, s)}
          OR ${ilike4(table4.partyAddress, s)}
          OR ${ilike4(table4.deliveryAddress, s)})`
      );
    }
    const finalConds = conds.filter(Boolean);
    if (finalConds.length === 0) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and11(...finalConds);
  };
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCond = buildWhere3(filters);
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const uid = integerish(userId);
      if (uid === void 0) {
        return res.status(400).json({ success: false, error: "Invalid User ID" });
      }
      const base = eq12(table4.userId, uid);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and11(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq12(table4.dealerId, dealerId);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and11(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by Dealer error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq12(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}` });
    }
  });
}
function setupSalesOrdersRoutes(app2) {
  createAutoCRUD9(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order"
  });
  console.log("\u2705 Sales Orders GET endpoints (with status) ready");
}

// src/routes/dataFetchingRoutes/dvr.ts
import { and as and12, asc as asc4, desc as desc12, eq as eq13, ilike as ilike5, sql as sql5, gte as gte8, lte as lte8 } from "drizzle-orm";
var numberish4 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
var boolish3 = (v) => v === "true" || v === true ? true : v === "false" || v === false ? false : void 0;
function extractBrands2(q) {
  const raw = q.brand ?? q.brands ?? q.brandSelling ?? void 0;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).includes(",") ? String(raw).split(",").map((s) => s.trim()).filter(Boolean) : [String(raw).trim()].filter(Boolean);
  return arr;
}
function toPgArrayLiteral2(values) {
  return `{${values.map((v) => v.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}").trim()).join(",")}}`;
}
function createAutoCRUD10(app2, config) {
  const { endpoint, table: table4, tableName: tableName4, dateField: dateField2 = "reportDate" } = config;
  const SORT_WHITELIST = {
    reportDate: "reportDate",
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const key = sortByRaw && SORT_WHITELIST[sortByRaw] ? SORT_WHITELIST[sortByRaw] : dateField2;
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    const column = table4[key];
    return direction === "asc" ? asc4(column) : desc12(column);
  };
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.dealerId) {
      conds.push(eq13(table4.dealerId, String(q.dealerId)));
    }
    if (q.subDealerId) {
      conds.push(eq13(table4.subDealerId, String(q.subDealerId)));
    }
    const startDate = q.startDate;
    const endDate = q.endDate;
    if (startDate && endDate) {
      conds.push(and12(
        gte8(table4[dateField2], startDate),
        lte8(table4[dateField2], endDate)
      ));
    }
    const uid = numberish4(q.userId);
    if (uid !== void 0) conds.push(eq13(table4.userId, uid));
    if (q.dealerType) conds.push(eq13(table4.dealerType, String(q.dealerType)));
    if (q.visitType) conds.push(eq13(table4.visitType, String(q.visitType)));
    if (q.pjpId) conds.push(eq13(table4.pjpId, String(q.pjpId)));
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql5`(${ilike5(table4.location, s)} 
           OR ${ilike5(table4.contactPerson, s)}
           OR ${ilike5(table4.feedbacks, s)})`
      );
    }
    const brands2 = extractBrands2(q);
    if (brands2.length) {
      const arrLiteral = toPgArrayLiteral2(brands2);
      const anyBrand = boolish3(q.anyBrand);
      if (anyBrand) {
        conds.push(sql5`${table4.brandSelling} && ${arrLiteral}::text[]`);
      } else {
        conds.push(sql5`${table4.brandSelling} @> ${arrLiteral}::text[]`);
      }
    }
    const finalConds = conds.filter(Boolean);
    if (!finalConds.length) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and12(...finalConds);
  };
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCondition = buildWhere3(filters);
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq13(table4.userId, parseInt(userId, 10));
      const extra = buildWhere3(rest);
      const whereCond = extra ? and12(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq13(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}` });
    }
  });
  app2.get(`/api/${endpoint}/visit-type/:visitType`, async (req, res) => {
    try {
      const { visitType } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq13(table4.visitType, visitType);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and12(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/pjp/:pjpId`, async (req, res) => {
    try {
      const { pjpId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir, ...rest } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const base = eq13(table4.pjpId, pjpId);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and12(base, extra) : base;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCond) {
        q = q.where(whereCond);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
}
function setupDailyVisitReportsRoutes(app2) {
  createAutoCRUD10(app2, {
    endpoint: "daily-visit-reports",
    table: dailyVisitReports,
    tableName: "Daily Visit Report",
    dateField: "reportDate"
  });
  console.log("\u2705 DVR GET endpoints (using dealerId) ready");
}

// src/routes/dataFetchingRoutes/salesmanAttendance.ts
import { eq as eq14, and as and13, desc as desc13, gte as gte9, lte as lte9 } from "drizzle-orm";
function createAutoCRUD11(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and13(
          gte9(table4[dateField2], startDate),
          lte9(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table4.userId, parseInt(userId))) : eq14(table4.userId, parseInt(userId));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and13(whereCondition, eq14(table4[key], parseInt(value))) : eq14(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and13(whereCondition, eq14(table4[key], value)) : eq14(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc13(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50" } = req.query;
      let whereCondition = eq14(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and13(
          whereCondition,
          gte9(table4[dateField2], startDate),
          lte9(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc13(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq14(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId/today`, async (req, res) => {
    try {
      const { userId } = req.params;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const [record] = await db.select().from(table4).where(
        and13(
          eq14(table4.userId, parseInt(userId)),
          eq14(table4.attendanceDate, today)
        )
      ).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `No attendance record found for today`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get today's ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch today's ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanAttendanceRoutes(app2) {
  createAutoCRUD11(app2, {
    endpoint: "attendance",
    table: salesmanAttendance,
    schema: insertSalesmanAttendanceSchema,
    tableName: "Attendance",
    dateField: "attendanceDate",
    autoFields: {
      attendanceDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Salesman Attendance GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/tvr.ts
import { eq as eq15, and as and14, desc as desc14, gte as gte10, lte as lte10, asc as asc5 } from "drizzle-orm";
var table = technicalVisitReports;
var tableName = "Technical Visit Report";
var dateField = "reportDate";
var numberish5 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
function buildWhere(q) {
  const conds = [];
  const { startDate, endDate } = q;
  if (startDate && endDate) {
    conds.push(and14(
      gte10(table[dateField], String(startDate)),
      lte10(table[dateField], String(endDate))
    ));
  }
  if (q.visitType) {
    conds.push(eq15(table.visitType, String(q.visitType)));
  }
  if (q.serviceType) {
    conds.push(eq15(table.serviceType, String(q.serviceType)));
  }
  if (q.pjpId) {
    conds.push(eq15(table.pjpId, String(q.pjpId)));
  }
  if (q.meetingId) {
    conds.push(eq15(table.meetingId, String(q.meetingId)));
  }
  if (q.isVerificationStatus) {
    conds.push(eq15(table.isVerificationStatus, String(q.isVerificationStatus)));
  }
  if (q.siteVisitType) {
    conds.push(eq15(table.siteVisitType, String(q.siteVisitType)));
  }
  const uid = numberish5(q.userId);
  if (uid !== void 0) {
    conds.push(eq15(table.userId, uid));
  }
  const finalConds = conds.filter(Boolean);
  if (finalConds.length === 0) return void 0;
  return and14(...finalConds);
}
function buildSort(sortByRaw, sortDirRaw) {
  const sortKey = sortByRaw === "createdAt" ? "createdAt" : dateField;
  const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
  if (sortKey === "reportDate" || sortKey === "createdAt") {
    return direction === "asc" ? asc5(table[sortKey]) : desc14(table[sortKey]);
  }
  return desc14(table[dateField]);
}
function setupTechnicalVisitReportsRoutes(app2) {
  const endpoint = "technical-visit-reports";
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCondition = buildWhere(req.query);
      const orderExpr = buildSort(String(sortBy), String(sortDir));
      let q = db.select().from(table);
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const filters = buildWhere(req.query);
      const uid = numberish5(userId);
      if (uid === void 0) {
        return res.status(400).json({ success: false, error: "Invalid User ID" });
      }
      const userCond = eq15(table.userId, uid);
      const whereCondition = filters ? and14(userCond, filters) : userCond;
      const orderExpr = buildSort(String(sortBy), String(sortDir));
      let q = db.select().from(table);
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq15(table.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}` });
    }
  });
  app2.get(`/api/${endpoint}/visit-type/:visitType`, async (req, res) => {
    try {
      const { visitType } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const filters = buildWhere(req.query);
      const visitCond = eq15(table.visitType, visitType);
      const whereCondition = filters ? and14(visitCond, filters) : visitCond;
      const orderExpr = buildSort(String(sortBy), String(sortDir));
      let q = db.select().from(table);
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });
  app2.get(`/api/${endpoint}/pjp/:pjpId`, async (req, res) => {
    try {
      const { pjpId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const filters = buildWhere(req.query);
      const pjpCond = eq15(table.pjpId, pjpId);
      const whereCondition = filters ? and14(pjpCond, filters) : pjpCond;
      const orderExpr = buildSort(String(sortBy), String(sortDir));
      let q = db.select().from(table);
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName}s` });
    }
  });
  console.log("\u2705 Technical Visit Reports GET endpoints setup complete (Refactored)");
}

// src/routes/dataFetchingRoutes/tsoMeetings.ts
import { eq as eq16, and as and15, desc as desc15, gte as gte11, lte as lte11, asc as asc6 } from "drizzle-orm";
var table2 = tsoMeetings;
var tableName2 = "TSO Meeting";
var numberish6 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
function buildWhere2(q) {
  const conds = [];
  const { startDate, endDate, type } = q;
  if (startDate && endDate) {
    conds.push(and15(
      gte11(table2.date, String(startDate)),
      lte11(table2.date, String(endDate))
    ));
  }
  if (type) {
    conds.push(eq16(table2.type, String(type)));
  }
  const uid = numberish6(q.createdByUserId);
  if (uid !== void 0) {
    conds.push(eq16(table2.createdByUserId, uid));
  }
  const finalConds = conds.filter(Boolean);
  if (finalConds.length === 0) return void 0;
  return and15(...finalConds);
}
function buildSort2(sortByRaw, sortDirRaw) {
  const sortKey = sortByRaw === "createdAt" ? "createdAt" : "date";
  const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
  return direction === "asc" ? asc6(table2[sortKey]) : desc15(table2[sortKey]);
}
function setupTsoMeetingsGetRoutes(app2) {
  const endpoint = "tso-meetings";
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCondition = buildWhere2(req.query);
      const orderExpr = buildSort2(String(sortBy), String(sortDir));
      let q = db.select().from(table2);
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName2}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName2}s` });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table2).where(eq16(table2.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: `${tableName2} not found` });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName2} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName2}` });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", page = "1", sortBy, sortDir } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const filters = buildWhere2(req.query);
      const uid = numberish6(userId);
      if (uid === void 0) {
        return res.status(400).json({ success: false, error: "Invalid User ID" });
      }
      const userCond = eq16(table2.createdByUserId, uid);
      const whereCondition = filters ? and15(userCond, filters) : userCond;
      const orderExpr = buildSort2(String(sortBy), String(sortDir));
      let q = db.select().from(table2);
      q = q.where(whereCondition);
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName2}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName2}s` });
    }
  });
  console.log("\u2705 TSO Meetings GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/masonOnMeeting.ts
import { eq as eq17, and as and16, desc as desc16, asc as asc7 } from "drizzle-orm";
function setupMasonsOnMeetingsGetRoutes(app2) {
  app2.get("/api/masons-on-meetings", async (req, res) => {
    try {
      const { masonId, meetingId, limit = "50", sortBy = "attendedAt", sortDir = "desc" } = req.query;
      let whereCondition = void 0;
      if (masonId) {
        whereCondition = eq17(masonsOnMeetings.masonId, masonId);
      }
      if (meetingId) {
        whereCondition = whereCondition ? and16(whereCondition, eq17(masonsOnMeetings.meetingId, meetingId)) : eq17(masonsOnMeetings.meetingId, meetingId);
      }
      const orderField = sortBy === "attendedAt" ? masonsOnMeetings.attendedAt : masonsOnMeetings.attendedAt;
      const orderDirection = sortDir.toLowerCase() === "asc" ? asc7 : desc16;
      let query = db.select().from(masonsOnMeetings).leftJoin(masonPcSide, eq17(masonsOnMeetings.masonId, masonPcSide.id)).leftJoin(tsoMeetings, eq17(masonsOnMeetings.meetingId, tsoMeetings.id)).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(orderDirection(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get MasonsOnMeetings error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch MasonsOnMeetings`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/masons-on-meetings/mason/:masonId", async (req, res) => {
    try {
      const { masonId } = req.params;
      const { limit = "50", sortBy = "attendedAt", sortDir = "desc" } = req.query;
      if (!masonId) {
        return res.status(400).json({ success: false, error: "Mason ID is required." });
      }
      const orderField = masonsOnMeetings.attendedAt;
      const orderDirection = sortDir.toLowerCase() === "asc" ? asc7 : desc16;
      const records = await db.select().from(masonsOnMeetings).leftJoin(tsoMeetings, eq17(masonsOnMeetings.meetingId, tsoMeetings.id)).where(eq17(masonsOnMeetings.masonId, masonId)).orderBy(orderDirection(orderField)).limit(parseInt(limit));
      res.json({
        success: true,
        data: records.map((r) => ({ ...r.masons_on_meetings, meeting: r.tso_meetings }))
      });
    } catch (error) {
      console.error(`Get MasonsOnMeetings by Mason ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch meetings for mason`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/masons-on-meetings/meeting/:meetingId", async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { limit = "50", sortBy = "attendedAt", sortDir = "desc" } = req.query;
      if (!meetingId) {
        return res.status(400).json({ success: false, error: "Meeting ID is required." });
      }
      const orderField = masonsOnMeetings.attendedAt;
      const orderDirection = sortDir.toLowerCase() === "asc" ? asc7 : desc16;
      const records = await db.select().from(masonsOnMeetings).leftJoin(masonPcSide, eq17(masonsOnMeetings.masonId, masonPcSide.id)).where(eq17(masonsOnMeetings.meetingId, meetingId)).orderBy(orderDirection(orderField)).limit(parseInt(limit));
      res.json({
        success: true,
        data: records.map((r) => ({ ...r.masons_on_meetings, mason: r.mason_pc_side }))
      });
    } catch (error) {
      console.error(`Get MasonsOnMeetings by Meeting ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch masons for meeting`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Masons On Meetings GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/masonOnScheme.ts
import { eq as eq18, and as and17, desc as desc17, asc as asc8 } from "drizzle-orm";
function setupMasonsOnSchemeGetRoutes(app2) {
  app2.get("/api/masons-on-scheme", async (req, res) => {
    try {
      const { masonId, schemeId, status, limit = "50", sortBy = "enrolledAt", sortDir = "desc" } = req.query;
      let whereCondition = void 0;
      if (masonId) {
        whereCondition = eq18(masonOnScheme.masonId, masonId);
      }
      if (schemeId) {
        whereCondition = whereCondition ? and17(whereCondition, eq18(masonOnScheme.schemeId, schemeId)) : eq18(masonOnScheme.schemeId, schemeId);
      }
      if (status) {
        whereCondition = whereCondition ? and17(whereCondition, eq18(masonOnScheme.status, status)) : eq18(masonOnScheme.status, status);
      }
      const orderField = sortBy === "enrolledAt" ? masonOnScheme.enrolledAt : masonOnScheme.enrolledAt;
      const orderDirection = sortDir.toLowerCase() === "asc" ? asc8 : desc17;
      let query = db.select().from(masonOnScheme).leftJoin(masonPcSide, eq18(masonOnScheme.masonId, masonPcSide.id)).leftJoin(schemesOffers, eq18(masonOnScheme.schemeId, schemesOffers.id)).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(orderDirection(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get MasonsOnScheme error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch MasonsOnScheme`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/masons-on-scheme/mason/:masonId", async (req, res) => {
    try {
      const { masonId } = req.params;
      const { status, limit = "50", sortBy = "enrolledAt", sortDir = "desc" } = req.query;
      if (!masonId) {
        return res.status(400).json({ success: false, error: "Mason ID is required." });
      }
      let whereCondition = eq18(masonOnScheme.masonId, masonId);
      if (status) {
        whereCondition = and17(whereCondition, eq18(masonOnScheme.status, status));
      }
      const orderField = masonOnScheme.enrolledAt;
      const orderDirection = sortDir.toLowerCase() === "asc" ? asc8 : desc17;
      const records = await db.select().from(masonOnScheme).leftJoin(schemesOffers, eq18(masonOnScheme.schemeId, schemesOffers.id)).where(whereCondition).orderBy(orderDirection(orderField)).limit(parseInt(limit));
      res.json({
        success: true,
        data: records.map((r) => ({ ...r.mason_on_scheme, scheme: r.schemes_offers }))
      });
    } catch (error) {
      console.error(`Get MasonsOnScheme by Mason ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch schemes for mason`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/masons-on-scheme/scheme/:schemeId", async (req, res) => {
    try {
      const { schemeId } = req.params;
      const { status, limit = "50", sortBy = "enrolledAt", sortDir = "desc" } = req.query;
      if (!schemeId) {
        return res.status(400).json({ success: false, error: "Scheme ID is required." });
      }
      let whereCondition = eq18(masonOnScheme.schemeId, schemeId);
      if (status) {
        whereCondition = and17(whereCondition, eq18(masonOnScheme.status, status));
      }
      const orderField = masonOnScheme.enrolledAt;
      const orderDirection = sortDir.toLowerCase() === "asc" ? asc8 : desc17;
      const records = await db.select().from(masonOnScheme).leftJoin(masonPcSide, eq18(masonOnScheme.masonId, masonPcSide.id)).where(whereCondition).orderBy(orderDirection(orderField)).limit(parseInt(limit));
      res.json({
        success: true,
        data: records.map((r) => ({ ...r.mason_on_scheme, mason: r.mason_pc_side }))
      });
    } catch (error) {
      console.error(`Get MasonsOnScheme by Scheme ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch masons for scheme`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Masons On Scheme GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/masonpcSide.ts
import { eq as eq19, and as and18, desc as desc18, asc as asc9, ilike as ilike6, sql as sql6, getTableColumns } from "drizzle-orm";
var numberish7 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
var boolish4 = (v) => {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return void 0;
};
function createAutoCRUD12(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  const buildWhere3 = (q) => {
    const conds = [];
    const { userId, dealerId, kycStatus, isReferred, search } = q;
    if (userId) {
      const uid = numberish7(userId);
      if (uid !== void 0) conds.push(eq19(table4.userId, uid));
    }
    if (dealerId) {
      conds.push(eq19(table4.dealerId, String(dealerId)));
    }
    if (kycStatus) {
      conds.push(eq19(table4.kycStatus, String(kycStatus)));
    }
    const referred = boolish4(isReferred);
    if (referred !== void 0) {
      conds.push(eq19(table4.isReferred, referred));
    }
    if (search) {
      const s = `%${String(search).trim()}%`;
      conds.push(
        sql6`(${ilike6(table4.name, s)} 
          OR ${ilike6(table4.phoneNumber, s)} 
          OR ${ilike6(table4.kycDocumentIdNum, s)})`
      );
    }
    const finalConds = conds.filter(Boolean);
    if (finalConds.length === 0) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and18(...finalConds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "name":
        return direction === "asc" ? asc9(table4.name) : desc18(table4.name);
      case "pointsBalance":
        return direction === "asc" ? asc9(table4.pointsBalance) : desc18(table4.pointsBalance);
      case "bagsLifted":
        return direction === "asc" ? asc9(table4.bagsLifted) : desc18(table4.bagsLifted);
      case "kycStatus":
        return direction === "asc" ? asc9(table4.kycStatus) : desc18(table4.kycStatus);
      default:
        return asc9(table4.name);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const whereCondition = baseWhere ? extra ? and18(baseWhere, extra) : baseWhere : extra;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select({
        // Select all columns from masonPcSide
        ...getTableColumns(table4),
        // And add joined names
        dealerName: dealers.name,
        userName: sql6`${users.firstName} || ' ' || ${users.lastName}`
      }).from(table4).leftJoin(dealers, eq19(table4.dealerId, dealers.id)).leftJoin(users, eq19(table4.userId, users.id)).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  app2.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
        ...getTableColumns(table4),
        dealerName: dealers.name,
        userName: sql6`${users.firstName} || ' ' || ${users.lastName}`
      }).from(table4).leftJoin(dealers, eq19(table4.dealerId, dealers.id)).leftJoin(users, eq19(table4.userId, users.id)).where(eq19(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, (req, res) => {
    const uid = numberish7(req.params.userId);
    if (uid === void 0) {
      return res.status(400).json({ success: false, error: "Invalid User ID" });
    }
    const base = eq19(table4.userId, uid);
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, (req, res) => {
    const { dealerId } = req.params;
    if (!dealerId) {
      return res.status(400).json({ success: false, error: "Invalid Dealer ID" });
    }
    const base = eq19(table4.dealerId, dealerId);
    return listHandler(req, res, base);
  });
}
function setupMasonsPcSideRoutes(app2) {
  createAutoCRUD12(app2, {
    endpoint: "masons",
    // API will be /api/masons
    table: masonPcSide,
    tableName: "Mason"
  });
  console.log("\u2705 Masons (PC Side) GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/schemesOffers.ts
import { eq as eq20, and as and19, desc as desc19, asc as asc10, ilike as ilike7, sql as sql7, gte as gte12, lte as lte12, or as or3, isNull, lt, getTableColumns as getTableColumns2 } from "drizzle-orm";
var boolish5 = (v) => {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return void 0;
};
function setupSchemesOffersRoutes(app2) {
  const endpoint = "schemes";
  const table4 = schemesOffers;
  const tableName4 = "Scheme/Offer";
  const buildWhere3 = (q) => {
    const conds = [];
    const { search, activeNow } = q;
    if (search) {
      const s = `%${String(search).trim()}%`;
      conds.push(
        sql7`(${ilike7(table4.name, s)} OR ${ilike7(table4.description, s)})`
      );
    }
    const isActive = boolish5(activeNow);
    if (isActive !== void 0) {
      const now = /* @__PURE__ */ new Date();
      if (isActive === true) {
        conds.push(
          and19(
            lte12(table4.startDate, now),
            or3(
              gte12(table4.endDate, now),
              isNull(table4.endDate)
            )
          )
        );
      } else {
        conds.push(lt(table4.endDate, now));
      }
    }
    const finalConds = conds.filter(Boolean);
    if (finalConds.length === 0) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and19(...finalConds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "name":
        return direction === "asc" ? asc10(table4.name) : desc19(table4.name);
      case "startDate":
        return direction === "asc" ? asc10(table4.startDate) : desc19(table4.startDate);
      case "endDate":
        return direction === "asc" ? asc10(table4.endDate) : desc19(table4.endDate);
      case "participantCount":
        return direction === "asc" ? asc10(sql7`"participantCount"`) : desc19(sql7`"participantCount"`);
      default:
        return desc19(table4.startDate);
    }
  };
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCondition = buildWhere3(filters);
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      const participantCountSubquery = db.select({
        schemeId: masonOnScheme.schemeId,
        count: sql7`count(*)::int`.as("participantCount")
      }).from(masonOnScheme).groupBy(masonOnScheme.schemeId).as("counts");
      let q = db.select({
        // Select all columns from schemesOffers
        ...getTableColumns2(table4),
        // Select the count from the subquery
        participantCount: participantCountSubquery.count
      }).from(table4).leftJoin(participantCountSubquery, eq20(table4.id, participantCountSubquery.schemeId)).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      const result = data.map((r) => {
        return { ...r, participantCount: r.participantCount || 0 };
      });
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data: result });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const schemeQuery = db.select().from(table4).where(eq20(table4.id, id)).limit(1);
      const participantsQuery = db.select().from(masonOnScheme).leftJoin(masonPcSide, eq20(masonOnScheme.masonId, masonPcSide.id)).where(eq20(masonOnScheme.schemeId, id)).orderBy(asc10(masonPcSide.name));
      const [schemeResult, participantsResult] = await Promise.all([
        schemeQuery,
        participantsQuery
      ]);
      const [scheme] = schemeResult;
      if (!scheme) {
        return res.status(404).json({ success: false, error: `${tableName4} not found` });
      }
      const participants = participantsResult.map((r) => {
        return { ...r.mason_on_scheme, mason: r.mason_pc_side };
      });
      res.json({
        success: true,
        data: {
          ...scheme,
          participants
        }
      });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Schemes & Offers GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/bagsLift.ts
import { eq as eq21, and as and20, desc as desc20, asc as asc11, gte as gte13, lte as lte13, getTableColumns as getTableColumns3, sql as sql8 } from "drizzle-orm";
function setupBagLiftsGetRoutes(app2) {
  const numberish9 = (v) => {
    if (v === null || v === void 0 || v === "") return void 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : void 0;
  };
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.masonId) {
      conds.push(eq21(bagLifts.masonId, String(q.masonId)));
    }
    if (q.dealerId) {
      conds.push(eq21(bagLifts.dealerId, String(q.dealerId)));
    }
    if (q.status) {
      conds.push(eq21(bagLifts.status, String(q.status)));
    }
    const approvedBy = numberish9(q.approvedBy);
    if (approvedBy !== void 0) {
      conds.push(eq21(bagLifts.approvedBy, approvedBy));
    }
    const startDate = q.startDate;
    const endDate = q.endDate;
    const dateColumn = q.dateField === "createdAt" ? bagLifts.createdAt : bagLifts.purchaseDate;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        conds.push(gte13(dateColumn, start));
        conds.push(lte13(dateColumn, end));
      } else {
        console.warn("Invalid startDate or endDate provided for bagLifts filter.");
      }
    }
    if (conds.length === 0) return void 0;
    return conds.length === 1 ? conds[0] : and20(...conds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "bagCount":
        return direction === "asc" ? asc11(bagLifts.bagCount) : desc20(bagLifts.bagCount);
      case "pointsCredited":
        return direction === "asc" ? asc11(bagLifts.pointsCredited) : desc20(bagLifts.pointsCredited);
      case "status":
        return direction === "asc" ? asc11(bagLifts.status) : desc20(bagLifts.status);
      case "purchaseDate":
        return direction === "asc" ? asc11(bagLifts.purchaseDate) : desc20(bagLifts.purchaseDate);
      case "createdAt":
      default:
        return desc20(bagLifts.createdAt);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const conds = [];
      if (baseWhere) conds.push(baseWhere);
      if (extra) conds.push(extra);
      const whereCondition = conds.length > 0 ? and20(...conds) : void 0;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let query = db.select({
        // Select all columns from bagLifts
        ...getTableColumns3(bagLifts),
        // Add joined data
        masonName: masonPcSide.name,
        dealerName: dealers.name,
        approverName: sql8`${users.firstName} || ' ' || ${users.lastName}`
      }).from(bagLifts).leftJoin(masonPcSide, eq21(bagLifts.masonId, masonPcSide.id)).leftJoin(dealers, eq21(bagLifts.dealerId, dealers.id)).leftJoin(users, eq21(bagLifts.approvedBy, users.id)).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get Bag Lifts list error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch bag lift entries`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  app2.get("/api/bag-lifts", (req, res) => listHandler(req, res));
  app2.get("/api/bag-lifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
        ...getTableColumns3(bagLifts),
        masonName: masonPcSide.name,
        dealerName: dealers.name,
        approverName: sql8`${users.firstName} || ' ' || ${users.lastName}`
      }).from(bagLifts).leftJoin(masonPcSide, eq21(bagLifts.masonId, masonPcSide.id)).leftJoin(dealers, eq21(bagLifts.dealerId, dealers.id)).leftJoin(users, eq21(bagLifts.approvedBy, users.id)).where(eq21(bagLifts.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: "Bag Lift entry not found" });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get Bag Lift by ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch bag lift entry`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/bag-lifts/mason/:masonId", (req, res) => {
    const { masonId } = req.params;
    if (!masonId) {
      return res.status(400).json({ success: false, error: "Mason ID is required." });
    }
    const base = eq21(bagLifts.masonId, masonId);
    return listHandler(req, res, base);
  });
  app2.get("/api/bag-lifts/dealer/:dealerId", (req, res) => {
    const { dealerId } = req.params;
    if (!dealerId) {
      return res.status(400).json({ success: false, error: "Dealer ID is required." });
    }
    const base = eq21(bagLifts.dealerId, dealerId);
    return listHandler(req, res, base);
  });
  console.log("\u2705 Bag Lifts GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/pointsLedger.ts
import { eq as eq23, and as and21, desc as desc21, asc as asc12, gte as gte14, lte as lte14, getTableColumns as getTableColumns4 } from "drizzle-orm";

// src/middleware/tsoAuth.ts
import { eq as eq22 } from "drizzle-orm";
async function tsoAuth(req, res, next) {
  if (!req.auth || !req.auth.sub) {
    return res.status(401).json({ success: false, error: "Authentication details missing. Please log in." });
  }
  const userId = parseInt(req.auth.sub, 10);
  const userRole = req.auth.role;
  try {
    const [userRecord] = await db.select({ isTechnicalRole: users.isTechnicalRole }).from(users).where(eq22(users.id, userId)).limit(1);
    if (!userRecord) {
      return res.status(404).json({ success: false, error: "User not found in database." });
    }
    const isAuthorized = userRecord.isTechnicalRole === true;
    if (isAuthorized) {
      next();
    } else {
      console.warn(`Unauthorized Access: User ID ${userId} (Role: ${userRole}) attempted restricted route.`);
      return res.status(403).json({
        success: false,
        error: "Forbidden: You are not authorized to perform administrative actions."
      });
    }
  } catch (error) {
    console.error("Database error during TSO authorization check:", error);
    return res.status(500).json({ success: false, error: "Internal server error during authorization." });
  }
}

// src/routes/dataFetchingRoutes/pointsLedger.ts
function setupPointsLedgerGetRoutes(app2) {
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.masonId) {
      conds.push(eq23(pointsLedger.masonId, String(q.masonId)));
    }
    if (q.sourceType) {
      conds.push(eq23(pointsLedger.sourceType, String(q.sourceType)));
    }
    if (q.sourceId) {
      conds.push(eq23(pointsLedger.sourceId, String(q.sourceId)));
    }
    if (q.siteId) {
      console.warn("Filtering by siteId requires the siteId column to be added to the pointsLedger schema.");
    }
    const startDate = q.startDate;
    const endDate = q.endDate;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        conds.push(gte14(pointsLedger.createdAt, start));
        conds.push(lte14(pointsLedger.createdAt, end));
      } else {
        console.warn("Invalid startDate or endDate provided for pointsLedger filter.");
      }
    }
    if (conds.length === 0) return void 0;
    return conds.length === 1 ? conds[0] : and21(...conds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "createdAt":
        return direction === "asc" ? asc12(pointsLedger.createdAt) : desc21(pointsLedger.createdAt);
      case "points":
        return direction === "asc" ? asc12(pointsLedger.points) : desc21(pointsLedger.points);
      case "sourceType":
        return direction === "asc" ? asc12(pointsLedger.sourceType) : desc21(pointsLedger.sourceType);
      default:
        return desc21(pointsLedger.createdAt);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const conds = [];
      if (baseWhere) conds.push(baseWhere);
      if (extra) conds.push(extra);
      const whereCondition = conds.length > 0 ? and21(...conds) : void 0;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let query = db.select({
        // Select all columns from pointsLedger
        ...getTableColumns4(pointsLedger),
        // Add denormalized mason name
        masonName: masonPcSide.name,
        // Add mason phone number (useful for verification)
        masonPhone: masonPcSide.phoneNumber
      }).from(pointsLedger).leftJoin(masonPcSide, eq23(pointsLedger.masonId, masonPcSide.id)).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get Points Ledger list error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch points ledger entries`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  app2.get("/api/points-ledger", tsoAuth, (req, res) => listHandler(req, res));
  app2.get("/api/points-ledger/:id", tsoAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
        ...getTableColumns4(pointsLedger),
        masonName: masonPcSide.name,
        masonPhone: masonPcSide.phoneNumber
      }).from(pointsLedger).leftJoin(masonPcSide, eq23(pointsLedger.masonId, masonPcSide.id)).where(eq23(pointsLedger.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: "Points Ledger entry not found" });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get Points Ledger by ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch points ledger entry`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/points-ledger/mason/:masonId", tsoAuth, (req, res) => {
    const { masonId } = req.params;
    if (!masonId) {
      return res.status(400).json({ success: false, error: "Mason ID is required." });
    }
    const base = eq23(pointsLedger.masonId, masonId);
    return listHandler(req, res, base);
  });
  app2.get("/api/points-ledger/source/:sourceId", tsoAuth, (req, res) => {
    const { sourceId } = req.params;
    if (!sourceId) {
      return res.status(400).json({ success: false, error: "Source ID is required." });
    }
    const base = eq23(pointsLedger.sourceId, sourceId);
    return listHandler(req, res, base);
  });
  console.log("\u2705 Points Ledger GET endpoints setup complete (All routes protected by tsoAuth and now include Mason details)");
}

// src/routes/dataFetchingRoutes/rewardCategories.ts
import { eq as eq24, and as and22, desc as desc22, asc as asc13, ilike as ilike8 } from "drizzle-orm";
function setupRewardCategoriesGetRoutes(app2) {
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(ilike8(rewardCategories.name, s));
    }
    if (conds.length === 0) return void 0;
    return conds.length === 1 ? conds[0] : and22(...conds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "name":
        return direction === "asc" ? asc13(rewardCategories.name) : desc22(rewardCategories.name);
      case "id":
        return direction === "asc" ? asc13(rewardCategories.id) : desc22(rewardCategories.id);
      default:
        return asc13(rewardCategories.name);
    }
  };
  app2.get("/api/reward-categories", async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCondition = buildWhere3(filters);
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let query = db.select().from(rewardCategories).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get Reward Categories error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch reward categories`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/reward-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid Category ID." });
      }
      const [record] = await db.select().from(rewardCategories).where(eq24(rewardCategories.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: "Reward Category not found" });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get Reward Category by ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch reward category`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Reward Categories GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/rewards.ts
import { eq as eq25, and as and23, desc as desc23, asc as asc14, ilike as ilike9, getTableColumns as getTableColumns5 } from "drizzle-orm";
function setupRewardsGetRoutes(app2) {
  const endpoint = "rewards";
  const tableName4 = "Reward";
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(ilike9(rewards.itemName, s));
    }
    if (q.categoryId) {
      const id = parseInt(q.categoryId, 10);
      if (!isNaN(id)) conds.push(eq25(rewards.categoryId, id));
    }
    if (q.isActive === "true" || q.isActive === true) {
      conds.push(eq25(rewards.isActive, true));
    } else if (q.isActive === "false" || q.isActive === false) {
      conds.push(eq25(rewards.isActive, false));
    }
    if (conds.length === 0) return void 0;
    return conds.length === 1 ? conds[0] : and23(...conds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "pointCost":
        return direction === "asc" ? asc14(rewards.pointCost) : desc23(rewards.pointCost);
      case "stock":
        return direction === "asc" ? asc14(rewards.stock) : desc23(rewards.stock);
      case "itemName":
      default:
        return asc14(rewards.itemName);
    }
  };
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const whereCondition = buildWhere3(filters);
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let query = db.select({
        ...getTableColumns5(rewards),
        categoryName: rewardCategories.name
      }).from(rewards).leftJoin(rewardCategories, eq25(rewards.categoryId, rewardCategories.id)).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);
      const result = data;
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data: result });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}s` });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid Reward ID." });
      const [record] = await db.select({
        ...getTableColumns5(rewards),
        categoryName: rewardCategories.name
      }).from(rewards).leftJoin(rewardCategories, eq25(rewards.categoryId, rewardCategories.id)).where(eq25(rewards.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: "Reward not found" });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} by ID error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}` });
    }
  });
  console.log("\u2705 Rewards GET endpoints (Catalogue) setup complete");
}

// src/routes/dataFetchingRoutes/rewardsRedemption.ts
import { eq as eq26, and as and24, desc as desc24, asc as asc15, getTableColumns as getTableColumns6, sql as sql9 } from "drizzle-orm";
function setupRewardsRedemptionGetRoutes(app2) {
  const endpoint = "rewards-redemption";
  const table4 = rewardRedemptions;
  const tableName4 = "Reward Redemption";
  const numberish9 = (v) => {
    if (v === null || v === void 0 || v === "") return void 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : void 0;
  };
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.masonId) {
      conds.push(eq26(table4.masonId, String(q.masonId)));
    }
    const rewardId = numberish9(q.rewardId);
    if (rewardId !== void 0) {
      conds.push(eq26(table4.rewardId, rewardId));
    }
    if (q.status) {
      conds.push(eq26(table4.status, String(q.status)));
    }
    const minPoints = numberish9(q.minPoints);
    if (minPoints !== void 0) conds.push(sql9`${table4.pointsDebited} >= ${minPoints}`);
    if (conds.length === 0) return void 0;
    return conds.length === 1 ? conds[0] : and24(...conds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "pointsDebited":
        return direction === "asc" ? asc15(table4.pointsDebited) : desc24(table4.pointsDebited);
      case "status":
        return direction === "asc" ? asc15(table4.status) : desc24(table4.status);
      case "rewardId":
        return direction === "asc" ? asc15(table4.rewardId) : desc24(table4.rewardId);
      case "createdAt":
      default:
        return desc24(table4.createdAt);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const conds = [];
      if (baseWhere) conds.push(baseWhere);
      if (extra) conds.push(extra);
      const whereCondition = conds.length > 0 ? and24(...conds) : void 0;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let query = db.select({
        ...getTableColumns6(table4),
        masonName: masonPcSide.name,
        rewardName: rewards.itemName
      }).from(table4).leftJoin(masonPcSide, eq26(table4.masonId, masonPcSide.id)).leftJoin(rewards, eq26(table4.rewardId, rewards.id)).$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const data = await query.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4} list error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4} entries` });
    }
  };
  app2.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
        ...getTableColumns6(table4),
        masonName: masonPcSide.name,
        rewardName: rewards.itemName
      }).from(table4).leftJoin(masonPcSide, eq26(table4.masonId, masonPcSide.id)).leftJoin(rewards, eq26(table4.rewardId, rewards.id)).where(eq26(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({ success: false, error: `${tableName4} entry not found` });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} by ID error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4} entry` });
    }
  });
  app2.get(`/api/${endpoint}/mason/:masonId`, (req, res) => {
    const { masonId } = req.params;
    if (!masonId) {
      return res.status(400).json({ success: false, error: "Mason ID is required." });
    }
    const base = eq26(table4.masonId, masonId);
    return listHandler(req, res, base);
  });
  console.log("\u2705 Reward Redemptions GET endpoints (Order History) setup complete");
}

// src/routes/dataFetchingRoutes/kycSubmissions.ts
import { eq as eq27, and as and25, desc as desc25 } from "drizzle-orm";
function toJsonSafe4(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (_, value) => typeof value === "bigint" ? Number(value) : value
  ));
}
function createAutoCRUD13(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", status, masonId, ...filters } = req.query;
      let whereCondition = void 0;
      if (status) {
        const condition = eq27(table4.status, status);
        whereCondition = whereCondition ? and25(whereCondition, condition) : condition;
      }
      if (masonId) {
        const condition = eq27(table4.masonId, masonId);
        whereCondition = whereCondition ? and25(whereCondition, condition) : condition;
      }
      Object.entries(filters).forEach(([key, value]) => {
        const column = table4[key];
        if (value && column && typeof column !== "function") {
          const drizzleColumn = column;
          const condition = eq27(drizzleColumn, value);
          whereCondition = whereCondition ? and25(whereCondition, condition) : condition;
        }
      });
      let query = db.select().from(table4);
      const records = await query.where(whereCondition).orderBy(desc25(table4.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe4(records) });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq27(table4.id, id)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      res.json({ success: true, data: toJsonSafe4(record) });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/mason/:masonId`, async (req, res) => {
    try {
      const { masonId } = req.params;
      const { limit = "50", status } = req.query;
      const conditions = [
        eq27(table4.masonId, masonId)
        // Mandatory filter
      ];
      if (status) {
        conditions.push(eq27(table4.status, status));
      }
      const whereCondition = and25(...conditions.filter((c) => c !== void 0 && c !== null));
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc25(table4.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe4(records) });
    } catch (error) {
      console.error(`Get ${tableName4}s by Mason ID error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { limit = "50", masonId } = req.query;
      const conditions = [
        eq27(table4.status, status)
        // Mandatory filter
      ];
      if (masonId) {
        conditions.push(eq27(table4.masonId, masonId));
      }
      const whereCondition = and25(...conditions.filter((c) => c !== void 0 && c !== null));
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc25(table4.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe4(records) });
    } catch (error) {
      console.error(`Get ${tableName4}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupKycSubmissionsRoutes(app2) {
  createAutoCRUD13(app2, {
    endpoint: "kyc-submissions",
    table: kycSubmissions,
    schema: insertKycSubmissionSchema,
    // Placeholder, assuming it exists
    tableName: "KYC Submission"
  });
  console.log("\u2705 KYC Submissions GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/technicalSites.ts
import { eq as eq28, and as and26, desc as desc26, asc as asc16, ilike as ilike10, sql as sql10, gte as gte15, lte as lte15 } from "drizzle-orm";
var boolish6 = (v) => {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return void 0;
};
function createAutoCRUD14(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.region) conds.push(eq28(table4.region, String(q.region)));
    if (q.area) conds.push(eq28(table4.area, String(q.area)));
    if (q.siteType) conds.push(eq28(table4.siteType, String(q.siteType)));
    if (q.stageOfConstruction) conds.push(eq28(table4.stageOfConstruction, String(q.stageOfConstruction)));
    const convertedSite = boolish6(q.convertedSite);
    if (convertedSite !== void 0) conds.push(eq28(table4.convertedSite, convertedSite));
    const needFollowUp = boolish6(q.needFollowUp);
    if (needFollowUp !== void 0) conds.push(eq28(table4.needFollowUp, needFollowUp));
    if (q.relatedDealerID) conds.push(eq28(table4.relatedDealerID, String(q.relatedDealerID)));
    if (q.relatedMasonpcID) conds.push(eq28(table4.relatedMasonpcID, String(q.relatedMasonpcID)));
    const dateField2 = table4.firstVistDate;
    if (q.startDate && q.endDate && dateField2) {
      conds.push(
        and26(
          gte15(dateField2, q.startDate),
          lte15(dateField2, q.endDate)
        )
      );
    }
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql10`(${ilike10(table4.siteName, s)} 
          OR ${ilike10(table4.concernedPerson, s)} 
          OR ${ilike10(table4.phoneNo, s)} 
          OR ${ilike10(table4.keyPersonName, s)})`
      );
    }
    const finalConds = conds.filter(Boolean);
    if (finalConds.length === 0) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and26(...finalConds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "siteName":
        return direction === "asc" ? asc16(table4.siteName) : desc26(table4.siteName);
      case "region":
        return direction === "asc" ? asc16(table4.region) : desc26(table4.region);
      case "lastVisitDate":
        return direction === "asc" ? asc16(table4.lastVisitDate) : desc26(table4.lastVisitDate);
      case "firstVistDate":
        return direction === "asc" ? asc16(table4.firstVistDate) : desc26(table4.firstVistDate);
      case "convertedSite":
        return direction === "asc" ? asc16(table4.convertedSite) : desc26(table4.convertedSite);
      case "createdAt":
        return direction === "asc" ? asc16(table4.createdAt) : desc26(table4.createdAt);
      default:
        return desc26(table4.lastVisitDate || table4.createdAt);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const whereCondition = baseWhere ? extra ? and26(baseWhere, extra) : baseWhere : extra;
      const orderExpr = buildSort3(String(sortBy), String(sortDir));
      let q = db.select().from(table4).$dynamic();
      if (whereCondition) {
        q = q.where(whereCondition);
      }
      const data = await q.orderBy(orderExpr).limit(lmt).offset(offset);
      res.json({ success: true, page: pg, limit: lmt, count: data.length, data });
    } catch (error) {
      console.error(`Get ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  app2.get(`/api/${endpoint}`, (req, res) => listHandler(req, res));
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq28(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/phone/:phoneNo`, async (req, res) => {
    try {
      const { phoneNo } = req.params;
      const [record] = await db.select().from(table4).where(eq28(table4.phoneNo, phoneNo)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}` });
    }
  });
  app2.get(`/api/${endpoint}/region/:region`, (req, res) => {
    const base = eq28(table4.region, String(req.params.region));
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/area/:area`, (req, res) => {
    const base = eq28(table4.area, String(req.params.area));
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, (req, res) => {
    const base = eq28(table4.relatedDealerID, String(req.params.dealerId));
    return listHandler(req, res, base);
  });
}
function setupTechnicalSitesRoutes(app2) {
  createAutoCRUD14(app2, {
    endpoint: "technical-sites",
    table: technicalSites,
    schema: insertTechnicalSiteSchema,
    tableName: "Technical Site"
  });
  console.log("\u2705 Technical Sites GET endpoints setup complete");
}

// src/routes/dataSync/dealer.ts
import { z as z2 } from "zod";
import { sql as sql11 } from "drizzle-orm";

// src/routes/formSubmissionRoutes/addDealer.ts
import { z } from "zod";
import { eq as eq29 } from "drizzle-orm";
import { randomUUID } from "crypto";
var toStringArray = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    return t.includes(",") ? t.split(",").map((s) => s.trim()).filter(Boolean) : [t];
  }
  return [];
};
var strOrNull = z.preprocess((val) => {
  if (val === "") return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return val;
}, z.string().nullable().optional());
var dateOrNull = z.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  try {
    return new Date(String(val));
  } catch {
    return null;
  }
}, z.date().nullable().optional());
var numOrNull = z.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z.number().nullable().optional());
var intOrNull = z.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z.number().int().nullable().optional());
var toDateOnlyString = (d) => {
  if (!d) return null;
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};
var dealerInputSchema = z.object({
  userId: intOrNull,
  type: z.string().min(1),
  parentDealerId: strOrNull,
  // "" -> null (fixes FK violation)
  name: z.string().min(1),
  region: z.string().min(1),
  area: z.string().min(1),
  phoneNo: z.string().min(1),
  address: z.string().min(1),
  pinCode: strOrNull,
  latitude: numOrNull,
  // accepts number or "22.57"
  longitude: numOrNull,
  dateOfBirth: dateOrNull,
  anniversaryDate: dateOrNull,
  totalPotential: z.coerce.number(),
  // Required
  bestPotential: z.coerce.number(),
  // Required
  brandSelling: z.preprocess(toStringArray, z.array(z.string()).min(1, "brandSelling is required")),
  // Required
  feedbacks: z.string().min(1),
  remarks: strOrNull,
  // --- ADDED FOR PRISMA PARITY ---
  dealerDevelopmentStatus: strOrNull,
  dealerDevelopmentObstacle: strOrNull,
  salesGrowthPercentage: numOrNull,
  noOfPJP: intOrNull,
  // -----------------------------
  verificationStatus: z.enum(["PENDING", "VERIFIED"]).default("PENDING").optional(),
  // IDs & contacts
  whatsappNo: strOrNull,
  emailId: z.preprocess((val) => val === "" ? null : val, z.string().email().nullable().optional()),
  businessType: strOrNull,
  // --- ✅ NEW FIELDS ADDED ---
  nameOfFirm: strOrNull,
  underSalesPromoterName: strOrNull,
  // --- END NEW FIELDS ---
  gstinNo: strOrNull,
  panNo: strOrNull,
  tradeLicNo: strOrNull,
  aadharNo: strOrNull,
  // Godown
  godownSizeSqFt: intOrNull,
  godownCapacityMTBags: strOrNull,
  godownAddressLine: strOrNull,
  godownLandMark: strOrNull,
  godownDistrict: strOrNull,
  godownArea: strOrNull,
  godownRegion: strOrNull,
  godownPinCode: strOrNull,
  // Residential
  residentialAddressLine: strOrNull,
  residentialLandMark: strOrNull,
  residentialDistrict: strOrNull,
  residentialArea: strOrNull,
  residentialRegion: strOrNull,
  residentialPinCode: strOrNull,
  // Bank
  bankAccountName: strOrNull,
  bankName: strOrNull,
  bankBranchAddress: strOrNull,
  bankAccountNumber: strOrNull,
  bankIfscCode: strOrNull,
  // Sales & promoter
  brandName: strOrNull,
  monthlySaleMT: numOrNull,
  noOfDealers: intOrNull,
  areaCovered: strOrNull,
  projectedMonthlySalesBestCementMT: numOrNull,
  noOfEmployeesInSales: intOrNull,
  // Declaration
  declarationName: strOrNull,
  declarationPlace: strOrNull,
  declarationDate: dateOrNull,
  // Document URLs
  tradeLicencePicUrl: strOrNull,
  shopPicUrl: strOrNull,
  dealerPicUrl: strOrNull,
  blankChequePicUrl: strOrNull,
  partnershipDeedPicUrl: strOrNull,
  // Geofence (not part of DB, just for Radar)
  radius: z.preprocess((v) => v === "" ? void 0 : v, z.coerce.number().min(10).max(1e4).optional())
}).strict();
function createAutoCRUD15(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      if (!process.env.RADAR_SECRET_KEY) {
        return res.status(500).json({ success: false, error: "RADAR_SECRET_KEY is not configured on the server" });
      }
      const input = dealerInputSchema.parse(req.body);
      if (input.latitude == null || input.longitude == null) {
        return res.status(400).json({
          success: false,
          error: "latitude and longitude are required to create the geofence",
          details: [{ field: "latitude", message: "Required" }, { field: "longitude", message: "Required" }]
        });
      }
      const finalData = {
        userId: input.userId ?? null,
        type: input.type,
        parentDealerId: input.parentDealerId ?? null,
        name: input.name,
        region: input.region,
        area: input.area,
        phoneNo: input.phoneNo,
        address: input.address,
        pinCode: input.pinCode ?? null,
        latitude: String(input.latitude),
        longitude: String(input.longitude),
        dateOfBirth: toDateOnlyString(input.dateOfBirth),
        anniversaryDate: toDateOnlyString(input.anniversaryDate),
        totalPotential: String(input.totalPotential),
        bestPotential: String(input.bestPotential),
        brandSelling: input.brandSelling,
        feedbacks: input.feedbacks,
        remarks: input.remarks ?? null,
        // --- ADDED FOR PRISMA PARITY ---
        dealerDevelopmentStatus: input.dealerDevelopmentStatus ?? null,
        dealerDevelopmentObstacle: input.dealerDevelopmentObstacle ?? null,
        salesGrowthPercentage: input.salesGrowthPercentage ? String(input.salesGrowthPercentage) : null,
        noOfPJP: input.noOfPJP ?? null,
        // -----------------------------
        verificationStatus: input.verificationStatus ?? "PENDING",
        whatsappNo: input.whatsappNo ?? null,
        emailId: input.emailId ?? null,
        businessType: input.businessType ?? null,
        // --- ✅ NEW FIELDS ADDED ---
        nameOfFirm: input.nameOfFirm ?? null,
        underSalesPromoterName: input.underSalesPromoterName ?? null,
        // --- END NEW FIELDS ---
        gstinNo: input.gstinNo ?? null,
        panNo: input.panNo ?? null,
        tradeLicNo: input.tradeLicNo ?? null,
        aadharNo: input.aadharNo ?? null,
        // Godown
        godownSizeSqFt: input.godownSizeSqFt ?? null,
        godownCapacityMTBags: input.godownCapacityMTBags ?? null,
        godownAddressLine: input.godownAddressLine ?? null,
        godownLandMark: input.godownLandMark ?? null,
        godownDistrict: input.godownDistrict ?? null,
        godownArea: input.godownArea ?? null,
        godownRegion: input.godownRegion ?? null,
        godownPinCode: input.godownPinCode ?? null,
        // Residential
        residentialAddressLine: input.residentialAddressLine ?? null,
        residentialLandMark: input.residentialLandMark ?? null,
        residentialDistrict: input.residentialDistrict ?? null,
        residentialArea: input.residentialArea ?? null,
        residentialRegion: input.residentialRegion ?? null,
        residentialPinCode: input.residentialPinCode ?? null,
        // Bank
        bankAccountName: input.bankAccountName ?? null,
        bankName: input.bankName ?? null,
        bankBranchAddress: input.bankBranchAddress ?? null,
        bankAccountNumber: input.bankAccountNumber ?? null,
        bankIfscCode: input.bankIfscCode ?? null,
        // Sales & promoter
        brandName: input.brandName ?? null,
        monthlySaleMT: input.monthlySaleMT ? String(input.monthlySaleMT) : null,
        noOfDealers: input.noOfDealers ?? null,
        areaCovered: input.areaCovered ?? null,
        projectedMonthlySalesBestCementMT: input.projectedMonthlySalesBestCementMT ? String(input.projectedMonthlySalesBestCementMT) : null,
        noOfEmployeesInSales: input.noOfEmployeesInSales ?? null,
        // Declaration
        declarationName: input.declarationName ?? null,
        declarationPlace: input.declarationPlace ?? null,
        declarationDate: toDateOnlyString(input.declarationDate),
        // Docs
        tradeLicencePicUrl: input.tradeLicencePicUrl ?? null,
        shopPicUrl: input.shopPicUrl ?? null,
        dealerPicUrl: input.dealerPicUrl ?? null,
        blankChequePicUrl: input.blankChequePicUrl ?? null,
        partnershipDeedPicUrl: input.partnershipDeedPicUrl ?? null
      };
      const dealerId = randomUUID();
      const [dealer] = await db.insert(table4).values({ ...finalData, id: dealerId }).returning();
      const tag = "dealer";
      const externalId = `dealer:${dealer.id}`;
      const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;
      const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
      const radius = input.radius ?? 25;
      const form = new URLSearchParams();
      form.set("description", description);
      form.set("type", "circle");
      form.set("coordinates", JSON.stringify([dealer.longitude, dealer.latitude]));
      form.set("radius", String(radius));
      const metadata = {
        dealerId: dealer.id,
        userId: dealer.userId,
        region: dealer.region,
        area: dealer.area,
        phoneNo: dealer.phoneNo,
        verificationStatus: dealer.verificationStatus
      };
      Object.keys(metadata).forEach((k) => metadata[k] == null && delete metadata[k]);
      if (Object.keys(metadata).length) form.set("metadata", JSON.stringify(metadata));
      const upRes = await fetch(radarUrl, {
        method: "PUT",
        headers: {
          Authorization: process.env.RADAR_SECRET_KEY,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form.toString()
      });
      const upJson = await upRes.json().catch(() => ({}));
      if (!upRes.ok || upJson?.meta?.code !== 200 || !upJson?.geofence) {
        await db.delete(table4).where(eq29(table4.id, dealer.id));
        return res.status(502).json({
          // 502 Bad Gateway
          success: false,
          error: upJson?.meta?.message || upJson?.message || "Failed to upsert dealer geofence in Radar",
          details: "Database insert was rolled back."
        });
      }
      return res.status(201).json({
        success: true,
        data: dealer,
        message: `${tableName4} created and geofence upserted`,
        geofenceRef: {
          id: upJson.geofence._id,
          tag: upJson.geofence.tag,
          externalId: upJson.geofence.externalId,
          radiusMeters: upJson.geofence.geometryRadius ?? radius
        }
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
}
function setupDealersPostRoutes(app2) {
  createAutoCRUD15(app2, {
    endpoint: "dealers",
    table: dealers,
    tableName: "Dealer"
  });
  console.log("\u2705 Dealers POST endpoint with Radar geofence ready (empty-string\u2192null safe)");
}

// src/routes/dataSync/dealer.ts
var bulkDealerSyncSchema = z2.array(
  dealerInputSchema.omit({ radius: true }).extend({
    // 2. Override fields for this specific route
    gstinNo: z2.string().min(1, { message: "gstinNo is required for bulk sync" })
  })
);
function setupDealerSyncRoutes(app2) {
  app2.post("/api/sync/dealers-bulk", async (req, res) => {
    try {
      const dealersToSync = bulkDealerSyncSchema.parse(
        req.body
      );
      if (dealersToSync.length === 0) {
        return res.status(400).json({ success: false, error: "No dealers provided in the array." });
      }
      console.log(
        `[Data Sync] Starting bulk upsert for ${dealersToSync.length} dealers...`
      );
      const valuesToInsert = dealersToSync.map((d) => ({
        ...d,
        // Convert dates to 'YYYY-MM-DD' strings
        dateOfBirth: toDateOnlyString(d.dateOfBirth),
        anniversaryDate: toDateOnlyString(d.anniversaryDate),
        declarationDate: toDateOnlyString(d.declarationDate),
        // Convert numeric/decimal types to string for Drizzle
        latitude: d.latitude != null ? String(d.latitude) : null,
        longitude: d.longitude != null ? String(d.longitude) : null,
        totalPotential: String(d.totalPotential),
        bestPotential: String(d.bestPotential),
        salesGrowthPercentage: d.salesGrowthPercentage ? String(d.salesGrowthPercentage) : null,
        monthlySaleMT: d.monthlySaleMT ? String(d.monthlySaleMT) : null,
        projectedMonthlySalesBestCementMT: d.projectedMonthlySalesBestCementMT ? String(d.projectedMonthlySalesBestCementMT) : null
      }));
      const result = await db.insert(dealers).values(valuesToInsert).onConflictDoUpdate({
        // this is the UPSERT command in drizzle
        // The column with the UNIQUE constraint
        target: dealers.gstinNo,
        // The fields to update if a conflict happens
        set: {
          // --- List ALL fields you want to update from the Tally file ---
          userId: sql11.raw(`excluded."user_id"`),
          type: sql11.raw(`excluded."type"`),
          parentDealerId: sql11.raw(`excluded."parent_dealer_id"`),
          name: sql11.raw(`excluded."name"`),
          region: sql11.raw(`excluded."region"`),
          area: sql11.raw(`excluded."area"`),
          phoneNo: sql11.raw(`excluded."phone_no"`),
          address: sql11.raw(`excluded."address"`),
          pinCode: sql11.raw(`excluded."pinCode"`),
          latitude: sql11.raw(`excluded."latitude"`),
          longitude: sql11.raw(`excluded."longitude"`),
          dateOfBirth: sql11.raw(`excluded."dateOfBirth"`),
          anniversaryDate: sql11.raw(`excluded."anniversaryDate"`),
          totalPotential: sql11.raw(`excluded."total_potential"`),
          bestPotential: sql11.raw(`excluded."best_potential"`),
          brandSelling: sql11.raw(`excluded."brand_selling"`),
          feedbacks: sql11.raw(`excluded."feedbacks"`),
          remarks: sql11.raw(`excluded."remarks"`),
          dealerDevelopmentStatus: sql11.raw(
            `excluded."dealerdevelopmentstatus"`
          ),
          dealerDevelopmentObstacle: sql11.raw(
            `excluded."dealerdevelopmentobstacle"`
          ),
          verificationStatus: sql11.raw(`excluded."verification_status"`),
          whatsappNo: sql11.raw(`excluded."whatsapp_no"`),
          emailId: sql11.raw(`excluded."email_id"`),
          businessType: sql11.raw(`excluded."business_type"`),
          panNo: sql11.raw(`excluded."pan_no"`),
          tradeLicNo: sql11.raw(`excluded."trade_lic_no"`),
          aadharNo: sql11.raw(`excluded."aadhar_no"`),
          godownSizeSqFt: sql11.raw(`excluded."godown_size_sqft"`),
          godownCapacityMTBags: sql11.raw(
            `excluded."godown_capacity_mt_bags"`
          ),
          godownAddressLine: sql11.raw(`excluded."godown_address_line"`),
          godownLandMark: sql11.raw(`excluded."godown_landmark"`),
          godownDistrict: sql11.raw(`excluded."godown_district"`),
          godownArea: sql11.raw(`excluded."godown_area"`),
          godownRegion: sql11.raw(`excluded."godown_region"`),
          godownPinCode: sql11.raw(`excluded."godown_pincode"`),
          residentialAddressLine: sql11.raw(
            `excluded."residential_address_line"`
          ),
          residentialLandMark: sql11.raw(`excluded."residential_landmark"`),
          residentialDistrict: sql11.raw(`excluded."residential_district"`),
          residentialArea: sql11.raw(`excluded."residential_area"`),
          residentialRegion: sql11.raw(`excluded."residential_region"`),
          residentialPinCode: sql11.raw(`excluded."residential_pincode"`),
          bankAccountName: sql11.raw(`excluded."bank_account_name"`),
          bankName: sql11.raw(`excluded."bank_name"`),
          bankBranchAddress: sql11.raw(`excluded."bank_branch_address"`),
          bankAccountNumber: sql11.raw(`excluded."bank_account_number"`),
          bankIfscCode: sql11.raw(`excluded."bank_ifsc_code"`),
          brandName: sql11.raw(`excluded."brand_name"`),
          monthlySaleMT: sql11.raw(`excluded."monthly_sale_mt"`),
          noOfDealers: sql11.raw(`excluded."no_of_dealers"`),
          areaCovered: sql11.raw(`excluded."area_covered"`),
          projectedMonthlySalesBestCementMT: sql11.raw(
            `excluded."projected_monthly_sales_best_cement_mt"`
          ),
          noOfEmployeesInSales: sql11.raw(`excluded."no_of_employees_in_sales"`),
          declarationName: sql11.raw(`excluded."declaration_name"`),
          declarationPlace: sql11.raw(`excluded."declaration_place"`),
          declarationDate: sql11.raw(`excluded."declaration_date"`),
          salesGrowthPercentage: sql11.raw(
            `excluded."sales_growth_percentage"`
          ),
          nameOfFirm: sql11.raw(`excluded."nameOfFirm"`),
          underSalesPromoterName: sql11.raw(
            `excluded."underSalesPromoterName"`
          ),
          noOfPJP: sql11.raw(`excluded."no_of_pjp"`),
          // --- ALWAYS update the timestamp ---
          updatedAt: /* @__PURE__ */ new Date()
        }
      }).returning({
        id: dealers.id,
        gstinNo: dealers.gstinNo,
        name: dealers.name
      });
      res.status(200).json({
        success: true,
        message: `Bulk sync complete. ${result.length} dealers processed (updated or inserted).`,
        data: result
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          }))
        });
      }
      console.error("[Data Sync] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to sync dealers",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Dealer Bulk Sync POST endpoint setup complete.");
}

// src/routes/deleteRoutes/dealers.ts
import { eq as eq30, and as and27, gte as gte16, lte as lte16, inArray } from "drizzle-orm";
var RADAR_TAG = "dealer";
async function deleteRadarGeofence(externalId) {
  if (!process.env.RADAR_SECRET_KEY) {
    throw new Error("RADAR_SECRET_KEY is not configured");
  }
  const url = `https://api.radar.io/v1/geofences/${encodeURIComponent(RADAR_TAG)}/${encodeURIComponent(externalId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: process.env.RADAR_SECRET_KEY
    }
  });
  if (res.status === 404) return { ok: true, code: 404 };
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.meta?.message || body?.message || `Radar DELETE failed (${res.status})`;
    return { ok: false, code: res.status, message: msg };
  }
  return { ok: true, code: 200 };
}
async function bulkDeleteDealers(rows, tableName4) {
  let radarDeleted = 0;
  const deletableIds = [];
  const radarErrors = [];
  for (const r of rows) {
    const externalId = `dealer:${r.id}`;
    const result = await deleteRadarGeofence(externalId);
    if (result.ok) {
      radarDeleted++;
      deletableIds.push(r.id);
    } else {
      radarErrors.push({ id: r.id, message: result.message ?? "Radar delete failed" });
    }
  }
  if (deletableIds.length) {
    await db.delete(dealers).where(inArray(dealers.id, deletableIds));
  }
  return {
    deletedCount: deletableIds.length,
    totalCount: rows.length,
    radarDeleted,
    radarErrors
  };
}
function createAutoCRUD16(app2, config) {
  const { endpoint, table: table4, tableName: tableName4, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(table4).where(eq30(table4.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `${tableName4} not found` });
      }
      const radar = await deleteRadarGeofence(`dealer:${id}`);
      if (!radar.ok) {
        return res.status(502).json({
          success: false,
          error: `Failed to delete Radar geofence`,
          details: radar.message
        });
      }
      await db.delete(table4).where(eq30(table4.id, id));
      return res.json({
        success: true,
        message: `${tableName4} deleted`,
        deletedId: id,
        radar: { status: radar.code }
        // 200 or 404
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "Add ?confirm=true to proceed." });
      }
      const rows = await db.select().from(table4).where(eq30(table4.userId, Number(userId)));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found for user ${userId}` });
      }
      const { deletedCount, totalCount, radarDeleted, radarErrors } = await bulkDeleteDealers(rows, tableName4);
      return res.json({
        success: true,
        message: `${deletedCount}/${totalCount} ${tableName4}(s) deleted for user ${userId}`,
        deletedCount,
        radarDeleted,
        radarErrors
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/parent/:parentDealerId`, async (req, res) => {
    try {
      const { parentDealerId } = req.params;
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "Add ?confirm=true to proceed." });
      }
      const rows = await db.select().from(table4).where(eq30(table4.parentDealerId, parentDealerId));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found for parent ${parentDealerId}` });
      }
      const { deletedCount, totalCount, radarDeleted, radarErrors } = await bulkDeleteDealers(rows, tableName4);
      return res.json({
        success: true,
        message: `${deletedCount}/${totalCount} ${tableName4}(s) deleted for parent ${parentDealerId}`,
        deletedCount,
        radarDeleted,
        radarErrors
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Parent error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/firm-name/:nameOfFirm`, async (req, res) => {
    try {
      const { nameOfFirm } = req.params;
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "Add ?confirm=true to proceed." });
      }
      const rows = await db.select().from(table4).where(eq30(table4.nameOfFirm, nameOfFirm));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found with firm name ${nameOfFirm}` });
      }
      const { deletedCount, totalCount, radarDeleted, radarErrors } = await bulkDeleteDealers(rows, tableName4);
      return res.json({
        success: true,
        message: `${deletedCount}/${totalCount} ${tableName4}(s) deleted with firm name ${nameOfFirm}`,
        deletedCount,
        radarDeleted,
        radarErrors
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Firm Name error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/promoter/:promoterName`, async (req, res) => {
    try {
      const { promoterName } = req.params;
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "Add ?confirm=true to proceed." });
      }
      const rows = await db.select().from(table4).where(eq30(table4.underSalesPromoterName, promoterName));
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found under promoter ${promoterName}` });
      }
      const { deletedCount, totalCount, radarDeleted, radarErrors } = await bulkDeleteDealers(rows, tableName4);
      return res.json({
        success: true,
        message: `${deletedCount}/${totalCount} ${tableName4}(s) deleted under promoter ${promoterName}`,
        deletedCount,
        radarDeleted,
        radarErrors
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Promoter error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, error: "startDate and endDate are required (YYYY-MM-DD)" });
      }
      if (confirm !== "true") {
        return res.status(400).json({ success: false, error: "Add ?confirm=true to proceed." });
      }
      if (!dateField2) {
        return res.status(400).json({ success: false, error: `Date field not available for ${tableName4}` });
      }
      const whereCondition = and27(
        gte16(table4[dateField2], new Date(startDate)),
        lte16(table4[dateField2], new Date(endDate))
      );
      const rows = await db.select().from(table4).where(whereCondition);
      if (!rows.length) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s in specified date range` });
      }
      const { deletedCount, totalCount, radarDeleted, radarErrors } = await bulkDeleteDealers(rows, tableName4);
      return res.json({
        success: true,
        message: `${deletedCount}/${totalCount} ${tableName4}(s) deleted in range ${startDate}..${endDate}`,
        deletedCount,
        radarDeleted,
        radarErrors
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
}
function setupDealersDeleteRoutes(app2) {
  createAutoCRUD16(app2, {
    endpoint: "dealers",
    table: dealers,
    tableName: "Dealer",
    dateField: "createdAt"
  });
  console.log("\u2705 Dealers DELETE endpoints + Radar cleanup ready");
}

// src/routes/deleteRoutes/pjp.ts
import { eq as eq31, and as and28, gte as gte17, lte as lte17, inArray as inArray2, sql as sql12 } from "drizzle-orm";
async function mctExists(tx) {
  const result = await tx.execute(sql12`
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'master_connected_table'
  `);
  const rows = Array.isArray(result) ? result : result?.rows || [];
  return rows.length > 0;
}
function createAutoCRUD17(app2, config) {
  const { endpoint, table: table4, tableName: tableName4, dateField: dateField2 } = config;
  const deleteByIds = async (ids) => {
    if (ids.length === 0) return { deleted: 0, mctDeleted: 0, mctSkipped: false };
    return await db.transaction(async (tx) => {
      let mctDeleted = 0;
      let mctSkipped = false;
      if (await mctExists(tx)) {
        const mctRes = await tx.delete(masterConnectedTable).where(inArray2(masterConnectedTable.permanentJourneyPlanId, ids)).returning({ id: masterConnectedTable.id });
        mctDeleted = mctRes.length;
      } else {
        mctSkipped = true;
      }
      const pjpRes = await tx.delete(permanentJourneyPlans).where(inArray2(permanentJourneyPlans.id, ids)).returning({ id: permanentJourneyPlans.id });
      return { deleted: pjpRes.length, mctDeleted, mctSkipped };
    });
  };
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      }
      const { id } = req.params;
      const [exists] = await db.select({ id: table4.id }).from(table4).where(eq31(table4.id, id)).limit(1);
      if (!exists) {
        return res.status(404).json({ success: false, error: `${tableName4} not found` });
      }
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds([id]);
      return res.json({
        success: true,
        message: `${tableName4} deleted`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: [id]
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "This action requires confirmation. Add ?confirm=true" });
      }
      const userId = Number(req.params.userId);
      const rows = await db.select({ id: table4.id }).from(table4).where(eq31(table4.userId, userId));
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found for user ${userId}` });
      }
      const ids = rows.map((r) => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);
      return res.json({
        success: true,
        message: `${deleted} ${tableName4}(s) deleted for user ${userId}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/created-by/:createdById`, async (req, res) => {
    try {
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "This action requires confirmation. Add ?confirm=true" });
      }
      const createdById = Number(req.params.createdById);
      const rows = await db.select({ id: table4.id }).from(table4).where(eq31(table4.createdById, createdById));
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found created by user ${createdById}` });
      }
      const ids = rows.map((r) => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);
      return res.json({
        success: true,
        message: `${deleted} ${tableName4}(s) deleted created by user ${createdById}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Created By error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "This action requires confirmation. Add ?confirm=true" });
      }
      const { status } = req.params;
      const rows = await db.select({ id: table4.id }).from(table4).where(eq31(table4.status, status));
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName4}s found with status ${status}` });
      }
      const ids = rows.map((r) => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);
      return res.json({
        success: true,
        message: `${deleted} ${tableName4}(s) deleted with status ${status}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Status error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate)
        return res.status(400).json({ success: false, error: "startDate and endDate parameters are required" });
      if (confirm !== "true")
        return res.status(400).json({ success: false, error: "This action requires confirmation. Add ?confirm=true" });
      if (!dateField2)
        return res.status(400).json({ success: false, error: `Date field not available for ${tableName4}` });
      const rows = await db.select({ id: table4.id }).from(table4).where(and28(
        gte17(table4[dateField2], String(startDate)),
        lte17(table4[dateField2], String(endDate))
      ));
      if (rows.length === 0)
        return res.status(404).json({ success: false, error: `No ${tableName4}s found in date range` });
      const ids = rows.map((r) => r.id);
      const { deleted, mctDeleted, mctSkipped } = await deleteByIds(ids);
      return res.json({
        success: true,
        message: `${deleted} ${tableName4}(s) deleted from ${startDate} to ${endDate}`,
        deletedCount: deleted,
        mctCleaned: mctDeleted,
        mctSkipped,
        deletedIds: ids
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
}
function setupPermanentJourneyPlansDeleteRoutes(app2) {
  createAutoCRUD17(app2, {
    endpoint: "pjp",
    table: permanentJourneyPlans,
    schema: insertPermanentJourneyPlanSchema,
    tableName: "Permanent Journey Plan",
    dateField: "planDate"
  });
  console.log("\u2705 Permanent Journey Plans DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/tvr.ts
import { eq as eq32, and as and29, gte as gte18, lte as lte18 } from "drizzle-orm";
function createAutoCRUD18(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq32(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq32(table4.id, id));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq32(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq32(table4.userId, parseInt(userId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for user ${userId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/visit-type/:visitType`, async (req, res) => {
    try {
      const { visitType } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq32(table4.visitType, visitType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with visit type ${visitType}`
        });
      }
      await db.delete(table4).where(eq32(table4.visitType, visitType));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully with visit type ${visitType}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Visit Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate parameters are required"
        });
      }
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      if (!dateField2 || !table4[dateField2]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName4}`
        });
      }
      const whereCondition = and29(
        gte18(table4[dateField2], startDate),
        lte18(table4[dateField2], endDate)
      );
      const recordsToDelete = await db.select().from(table4).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found in the specified date range`
        });
      }
      await db.delete(table4).where(whereCondition);
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully from date range ${startDate} to ${endDate}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupTechnicalVisitReportsDeleteRoutes(app2) {
  createAutoCRUD18(app2, {
    endpoint: "technical-visit-reports",
    table: technicalVisitReports,
    schema: insertTechnicalVisitReportSchema,
    tableName: "Technical Visit Report",
    dateField: "reportDate",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Technical Visit Reports DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/dvr.ts
import { and as and30, eq as eq33, gte as gte19, lte as lte19, sql as sql13 } from "drizzle-orm";
var mustConfirm = (q) => q.confirm === "true" || q.confirm === true;
var numberish8 = (v) => {
  if (v === null || v === void 0 || v === "") return void 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
};
var boolish7 = (v) => {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return void 0;
};
function extractBrands3(q) {
  const raw = q.brand ?? q.brands ?? q.brandSelling ?? void 0;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).includes(",") ? String(raw).split(",").map((s) => s.trim()).filter(Boolean) : [String(raw).trim()].filter(Boolean);
  return arr;
}
function toPgArrayLiteral3(values) {
  return `{${values.map((v) => v.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}").trim()).join(",")}}`;
}
function createAutoCRUD19(app2, config) {
  const { endpoint, table: table4, tableName: tableName4, dateField: dateField2 = "reportDate" } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(table4).where(eq33(table4.id, id)).limit(1);
      if (!existing) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      await db.delete(table4).where(eq33(table4.id, id));
      res.json({ success: true, message: `${tableName4} deleted`, deletedId: id });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}` });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      const { userId } = req.params;
      const uid = parseInt(userId, 10);
      if (isNaN(uid)) return res.status(400).json({ success: false, error: "Invalid user ID" });
      const ids = await db.select({ id: table4.id }).from(table4).where(eq33(table4.userId, uid));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s for user ${userId}` });
      await db.delete(table4).where(eq33(table4.userId, uid));
      res.json({ success: true, message: `${ids.length} ${tableName4}(s) deleted for user ${userId}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/dealer-type/:dealerType`, async (req, res) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      const { dealerType } = req.params;
      const ids = await db.select({ id: table4.id }).from(table4).where(eq33(table4.dealerType, dealerType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s with dealer type ${dealerType}` });
      await db.delete(table4).where(eq33(table4.dealerType, dealerType));
      res.json({ success: true, message: `${ids.length} ${tableName4}(s) deleted with dealer type ${dealerType}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Dealer Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/visit-type/:visitType`, async (req, res) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      const { visitType } = req.params;
      const ids = await db.select({ id: table4.id }).from(table4).where(eq33(table4.visitType, visitType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s with visit type ${visitType}` });
      await db.delete(table4).where(eq33(table4.visitType, visitType));
      res.json({ success: true, message: `${ids.length} ${tableName4}(s) deleted with visit type ${visitType}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Visit Type error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/pjp/:pjpId`, async (req, res) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      const { pjpId } = req.params;
      const uid = numberish8(req.query.userId);
      const wherePjp = uid !== void 0 ? and30(eq33(table4.pjpId, pjpId), eq33(table4.userId, uid)) : eq33(table4.pjpId, pjpId);
      const ids = await db.select({ id: table4.id }).from(table4).where(wherePjp);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s found for pjpId ${pjpId}` });
      await db.delete(table4).where(wherePjp);
      res.json({ success: true, message: `${ids.length} ${tableName4}(s) deleted for pjp ${pjpId}`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/brands`, async (req, res) => {
    try {
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      const brands2 = extractBrands3(req.query);
      if (brands2.length === 0) return res.status(400).json({ success: false, error: "Provide ?brands=... for deletion" });
      const arrLiteral = toPgArrayLiteral3(brands2);
      const anyBrand = boolish7(req.query.anyBrand);
      const brandCond = anyBrand ? sql13`${table4.brandSelling} && ${arrLiteral}::text[]` : sql13`${table4.brandSelling} @> ${arrLiteral}::text[]`;
      const uid = numberish8(req.query.userId);
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const whereConds = [brandCond];
      if (uid !== void 0) whereConds.push(eq33(table4.userId, uid));
      if (startDate && endDate) {
        const col = table4[dateField2];
        if (dateField2 === "createdAt" || dateField2 === "updatedAt") {
          whereConds.push(gte19(col, new Date(startDate)), lte19(col, new Date(endDate)));
        } else {
          whereConds.push(gte19(col, startDate), lte19(col, endDate));
        }
      }
      const finalWhere = and30(...whereConds.filter(Boolean));
      if (!finalWhere) {
        return res.status(400).json({ success: false, error: "Invalid brand filter conditions" });
      }
      const ids = await db.select({ id: table4.id }).from(table4).where(finalWhere);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s match filters` });
      await db.delete(table4).where(finalWhere);
      res.json({ success: true, message: `${ids.length} ${tableName4}(s) deleted`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s by brands error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ success: false, error: "startDate and endDate are required" });
      if (!mustConfirm(req.query)) return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      const col = table4[dateField2];
      const whereCondition = dateField2 === "createdAt" || dateField2 === "updatedAt" ? and30(gte19(col, new Date(String(startDate))), lte19(col, new Date(String(endDate)))) : and30(gte19(col, String(startDate)), lte19(col, String(endDate)));
      const ids = await db.select({ id: table4.id }).from(table4).where(whereCondition);
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s in date range` });
      await db.delete(table4).where(whereCondition);
      res.json({ success: true, message: `${ids.length} ${tableName4}(s) deleted`, deletedCount: ids.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName4}s` });
    }
  });
}
function setupDailyVisitReportsDeleteRoutes(app2) {
  createAutoCRUD19(app2, {
    endpoint: "daily-visit-reports",
    table: dailyVisitReports,
    tableName: "Daily Visit Report",
    dateField: "reportDate"
  });
  console.log("\u2705 DVR DELETE endpoints (using dealerId) ready");
}

// src/routes/deleteRoutes/dailytask.ts
import { eq as eq34, and as and31, gte as gte20, lte as lte20 } from "drizzle-orm";
function createAutoCRUD20(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq34(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq34(table4.id, id));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq34(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq34(table4.userId, parseInt(userId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for user ${userId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/assigned-by/:assignedByUserId`, async (req, res) => {
    try {
      const { assignedByUserId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq34(table4.assignedByUserId, parseInt(assignedByUserId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found assigned by user ${assignedByUserId}`
        });
      }
      await db.delete(table4).where(eq34(table4.assignedByUserId, parseInt(assignedByUserId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully assigned by user ${assignedByUserId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Assigned By User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq34(table4.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with status ${status}`
        });
      }
      await db.delete(table4).where(eq34(table4.status, status));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully with status ${status}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/dealer/:relatedDealerId`, async (req, res) => {
    try {
      const { relatedDealerId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq34(table4.relatedDealerId, relatedDealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for dealer ${relatedDealerId}`
        });
      }
      await db.delete(table4).where(eq34(table4.relatedDealerId, relatedDealerId));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for dealer ${relatedDealerId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate parameters are required"
        });
      }
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      if (!dateField2 || !table4[dateField2]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName4}`
        });
      }
      const whereCondition = and31(
        gte20(table4[dateField2], startDate),
        lte20(table4[dateField2], endDate)
      );
      const recordsToDelete = await db.select().from(table4).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found in the specified date range`
        });
      }
      await db.delete(table4).where(whereCondition);
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully from date range ${startDate} to ${endDate}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyTasksDeleteRoutes(app2) {
  createAutoCRUD20(app2, {
    endpoint: "daily-tasks",
    table: dailyTasks,
    schema: insertDailyTaskSchema,
    tableName: "Daily Task",
    dateField: "taskDate",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Daily Tasks DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/salesmanleave.ts
import { eq as eq35, and as and32, gte as gte21, lte as lte21 } from "drizzle-orm";
function createAutoCRUD21(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq35(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq35(table4.id, id));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq35(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq35(table4.userId, parseInt(userId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for user ${userId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq35(table4.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with status ${status}`
        });
      }
      await db.delete(table4).where(eq35(table4.status, status));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully with status ${status}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/leave-type/:leaveType`, async (req, res) => {
    try {
      const { leaveType } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq35(table4.leaveType, leaveType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with leave type ${leaveType}`
        });
      }
      await db.delete(table4).where(eq35(table4.leaveType, leaveType));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully with leave type ${leaveType}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Leave Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate parameters are required"
        });
      }
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      if (!dateField2 || !table4[dateField2]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName4}`
        });
      }
      const whereCondition = and32(
        gte21(table4[dateField2], startDate),
        lte21(table4[dateField2], endDate)
      );
      const recordsToDelete = await db.select().from(table4).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found in the specified date range`
        });
      }
      await db.delete(table4).where(whereCondition);
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully from date range ${startDate} to ${endDate}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsDeleteRoutes(app2) {
  createAutoCRUD21(app2, {
    endpoint: "leave-applications",
    table: salesmanLeaveApplications,
    schema: insertSalesmanLeaveApplicationSchema,
    tableName: "Salesman Leave Application",
    dateField: "startDate",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Salesman Leave Applications DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/competetionreports.ts
import { eq as eq36, and as and33, gte as gte22, lte as lte22 } from "drizzle-orm";
function createAutoCRUD22(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq36(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq36(table4.id, id));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq36(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq36(table4.userId, parseInt(userId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for user ${userId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/brand/:brandName`, async (req, res) => {
    try {
      const { brandName } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq36(table4.brandName, brandName));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for brand ${brandName}`
        });
      }
      await db.delete(table4).where(eq36(table4.brandName, brandName));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for brand ${brandName}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Brand error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate parameters are required"
        });
      }
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      if (!dateField2 || !table4[dateField2]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName4}`
        });
      }
      const whereCondition = and33(
        gte22(table4[dateField2], startDate),
        lte22(table4[dateField2], endDate)
      );
      const recordsToDelete = await db.select().from(table4).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found in the specified date range`
        });
      }
      await db.delete(table4).where(whereCondition);
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully from date range ${startDate} to ${endDate}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCompetitionReportsDeleteRoutes(app2) {
  createAutoCRUD22(app2, {
    endpoint: "competition-reports",
    table: competitionReports,
    schema: insertCompetitionReportSchema,
    tableName: "Competition Report",
    dateField: "reportDate",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Competition Reports DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/brands.ts
import { eq as eq37 } from "drizzle-orm";
function createAutoCRUD23(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq37(table4.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq37(table4.id, parseInt(id)));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/name/:name`, async (req, res) => {
    try {
      const { name } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const [existingRecord] = await db.select().from(table4).where(eq37(table4.name, name)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} with name '${name}' not found`
        });
      }
      await db.delete(table4).where(eq37(table4.name, name));
      res.json({
        success: true,
        message: `${tableName4} '${name}' deleted successfully`,
        deletedName: name
      });
    } catch (error) {
      console.error(`Delete ${tableName4} by Name error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/all`, async (req, res) => {
    try {
      const { confirm } = req.query;
      if (confirm !== "DELETE_ALL_BRANDS") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=DELETE_ALL_BRANDS to proceed."
        });
      }
      const allRecords = await db.select().from(table4);
      if (allRecords.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found to delete`
        });
      }
      await db.delete(table4);
      res.json({
        success: true,
        message: `All ${allRecords.length} ${tableName4}(s) deleted successfully`,
        deletedCount: allRecords.length
      });
    } catch (error) {
      console.error(`Bulk delete all ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupBrandsDeleteRoutes(app2) {
  createAutoCRUD23(app2, {
    endpoint: "brands",
    table: brands,
    schema: insertBrandSchema,
    tableName: "Brand",
    autoFields: {}
  });
  console.log("\u2705 Brands DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/ratings.ts
import { eq as eq38 } from "drizzle-orm";
function createAutoCRUD24(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq38(table4.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq38(table4.id, parseInt(id)));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq38(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq38(table4.userId, parseInt(userId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for user ${userId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/area/:area`, async (req, res) => {
    try {
      const { area } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq38(table4.area, area));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for area ${area}`
        });
      }
      await db.delete(table4).where(eq38(table4.area, area));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for area ${area}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Area error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/region/:region`, async (req, res) => {
    try {
      const { region } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq38(table4.region, region));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for region ${region}`
        });
      }
      await db.delete(table4).where(eq38(table4.region, region));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for region ${region}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/rating/:rating`, async (req, res) => {
    try {
      const { rating } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table4).where(eq38(table4.rating, parseInt(rating)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with rating ${rating}`
        });
      }
      await db.delete(table4).where(eq38(table4.rating, parseInt(rating)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully with rating ${rating}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Rating error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsDeleteRoutes(app2) {
  createAutoCRUD24(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating",
    autoFields: {}
  });
  console.log("\u2705 Ratings DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/salesOrder.ts
import { eq as eq39, and as and36, gte as gte25, lte as lte25 } from "drizzle-orm";
function pickDateColumn2(key) {
  switch ((key || "").toLowerCase()) {
    case "deliverydate":
      return salesOrders.deliveryDate;
    case "receivedpaymentdate":
      return salesOrders.receivedPaymentDate;
    case "createdat":
      return salesOrders.createdAt;
    default:
      return salesOrders.orderDate;
  }
}
function createAutoCRUD25(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(table4).where(eq39(table4.id, id)).limit(1);
      if (!existing) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      await db.delete(table4).where(eq39(table4.id, id));
      res.json({ success: true, message: `${tableName4} deleted`, deletedId: id });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}` });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") return res.status(400).json({ success: false, error: "Add ?confirm=true" });
      const rows = await db.select().from(table4).where(eq39(table4.userId, parseInt(userId, 10)));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for user ${userId}` });
      await db.delete(table4).where(eq39(table4.userId, parseInt(userId, 10)));
      res.json({ success: true, message: `${rows.length} ${tableName4}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") return res.status(400).json({ success: false, error: "Add ?confirm=true" });
      const rows = await db.select().from(table4).where(eq39(table4.dealerId, dealerId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for dealer ${dealerId}` });
      await db.delete(table4).where(eq39(table4.dealerId, dealerId));
      res.json({ success: true, message: `${rows.length} ${tableName4}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Dealer error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/dvr/:dvrId`, async (req, res) => {
    try {
      const { dvrId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") return res.status(400).json({ success: false, error: "Add ?confirm=true" });
      const rows = await db.select().from(table4).where(eq39(table4.dvrId, dvrId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for DVR ${dvrId}` });
      await db.delete(table4).where(eq39(table4.dvrId, dvrId));
      res.json({ success: true, message: `${rows.length} ${tableName4}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by DVR error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/pjp/:pjpId`, async (req, res) => {
    try {
      const { pjpId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") return res.status(400).json({ success: false, error: "Add ?confirm=true" });
      const rows = await db.select().from(table4).where(eq39(table4.pjpId, pjpId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for PJP ${pjpId}` });
      await db.delete(table4).where(eq39(table4.pjpId, pjpId));
      res.json({ success: true, message: `${rows.length} ${tableName4}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by PJP error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") return res.status(400).json({ success: false, error: "Add ?confirm=true" });
      const rows = await db.select().from(table4).where(eq39(table4.status, status));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s with status ${status}` });
      await db.delete(table4).where(eq39(table4.status, status));
      res.json({ success: true, message: `${rows.length} ${tableName4}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Status error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName4}s` });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { dateField: dateField2, dateFrom, dateTo, confirm } = req.query;
      if (!dateFrom || !dateTo) return res.status(400).json({ success: false, error: "dateFrom/dateTo required" });
      if (confirm !== "true") return res.status(400).json({ success: false, error: "Add ?confirm=true" });
      const col = pickDateColumn2(String(dateField2));
      const whereCond = and36(
        gte25(col, new Date(String(dateFrom))),
        lte25(col, new Date(String(dateTo)))
      );
      const rows = await db.select().from(table4).where(whereCond);
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s in date range` });
      await db.delete(table4).where(whereCond);
      res.json({ success: true, message: `${rows.length} ${tableName4}(s) deleted`, deletedCount: rows.length });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({ success: false, error: `Failed to bulk delete ${tableName4}s` });
    }
  });
}
function setupSalesOrdersDeleteRoutes(app2) {
  createAutoCRUD25(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order"
  });
  console.log("\u2705 Sales Orders DELETE endpoints (with status) ready");
}

// src/routes/deleteRoutes/dealerReportsAndScores.ts
import { eq as eq40, and as and37, gte as gte26, lte as lte26 } from "drizzle-orm";
function createAutoCRUD26(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq40(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq40(table4.id, id));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully`,
        deletedId: id
      });
    } catch (error) {
      console.error(`Delete ${tableName4} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const [existingRecord] = await db.select().from(table4).where(eq40(table4.dealerId, dealerId)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4} found for dealer ${dealerId}`
        });
      }
      await db.delete(table4).where(eq40(table4.dealerId, dealerId));
      res.json({
        success: true,
        message: `${tableName4} deleted successfully for dealer ${dealerId}`,
        deletedDealerId: dealerId
      });
    } catch (error) {
      console.error(`Delete ${tableName4} by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/score-range`, async (req, res) => {
    try {
      const { minScore, maxScore, scoreType = "dealerScore", confirm } = req.query;
      if (!minScore || !maxScore) {
        return res.status(400).json({
          success: false,
          error: "minScore and maxScore parameters are required"
        });
      }
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const whereCondition = and37(
        gte26(table4[scoreType], parseFloat(minScore)),
        lte26(table4[scoreType], parseFloat(maxScore))
      );
      const recordsToDelete = await db.select().from(table4).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found in the specified score range`
        });
      }
      await db.delete(table4).where(whereCondition);
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully with ${scoreType} between ${minScore} and ${maxScore}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Score Range error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s by score range`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/bulk/date-range`, async (req, res) => {
    try {
      const { startDate, endDate, confirm } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate parameters are required"
        });
      }
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      if (!dateField2 || !table4[dateField2]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName4}`
        });
      }
      const whereCondition = and37(
        gte26(table4[dateField2], startDate),
        lte26(table4[dateField2], endDate)
      );
      const recordsToDelete = await db.select().from(table4).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found in the specified date range`
        });
      }
      await db.delete(table4).where(whereCondition);
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully from date range ${startDate} to ${endDate}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Bulk delete ${tableName4}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to bulk delete ${tableName4}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealerReportsAndScoresDeleteRoutes(app2) {
  createAutoCRUD26(app2, {
    endpoint: "dealer-reports-scores",
    table: dealerReportsAndScores,
    schema: insertDealerReportsAndScoresSchema,
    tableName: "Dealer Reports and Scores",
    dateField: "lastUpdatedDate",
    autoFields: {
      lastUpdatedDate: () => (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Dealer Reports and Scores DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/tsoMeetings.ts
import { eq as eq41 } from "drizzle-orm";
var table3 = tsoMeetings;
var tableName3 = "TSO Meeting";
function setupTsoMeetingsDeleteRoutes(app2) {
  const endpoint = "tso-meetings";
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select({ id: table3.id }).from(table3).where(eq41(table3.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `${tableName3} not found` });
      }
      await db.delete(table3).where(eq41(table3.id, id));
      res.json({ success: true, message: `${tableName3} deleted`, deletedId: id });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(409).json({
          success: false,
          error: "Cannot delete meeting: It is still referenced by one or more Technical Visit Reports.",
          code: error.code
        });
      }
      console.error(`Delete ${tableName3} error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName3}` });
    }
  });
  app2.delete(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      if (req.query.confirm !== "true") {
        return res.status(400).json({ success: false, error: "Confirmation required. Add ?confirm=true" });
      }
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid User ID" });
      }
      const rows = await db.select({ id: table3.id }).from(table3).where(eq41(table3.createdByUserId, userId));
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName3}s found for user ${userId}` });
      }
      const ids = rows.map((r) => r.id);
      await db.delete(table3).where(eq41(table3.createdByUserId, userId));
      res.json({
        success: true,
        message: `${rows.length} ${tableName3}(s) deleted for user ${userId}`,
        deletedCount: rows.length,
        deletedIds: ids
      });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(409).json({
          success: false,
          error: "Cannot delete meetings: One or more are still referenced by Technical Visit Reports.",
          code: error.code
        });
      }
      console.error(`Delete ${tableName3}s by User error:`, error);
      res.status(500).json({ success: false, error: `Failed to delete ${tableName3}s` });
    }
  });
  console.log("\u2705 TSO Meetings DELETE endpoints setup complete");
}

// src/firebase/admin.ts
import admin from "firebase-admin";
if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is missing");
    throw new Error("Firebase Admin not configured");
  }
  const creds = JSON.parse(raw);
  if (creds.private_key?.includes("\\n")) {
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");
  }
  admin.initializeApp({
    credential: admin.credential.cert(creds)
  });
}

// src/routes/authFirebase.ts
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import crypto2 from "crypto";
import { eq as eq42 } from "drizzle-orm";
var JWT_TTL_SECONDS = 60 * 60 * 24 * 7;
var SESSION_TTL_SECONDS = 60 * 60 * 24 * 60;
var verifyJwt = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};
function setupAuthFirebaseRoutes(app2) {
  app2.post("/api/auth/firebase", async (req, res) => {
    try {
      const { idToken, name } = req.body;
      if (!idToken) {
        return res.status(400).json({ success: false, error: "idToken required" });
      }
      const decoded = await getAuth().verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const phone = decoded.phone_number || null;
      if (!phone) {
        return res.status(400).json({ success: false, error: "Phone missing in Firebase token" });
      }
      let mason = (await db.select().from(masonPcSide).where(eq42(masonPcSide.firebaseUid, firebaseUid)).limit(1))[0];
      if (!mason) {
        mason = (await db.select().from(masonPcSide).where(eq42(masonPcSide.phoneNumber, phone)).limit(1))[0];
        if (!mason) {
          const created = await db.insert(masonPcSide).values({
            id: crypto2.randomUUID(),
            name: name || "New Contractor",
            // <-- MODIFIED: Use provided name
            phoneNumber: phone,
            firebaseUid,
            kycStatus: "none",
            pointsBalance: 0
          }).returning();
          mason = created[0];
        } else {
          const updates = { firebaseUid };
          if (name && mason.name === "New Contractor") {
            updates.name = name;
          }
          await db.update(masonPcSide).set(updates).where(eq42(masonPcSide.id, mason.id));
          mason = { ...mason, ...updates };
        }
      }
      const sessionToken = crypto2.randomBytes(32).toString("hex");
      const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1e3);
      await db.insert(authSessions).values({
        sessionId: crypto2.randomUUID(),
        masonId: mason.id,
        sessionToken,
        createdAt: /* @__PURE__ */ new Date(),
        expiresAt: sessionExpiresAt
      });
      const jwtToken = jwt.sign(
        { sub: mason.id, role: "mason", phone: mason.phoneNumber, kyc: mason.kycStatus },
        process.env.JWT_SECRET,
        { expiresIn: JWT_TTL_SECONDS }
        // 7 days
      );
      return res.status(200).json({
        success: true,
        jwt: jwtToken,
        sessionToken,
        sessionExpiresAt,
        mason: {
          id: mason.id,
          phoneNumber: mason.phoneNumber,
          name: mason.name,
          kycStatus: mason.kycStatus,
          pointsBalance: mason.pointsBalance,
          firebaseUid: mason.firebaseUid
        }
      });
    } catch (e) {
      console.error("auth/firebase error:", e);
      return res.status(401).json({ success: false, error: "Invalid Firebase token" });
    }
  });
  app2.get("/api/auth/validate", async (req, res) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }
    try {
      const masonId = decoded.sub;
      const [mason] = await db.select().from(masonPcSide).where(eq42(masonPcSide.id, masonId)).limit(1);
      if (!mason) {
        return res.status(404).json({ success: false, error: "Mason not found" });
      }
      return res.status(200).json({
        success: true,
        mason: {
          id: mason.id,
          firebaseUid: mason.firebaseUid,
          phoneNumber: mason.phoneNumber,
          name: mason.name,
          kycStatus: mason.kycStatus,
          pointsBalance: mason.pointsBalance
        }
      });
    } catch (e) {
      console.error("auth/validate error:", e);
      return res.status(500).json({ success: false, error: "Database error" });
    }
  });
  app2.post("/api/auth/refresh", async (req, res) => {
    try {
      const token = req.header("x-session-token");
      if (!token) return res.status(400).json({ success: false, error: "x-session-token required" });
      const [session] = await db.select().from(authSessions).where(eq42(authSessions.sessionToken, token)).limit(1);
      if (!session || !session.expiresAt || session.expiresAt < /* @__PURE__ */ new Date()) {
        if (session) {
          await db.delete(authSessions).where(eq42(authSessions.sessionId, session.sessionId));
        }
        return res.status(401).json({ success: false, error: "Session expired or invalid" });
      }
      const [mason] = await db.select().from(masonPcSide).where(eq42(masonPcSide.id, session.masonId)).limit(1);
      if (!mason) return res.status(401).json({ success: false, error: "Unknown user" });
      const jwtToken = jwt.sign(
        { sub: mason.id, role: "mason", phone: mason.phoneNumber, kyc: mason.kycStatus },
        process.env.JWT_SECRET,
        { expiresIn: JWT_TTL_SECONDS }
        // 7 days
      );
      const newSessionToken = crypto2.randomBytes(32).toString("hex");
      const newSessionExpiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1e3);
      await db.update(authSessions).set({ sessionToken: newSessionToken, expiresAt: newSessionExpiresAt, createdAt: /* @__PURE__ */ new Date() }).where(eq42(authSessions.sessionId, session.sessionId));
      return res.status(200).json({
        success: true,
        jwt: jwtToken,
        sessionToken: newSessionToken,
        sessionExpiresAt: newSessionExpiresAt,
        mason: {
          id: mason.id,
          phoneNumber: mason.phoneNumber,
          name: mason.name,
          kycStatus: mason.kycStatus,
          pointsBalance: mason.pointsBalance,
          firebaseUid: mason.firebaseUid
        }
      });
    } catch (e) {
      console.error("auth/refresh error:", e);
      return res.status(500).json({ success: false, error: "Refresh failed" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      const token = req.header("x-session-token");
      if (!token) return res.status(400).json({ success: false, error: "x-session-token required" });
      await db.delete(authSessions).where(eq42(authSessions.sessionToken, token));
      return res.status(200).json({ success: true, message: "Logged out" });
    } catch (e) {
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
  });
  app2.post("/api/auth/dev-bypass", async (req, res) => {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({ success: false, error: "Forbidden in production" });
    }
    try {
      const { phone, name } = req.body;
      if (!phone) return res.status(400).json({ success: false, error: "Phone required" });
      let mason = (await db.select().from(masonPcSide).where(eq42(masonPcSide.phoneNumber, phone)).limit(1))[0];
      if (!mason) {
        const created = await db.insert(masonPcSide).values({
          id: crypto2.randomUUID(),
          name: name || "Dev Contractor",
          phoneNumber: phone,
          firebaseUid: `dev_${phone}`,
          // Create a fake UID
          kycStatus: "none",
          pointsBalance: 0
        }).returning();
        mason = created[0];
      }
      const sessionToken = crypto2.randomBytes(32).toString("hex");
      const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1e3);
      await db.insert(authSessions).values({
        sessionId: crypto2.randomUUID(),
        masonId: mason.id,
        sessionToken,
        createdAt: /* @__PURE__ */ new Date(),
        expiresAt: sessionExpiresAt
      });
      const jwtToken = jwt.sign(
        { sub: mason.id, role: "mason", phone: mason.phoneNumber, kyc: mason.kycStatus },
        process.env.JWT_SECRET,
        { expiresIn: JWT_TTL_SECONDS }
      );
      return res.status(200).json({
        success: true,
        jwt: jwtToken,
        sessionToken,
        sessionExpiresAt,
        mason: {
          id: mason.id,
          phoneNumber: mason.phoneNumber,
          name: mason.name,
          kycStatus: mason.kycStatus,
          pointsBalance: mason.pointsBalance,
          firebaseUid: mason.firebaseUid
        }
      });
    } catch (e) {
      console.error("auth/dev-bypass error:", e);
      return res.status(500).json({ success: false, error: "Dev bypass failed" });
    }
  });
}

// src/routes/formSubmissionRoutes/dvr.ts
import { z as z3 } from "zod";
import { randomUUID as randomUUID2 } from "crypto";
var toDateOnly = (d) => d.toISOString().slice(0, 10);
var toStringArray2 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s.includes(",") ? s.split(",").map((t) => t.trim()).filter(Boolean) : [s];
  }
  return [];
};
var strOrNull2 = z3.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z3.string().nullable().optional());
var numOrNull2 = z3.preprocess((val) => val === "" || val === null || val === void 0 ? null : val, z3.coerce.number().nullable().optional());
var dvrInputSchema = z3.object({
  userId: z3.coerce.number().int().positive(),
  dealerId: strOrNull2,
  subDealerId: strOrNull2,
  reportDate: z3.coerce.date(),
  dealerType: z3.string().max(50),
  location: z3.string().max(500),
  latitude: z3.coerce.number(),
  longitude: z3.coerce.number(),
  visitType: z3.string().max(50),
  // <-- This was in the schema
  dealerTotalPotential: z3.coerce.number(),
  dealerBestPotential: z3.coerce.number(),
  brandSelling: z3.preprocess(toStringArray2, z3.array(z3.string()).min(1)),
  contactPerson: strOrNull2,
  contactPersonPhoneNo: strOrNull2,
  todayOrderMt: z3.coerce.number(),
  todayCollectionRupees: z3.coerce.number(),
  overdueAmount: numOrNull2,
  feedbacks: z3.string().max(500).min(1),
  solutionBySalesperson: strOrNull2,
  anyRemarks: strOrNull2,
  checkInTime: z3.coerce.date(),
  checkOutTime: z3.coerce.date().nullable().optional(),
  timeSpentinLoc: strOrNull2,
  inTimeImageUrl: strOrNull2,
  outTimeImageUrl: strOrNull2,
  pjpId: strOrNull2
}).strict();
function setupDailyVisitReportsPostRoutes(app2) {
  app2.post("/api/daily-visit-reports", async (req, res) => {
    try {
      const input = dvrInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID2(),
        userId: input.userId,
        dealerId: input.dealerId ?? null,
        subDealerId: input.subDealerId ?? null,
        reportDate: toDateOnly(input.reportDate),
        dealerType: input.dealerType,
        location: input.location,
        latitude: String(input.latitude),
        longitude: String(input.longitude),
        // --- ✅ THE FIX ---
        visitType: input.visitType,
        // <-- This line was missing
        // --- END FIX ---
        dealerTotalPotential: String(input.dealerTotalPotential),
        dealerBestPotential: String(input.dealerBestPotential),
        brandSelling: input.brandSelling,
        contactPerson: input.contactPerson ?? null,
        contactPersonPhoneNo: input.contactPersonPhoneNo ?? null,
        todayOrderMt: String(input.todayOrderMt),
        todayCollectionRupees: String(input.todayCollectionRupees),
        overdueAmount: input.overdueAmount ? String(input.overdueAmount) : null,
        feedbacks: input.feedbacks,
        solutionBySalesperson: input.solutionBySalesperson ?? null,
        anyRemarks: input.anyRemarks ?? null,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime ?? null,
        timeSpentinLoc: input.timeSpentinLoc ?? null,
        inTimeImageUrl: input.inTimeImageUrl ?? null,
        outTimeImageUrl: input.outTimeImageUrl ?? null,
        pjpId: input.pjpId ?? null
      };
      const [record] = await db.insert(dailyVisitReports).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: "Daily Visit Report created successfully",
        data: record
      });
    } catch (error) {
      console.error(`Create DVR error:`, error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to create DVR",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 DVR POST endpoints (using dealerId) setup complete");
}

// src/routes/formSubmissionRoutes/tvr.ts
import { z as z4 } from "zod";
import { randomUUID as randomUUID3 } from "crypto";
var toDateOnly2 = (d) => d.toISOString().slice(0, 10);
var toStringArray3 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s.includes(",") ? s.split(",").map((t) => t.trim()).filter(Boolean) : [s];
  }
  return [];
};
var nullableString = z4.string().transform((s) => s.trim() === "" ? null : s).optional().nullable();
var tvrInputSchema = z4.object({
  userId: z4.coerce.number().int().positive(),
  reportDate: z4.coerce.date(),
  visitType: z4.string().max(50),
  siteNameConcernedPerson: z4.string().max(255),
  phoneNo: z4.string().max(20),
  emailId: nullableString,
  clientsRemarks: z4.string().max(500),
  salespersonRemarks: z4.string().max(500),
  checkInTime: z4.coerce.date(),
  checkOutTime: z4.coerce.date().nullable().optional(),
  inTimeImageUrl: nullableString,
  outTimeImageUrl: nullableString,
  // Array fields
  siteVisitBrandInUse: z4.preprocess(toStringArray3, z4.array(z4.string()).min(1, "siteVisitBrandInUse requires at least one brand")),
  influencerType: z4.preprocess(toStringArray3, z4.array(z4.string()).min(1, "influencerType requires at least one type")),
  // Nullable text fields
  siteVisitStage: nullableString,
  conversionFromBrand: nullableString,
  conversionQuantityUnit: nullableString,
  associatedPartyName: nullableString,
  serviceType: nullableString,
  qualityComplaint: nullableString,
  promotionalActivity: nullableString,
  channelPartnerVisit: nullableString,
  // Nullable numeric
  conversionQuantityValue: z4.coerce.number().nullable().optional(),
  siteVisitType: nullableString,
  dhalaiVerificationCode: nullableString,
  isVerificationStatus: nullableString,
  meetingId: nullableString,
  pjpId: nullableString,
  timeSpentinLoc: nullableString,
  purposeOfVisit: nullableString,
  sitePhotoUrl: nullableString,
  firstVisitTime: z4.coerce.date().nullable().optional(),
  lastVisitTime: z4.coerce.date().nullable().optional(),
  firstVisitDay: nullableString,
  lastVisitDay: nullableString,
  siteVisitsCount: z4.coerce.number().int().nullable().optional(),
  otherVisitsCount: z4.coerce.number().int().nullable().optional(),
  totalVisitsCount: z4.coerce.number().int().nullable().optional(),
  region: nullableString,
  area: nullableString,
  latitude: z4.coerce.number().nullable().optional(),
  longitude: z4.coerce.number().nullable().optional(),
  masonId: nullableString
}).strict();
function createAutoCRUD27(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const input = tvrInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID3(),
        // App-generated UUID
        userId: input.userId,
        reportDate: toDateOnly2(input.reportDate),
        // Normalize to YYYY-MM-DD
        visitType: input.visitType,
        siteNameConcernedPerson: input.siteNameConcernedPerson,
        phoneNo: input.phoneNo,
        emailId: input.emailId ?? null,
        clientsRemarks: input.clientsRemarks,
        salespersonRemarks: input.salespersonRemarks,
        checkInTime: input.checkInTime,
        // Full timestamp
        checkOutTime: input.checkOutTime ?? null,
        inTimeImageUrl: input.inTimeImageUrl ?? null,
        outTimeImageUrl: input.outTimeImageUrl ?? null,
        siteVisitBrandInUse: input.siteVisitBrandInUse,
        influencerType: input.influencerType,
        siteVisitStage: input.siteVisitStage ?? null,
        conversionFromBrand: input.conversionFromBrand ?? null,
        // --- ✅ TS FIX ---
        // Convert number|null to string|null for Drizzle 'numeric' type
        conversionQuantityValue: input.conversionQuantityValue !== null && input.conversionQuantityValue !== void 0 ? String(input.conversionQuantityValue) : null,
        // --- END FIX ---
        conversionQuantityUnit: input.conversionQuantityUnit ?? null,
        associatedPartyName: input.associatedPartyName ?? null,
        serviceType: input.serviceType ?? null,
        qualityComplaint: input.qualityComplaint ?? null,
        promotionalActivity: input.promotionalActivity ?? null,
        channelPartnerVisit: input.channelPartnerVisit ?? null,
        siteVisitType: input.siteVisitType ?? null,
        dhalaiVerificationCode: input.dhalaiVerificationCode ?? null,
        isVerificationStatus: input.isVerificationStatus ?? null,
        meetingId: input.meetingId ?? null,
        pjpId: input.pjpId ?? null,
        timeSpentinLoc: input.timeSpentinLoc ?? null,
        purposeOfVisit: input.purposeOfVisit ?? null,
        sitePhotoUrl: input.sitePhotoUrl ?? null,
        firstVisitTime: input.firstVisitTime ?? null,
        lastVisitTime: input.lastVisitTime ?? null,
        firstVisitDay: input.firstVisitDay ?? null,
        lastVisitDay: input.lastVisitDay ?? null,
        siteVisitsCount: input.siteVisitsCount ?? null,
        otherVisitsCount: input.otherVisitsCount ?? null,
        totalVisitsCount: input.totalVisitsCount ?? null,
        region: input.region ?? null,
        area: input.area ?? null,
        // Convert number|null to string|null for Drizzle 'numeric' type
        latitude: input.latitude !== null && input.latitude !== void 0 ? String(input.latitude) : null,
        longitude: input.longitude !== null && input.longitude !== void 0 ? String(input.longitude) : null,
        masonId: input.masonId ?? null
      };
      const [record] = await db.insert(table4).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: record
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z4.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
}
function setupTechnicalVisitReportsPostRoutes(app2) {
  createAutoCRUD27(app2, {
    endpoint: "technical-visit-reports",
    table: technicalVisitReports,
    tableName: "Technical Visit Report"
  });
  console.log("\u2705 Technical Visit Reports POST endpoints setup complete (Schema-Accurate)");
}

// src/routes/formSubmissionRoutes/pjp.ts
import { z as z5 } from "zod";
import { randomUUID as randomUUID4 } from "crypto";
var toDateOnly3 = (d) => d.toISOString().slice(0, 10);
var addDays = (d, days) => new Date(d.getTime() + days * 864e5);
var strOrNull3 = z5.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z5.string().nullable().optional());
var pjpInputSchema = z5.object({
  userId: z5.coerce.number().int().positive(),
  createdById: z5.coerce.number().int().positive(),
  dealerId: strOrNull3,
  // nullable FK -> dealers.id
  planDate: z5.coerce.date(),
  areaToBeVisited: z5.string().max(500).min(1),
  description: strOrNull3,
  status: z5.string().max(50).min(1).default("PENDING"),
  verificationStatus: strOrNull3,
  additionalVisitRemarks: strOrNull3,
  idempotencyKey: z5.string().max(120).optional()
  // harmless to keep, not used in conflict now
}).strict();
var bulkSchema = z5.object({
  userId: z5.coerce.number().int().positive(),
  createdById: z5.coerce.number().int().positive(),
  dealerIds: z5.array(z5.string().min(1)).min(1),
  baseDate: z5.coerce.date(),
  batchSizePerDay: z5.coerce.number().int().min(1).max(500).default(8),
  areaToBeVisited: z5.string().max(500).min(1),
  description: strOrNull3,
  status: z5.string().max(50).default("PENDING"),
  bulkOpId: z5.string().max(50).optional(),
  idempotencyKey: z5.string().max(120).optional()
}).strict();
function setupPermanentJourneyPlansPostRoutes(app2) {
  app2.post("/api/pjp", async (req, res) => {
    try {
      const input = pjpInputSchema.parse(req.body);
      const [record] = await db.insert(permanentJourneyPlans).values({
        id: randomUUID4(),
        userId: input.userId,
        createdById: input.createdById,
        dealerId: input.dealerId ?? null,
        planDate: toDateOnly3(input.planDate),
        areaToBeVisited: input.areaToBeVisited,
        description: input.description ?? null,
        status: input.status,
        verificationStatus: input.verificationStatus ?? null,
        additionalVisitRemarks: input.additionalVisitRemarks ?? null,
        idempotencyKey: input.idempotencyKey
      }).onConflictDoNothing({
        // use the composite unique that definitely exists
        target: [
          permanentJourneyPlans.userId,
          permanentJourneyPlans.dealerId,
          permanentJourneyPlans.planDate
        ]
      }).returning();
      return res.status(201).json({
        success: true,
        message: record ? "Permanent Journey Plan created successfully" : "Skipped (already exists for user+dealer+date)",
        data: record ?? null
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Create PJP error:", error);
      return res.status(500).json({ success: false, error: "Failed to create PJP" });
    }
  });
  app2.post("/api/bulkpjp", async (req, res) => {
    try {
      const input = bulkSchema.parse(req.body);
      const {
        userId,
        createdById,
        dealerIds,
        baseDate,
        batchSizePerDay,
        areaToBeVisited,
        description,
        status,
        //verificationStatus,            // <<— grab it
        bulkOpId,
        idempotencyKey
      } = input;
      const rows = dealerIds.map((dealerId, i) => {
        const dayOffset = Math.floor(i / batchSizePerDay);
        const planDate = toDateOnly3(addDays(baseDate, dayOffset));
        return {
          id: randomUUID4(),
          userId,
          createdById,
          dealerId,
          planDate,
          areaToBeVisited,
          description: description ?? null,
          // status comes from UI (PENDING)
          status,
          // ✅ Hard-code verificationStatus to PENDING at insert time
          verificationStatus: "PENDING",
          bulkOpId,
          idempotencyKey
        };
      });
      let totalCreated = 0;
      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const result = await db.insert(permanentJourneyPlans).values(rows.slice(i, i + CHUNK)).onConflictDoNothing({
          target: [
            permanentJourneyPlans.userId,
            permanentJourneyPlans.dealerId,
            permanentJourneyPlans.planDate
          ]
        }).returning({ id: permanentJourneyPlans.id });
        totalCreated += result.length;
      }
      return res.status(201).json({
        success: true,
        message: "Bulk PJP creation complete",
        requestedDealers: dealerIds.length,
        totalRowsCreated: totalCreated,
        totalRowsSkipped: dealerIds.length - totalCreated
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Bulk PJP error:", error);
      return res.status(500).json({ success: false, error: "Failed to process bulk PJP" });
    }
  });
  console.log("\u2705 PJP POST endpoints (using dealerId) setup complete");
}

// src/routes/formSubmissionRoutes/salesManleave.ts
import { z as z6 } from "zod";
import { randomUUID as randomUUID5 } from "crypto";
function createAutoCRUD28(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID5();
      const insertData = {
        id: generatedId,
        ...parsed2,
        startDate: new Date(parsed2.startDate),
        endDate: new Date(parsed2.endDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table4).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.message
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsPostRoutes(app2) {
  createAutoCRUD28(app2, {
    endpoint: "leave-applications",
    table: salesmanLeaveApplications,
    schema: insertSalesmanLeaveApplicationSchema,
    tableName: "Salesman Leave Application",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Salesman Leave Applications POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/competitionReport.ts
import { z as z7 } from "zod";
import { randomUUID as randomUUID6 } from "crypto";
function createAutoCRUD29(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID6().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        reportDate: new Date(parsed2.reportDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table4).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z7.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCompetitionReportsPostRoutes(app2) {
  createAutoCRUD29(app2, {
    endpoint: "competition-reports",
    table: competitionReports,
    schema: insertCompetitionReportSchema,
    tableName: "Competition Report",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Competition Reports POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/dailytasks.ts
import { z as z8 } from "zod";
import { randomUUID as randomUUID7 } from "crypto";
function createAutoCRUD30(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID7().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        taskDate: new Date(parsed2.taskDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table4).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z8.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyTasksPostRoutes(app2) {
  createAutoCRUD30(app2, {
    endpoint: "daily-tasks",
    table: dailyTasks,
    schema: insertDailyTaskSchema,
    tableName: "Daily Task",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Daily Tasks POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/dealerReportsAndScores.ts
import { z as z9 } from "zod";
import { randomUUID as randomUUID8 } from "crypto";
function createAutoCRUD31(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID8().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        lastUpdatedDate: new Date(parsed2.lastUpdatedDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table4).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z9.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.message
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealerReportsAndScoresPostRoutes(app2) {
  createAutoCRUD31(app2, {
    endpoint: "dealer-reports-scores",
    table: dealerReportsAndScores,
    schema: insertDealerReportsAndScoresSchema,
    tableName: "Dealer Reports and Scores",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Dealer Reports and Scores POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/ratings.ts
import { z as z10 } from "zod";
function createAutoCRUD32(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const insertData = {
        ...parsed2,
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table4).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z10.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.message
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsPostRoutes(app2) {
  createAutoCRUD32(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating"
  });
  console.log("\u2705 Ratings POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/brand.ts
import { z as z11 } from "zod";
function createAutoCRUD33(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const autoValues = Object.fromEntries(
        Object.entries(autoFields).map(([k, fn]) => [k, fn()])
      );
      const validatedData = schema.parse({
        ...req.body,
        ...autoValues
      });
      const [newRecord] = await db.insert(table4).values(validatedData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z11.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupBrandsPostRoutes(app2) {
  createAutoCRUD33(app2, {
    endpoint: "brands",
    table: brands,
    schema: insertBrandSchema,
    tableName: "Brand",
    autoFields: {}
    // no timestamps here, just the raw insert
  });
  console.log("\u2705 Brands POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/salesOrder.ts
import { z as z12 } from "zod";
import { randomUUID as randomUUID9 } from "crypto";
var toYYYYMMDD = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "string") {
    const d = new Date(v);
    if (Number.isNaN(+d)) return v;
    return d.toISOString().slice(0, 10);
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
};
var toDecimalString = (v) => {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return String(n);
};
var nullIfEmpty = (v) => v == null || typeof v === "string" && v.trim() === "" ? null : String(v);
var salesOrderInputSchema = z12.object({
  // Relations
  userId: z12.coerce.number().int().optional().nullable(),
  dealerId: z12.string().max(255).optional().nullable().or(z12.literal("")),
  dvrId: z12.string().max(255).optional().nullable().or(z12.literal("")),
  pjpId: z12.string().max(255).optional().nullable().or(z12.literal("")),
  // Business
  orderDate: z12.union([z12.string(), z12.date()]),
  orderPartyName: z12.string().min(1, "orderPartyName is required"),
  // ... (all other fields) ...
  partyPhoneNo: z12.string().optional().nullable().or(z12.literal("")),
  partyArea: z12.string().optional().nullable().or(z12.literal("")),
  partyRegion: z12.string().optional().nullable().or(z12.literal("")),
  partyAddress: z12.string().optional().nullable().or(z12.literal("")),
  deliveryDate: z12.union([z12.string(), z12.date()]).optional().nullable(),
  deliveryArea: z12.string().optional().nullable().or(z12.literal("")),
  deliveryRegion: z12.string().optional().nullable().or(z12.literal("")),
  deliveryAddress: z12.string().optional().nullable().or(z12.literal("")),
  deliveryLocPincode: z12.string().optional().nullable().or(z12.literal("")),
  paymentMode: z12.string().optional().nullable().or(z12.literal("")),
  paymentTerms: z12.string().optional().nullable().or(z12.literal("")),
  paymentAmount: z12.union([z12.string(), z12.number()]).optional().nullable(),
  receivedPayment: z12.union([z12.string(), z12.number()]).optional().nullable(),
  receivedPaymentDate: z12.union([z12.string(), z12.date()]).optional().nullable(),
  pendingPayment: z12.union([z12.string(), z12.number()]).optional().nullable(),
  orderQty: z12.union([z12.string(), z12.number()]).optional().nullable(),
  orderUnit: z12.string().max(20).optional().nullable().or(z12.literal("")),
  itemPrice: z12.union([z12.string(), z12.number()]).optional().nullable(),
  discountPercentage: z12.union([z12.string(), z12.number()]).optional().nullable(),
  itemPriceAfterDiscount: z12.union([z12.string(), z12.number()]).optional().nullable(),
  itemType: z12.string().max(20).optional().nullable().or(z12.literal("")),
  itemGrade: z12.string().max(10).optional().nullable().or(z12.literal("")),
  // --- ✅ FIX ---
  status: z12.string().max(50).optional().default("Pending")
  // Added status
  // --- END FIX ---
});
function createAutoCRUD34(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const input = salesOrderInputSchema.parse(req.body);
      const dealerId = input.dealerId === "" ? null : input.dealerId ?? null;
      const dvrId = input.dvrId === "" ? null : input.dvrId ?? null;
      const pjpId = input.pjpId === "" ? null : input.pjpId ?? null;
      const orderDate = toYYYYMMDD(input.orderDate);
      if (!orderDate) {
        return res.status(400).json({ success: false, error: "orderDate is invalid" });
      }
      const deliveryDate = toYYYYMMDD(input.deliveryDate ?? null);
      const receivedPaymentDate = toYYYYMMDD(input.receivedPaymentDate ?? null);
      const paymentAmountStr = toDecimalString(input.paymentAmount);
      const receivedPaymentStr = toDecimalString(input.receivedPayment);
      let pendingPaymentStr = toDecimalString(input.pendingPayment);
      const orderQtyStr = toDecimalString(input.orderQty);
      const itemPriceStr = toDecimalString(input.itemPrice);
      const discountPctStr = toDecimalString(input.discountPercentage);
      let itemPriceAfterDiscountStr = toDecimalString(input.itemPriceAfterDiscount);
      if (pendingPaymentStr == null && paymentAmountStr != null && receivedPaymentStr != null) {
        const pa = Number(paymentAmountStr);
        const rp = Number(receivedPaymentStr);
        if (Number.isFinite(pa) && Number.isFinite(rp)) {
          pendingPaymentStr = String(pa - rp);
        }
      }
      if (itemPriceAfterDiscountStr == null && itemPriceStr != null && discountPctStr != null) {
        const p = Number(itemPriceStr);
        const d = Number(discountPctStr);
        if (Number.isFinite(p) && Number.isFinite(d)) {
          itemPriceAfterDiscountStr = String(p * (1 - d / 100));
        }
      }
      const insertData = {
        id: randomUUID9(),
        userId: input.userId ?? null,
        dealerId,
        dvrId,
        pjpId,
        orderDate,
        orderPartyName: input.orderPartyName,
        partyPhoneNo: nullIfEmpty(input.partyPhoneNo),
        partyArea: nullIfEmpty(input.partyArea),
        partyRegion: nullIfEmpty(input.partyRegion),
        partyAddress: nullIfEmpty(input.partyAddress),
        deliveryDate,
        deliveryArea: nullIfEmpty(input.deliveryArea),
        deliveryRegion: nullIfEmpty(input.deliveryRegion),
        deliveryAddress: nullIfEmpty(input.deliveryAddress),
        deliveryLocPincode: nullIfEmpty(input.deliveryLocPincode),
        paymentMode: nullIfEmpty(input.paymentMode),
        paymentTerms: nullIfEmpty(input.paymentTerms),
        paymentAmount: paymentAmountStr,
        receivedPayment: receivedPaymentStr,
        receivedPaymentDate,
        pendingPayment: pendingPaymentStr,
        orderQty: orderQtyStr,
        orderUnit: nullIfEmpty(input.orderUnit),
        itemPrice: itemPriceStr,
        discountPercentage: discountPctStr,
        itemPriceAfterDiscount: itemPriceAfterDiscountStr,
        itemType: nullIfEmpty(input.itemType),
        itemGrade: nullIfEmpty(input.itemGrade),
        // --- ✅ FIX ---
        status: input.status,
        // Add status to insert
        // --- END FIX ---
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [row] = await db.insert(table4).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: row
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z12.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues?.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          })) ?? []
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
}
function setupSalesOrdersPostRoutes(app2) {
  createAutoCRUD34(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    tableName: "Sales Order"
  });
  console.log("\u2705 Sales Orders POST endpoint (with status) ready");
}

// src/routes/formSubmissionRoutes/brandMapping.ts
import { z as z13 } from "zod";
function createAutoCRUD35(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4 } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const validated = schema.parse(req.body);
      const capacityStr = Number(validated.capacityMT).toFixed(2);
      const [newRecord] = await db.insert(table4).values({
        dealerId: validated.dealerId,
        brandId: validated.brandId,
        capacityMT: capacityStr
      }).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, {
        message: err?.message,
        code: err?.code,
        // SQLSTATE like 23503/23505 sometimes present
        constraint: err?.constraint,
        detail: err?.detail,
        hint: err?.hint,
        cause: err?.cause ?? err?.response ?? null,
        // stack of nested errors providers sometimes set here
        stack: err?.stack?.split("\n").slice(0, 5).join("\n")
      });
      if (err instanceof z13.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.errors });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23505" || msg.includes("duplicate") || msg.includes("dealer_brand_mapping_dealer_id_brand_id_unique") || msg.includes("dealer_brand_mapping_dealer_id_brand_id_key")) {
        return res.status(409).json({ success: false, error: "This dealer is already mapped to this brand" });
      }
      if (err?.code === "23503" || msg.includes("foreign key") || msg.includes("violates foreign key constraint")) {
        return res.status(400).json({ success: false, error: "Foreign key violation \u2014 dealer or brand does not exist", details: err?.detail ?? err?.message });
      }
      return res.status(500).json({ success: false, error: `Failed to create ${tableName4}`, details: err?.message ?? "Unknown error" });
    }
  });
}
function setupDealerBrandMappingPostRoutes(app2) {
  createAutoCRUD35(app2, {
    endpoint: "dealer-brand-mapping",
    table: dealerBrandMapping,
    schema: insertDealerBrandMappingSchema,
    tableName: "Dealer Brand Mapping"
  });
  console.log("\u2705 Dealer Brand Mapping POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/attendanceIn.ts
import { eq as eq43, and as and38 } from "drizzle-orm";
import { z as z14 } from "zod";
var attendanceInSchema = z14.object({
  userId: z14.number(),
  attendanceDate: z14.string().date().or(z14.string()),
  // accept Date or ISO string
  locationName: z14.string().min(1),
  inTimeImageCaptured: z14.boolean().optional(),
  inTimeImageUrl: z14.string().optional().nullable(),
  inTimeLatitude: z14.number(),
  inTimeLongitude: z14.number(),
  inTimeAccuracy: z14.number().optional().nullable(),
  inTimeSpeed: z14.number().optional().nullable(),
  inTimeHeading: z14.number().optional().nullable(),
  inTimeAltitude: z14.number().optional().nullable()
});
function setupAttendanceInPostRoutes(app2) {
  app2.post("/api/attendance/check-in", async (req, res) => {
    try {
      const parsed2 = attendanceInSchema.parse(req.body);
      const {
        userId,
        attendanceDate,
        locationName,
        inTimeImageCaptured,
        inTimeImageUrl,
        inTimeLatitude,
        inTimeLongitude,
        inTimeAccuracy,
        inTimeSpeed,
        inTimeHeading,
        inTimeAltitude
      } = parsed2;
      const dateObj = new Date(attendanceDate);
      const [existingAttendance] = await db.select().from(salesmanAttendance).where(
        and38(
          eq43(salesmanAttendance.userId, userId),
          eq43(salesmanAttendance.attendanceDate, dateObj)
        )
      ).limit(1);
      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          error: "User has already checked in today"
        });
      }
      const attendanceData = {
        userId,
        attendanceDate: dateObj,
        locationName,
        inTimeTimestamp: /* @__PURE__ */ new Date(),
        outTimeTimestamp: null,
        inTimeImageCaptured: inTimeImageCaptured ?? false,
        outTimeImageCaptured: false,
        inTimeImageUrl: inTimeImageUrl || null,
        outTimeImageUrl: null,
        inTimeLatitude,
        inTimeLongitude,
        inTimeAccuracy: inTimeAccuracy || null,
        inTimeSpeed: inTimeSpeed || null,
        inTimeHeading: inTimeHeading || null,
        inTimeAltitude: inTimeAltitude || null,
        outTimeLatitude: null,
        outTimeLongitude: null,
        outTimeAccuracy: null,
        outTimeSpeed: null,
        outTimeHeading: null,
        outTimeAltitude: null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [newAttendance] = await db.insert(salesmanAttendance).values(attendanceData).returning();
      res.status(201).json({
        success: true,
        message: "Check-in successful",
        data: newAttendance
      });
    } catch (error) {
      console.error("Attendance check-in error:", error);
      if (error instanceof z14.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to check in",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Attendance Check-In POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/attendanceOut.ts
import { eq as eq44, and as and39, isNull as isNull2 } from "drizzle-orm";
import { z as z15 } from "zod";
var attendanceOutSchema = z15.object({
  userId: z15.number(),
  attendanceDate: z15.string().or(z15.date()),
  // allow ISO string or Date
  outTimeImageCaptured: z15.boolean().optional(),
  outTimeImageUrl: z15.string().optional().nullable(),
  outTimeLatitude: z15.number().optional().nullable(),
  outTimeLongitude: z15.number().optional().nullable(),
  outTimeAccuracy: z15.number().optional().nullable(),
  outTimeSpeed: z15.number().optional().nullable(),
  outTimeHeading: z15.number().optional().nullable(),
  outTimeAltitude: z15.number().optional().nullable()
});
function setupAttendanceOutPostRoutes(app2) {
  app2.post("/api/attendance/check-out", async (req, res) => {
    try {
      const parsed2 = attendanceOutSchema.parse(req.body);
      const {
        userId,
        attendanceDate,
        outTimeImageCaptured,
        outTimeImageUrl,
        outTimeLatitude,
        outTimeLongitude,
        outTimeAccuracy,
        outTimeSpeed,
        outTimeHeading,
        outTimeAltitude
      } = parsed2;
      const dateObj = new Date(attendanceDate);
      const [existingAttendance] = await db.select().from(salesmanAttendance).where(
        and39(
          eq44(salesmanAttendance.userId, userId),
          eq44(salesmanAttendance.attendanceDate, dateObj),
          isNull2(salesmanAttendance.outTimeTimestamp)
        )
      ).limit(1);
      if (!existingAttendance) {
        return res.status(404).json({
          success: false,
          error: "No check-in record found for today or user has already checked out"
        });
      }
      const updateData = {
        outTimeTimestamp: /* @__PURE__ */ new Date(),
        outTimeImageCaptured: outTimeImageCaptured ?? false,
        outTimeImageUrl: outTimeImageUrl || null,
        outTimeLatitude: outTimeLatitude || null,
        outTimeLongitude: outTimeLongitude || null,
        outTimeAccuracy: outTimeAccuracy || null,
        outTimeSpeed: outTimeSpeed || null,
        outTimeHeading: outTimeHeading || null,
        outTimeAltitude: outTimeAltitude || null,
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [updatedAttendance] = await db.update(salesmanAttendance).set(updateData).where(eq44(salesmanAttendance.id, existingAttendance.id)).returning();
      res.json({
        success: true,
        message: "Check-out successful",
        data: updatedAttendance
      });
    } catch (error) {
      console.error("Attendance check-out error:", error);
      if (error instanceof z15.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to check out",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Attendance Check-Out POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/tsoMeetings.ts
import { z as z16 } from "zod";
import { randomUUID as randomUUID10 } from "crypto";
var toDateOnly4 = (d) => d.toISOString().slice(0, 10);
var nullableNumber = z16.coerce.number().positive().optional().nullable();
var meetingInputSchema = z16.object({
  createdByUserId: z16.coerce.number().int().positive(),
  type: z16.string().max(100).min(1, "Type is required"),
  date: z16.coerce.date(),
  location: z16.string().max(500).min(1, "Location is required"),
  budgetAllocated: nullableNumber,
  participantsCount: z16.coerce.number().int().positive().optional().nullable()
}).strict();
function setupTsoMeetingsPostRoutes(app2) {
  app2.post("/api/tso-meetings", async (req, res) => {
    try {
      const input = meetingInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID10(),
        // App-generated UUID
        createdByUserId: input.createdByUserId,
        type: input.type,
        date: toDateOnly4(input.date),
        // Normalize to YYYY-MM-DD
        location: input.location,
        // Handle numeric(12, 2) - Drizzle expects string
        budgetAllocated: input.budgetAllocated ? String(input.budgetAllocated) : null,
        participantsCount: input.participantsCount ?? null
      };
      const [record] = await db.insert(tsoMeetings).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: "TSO Meeting created successfully",
        data: record
      });
    } catch (error) {
      console.error("Create TSO Meeting error:", error);
      if (error instanceof z16.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to create TSO Meeting",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 TSO Meetings POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/masonOnMeeting.ts
import { z as z17 } from "zod";
var insertMasonsOnMeetingsSchema2 = z17.object({
  masonId: z17.string().uuid("Invalid Mason ID format. Expected UUID."),
  meetingId: z17.string().min(1, "Meeting ID is required.")
});
function setupMasonOnMeetingPostRoutes(app2) {
  app2.post("/api/masons-on-meetings", async (req, res) => {
    const tableName4 = "Mason on Meeting";
    try {
      const validated = insertMasonsOnMeetingsSchema2.parse(req.body);
      const [newRecord] = await db.insert(masonsOnMeetings).values({
        masonId: validated.masonId,
        meetingId: validated.meetingId
      }).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} relationship created successfully`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, {
        message: err?.message,
        code: err?.code,
        // SQLSTATE (e.g., 23505 for duplicate, 23503 for FK)
        constraint: err?.constraint,
        detail: err?.detail
      });
      if (err instanceof z17.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: err.errors
        });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23505" || msg.includes("duplicate key") || msg.includes("masons_on_meetings_pkey")) {
        return res.status(409).json({
          // 409 Conflict
          success: false,
          error: "This mason is already marked as attended for this meeting"
        });
      }
      if (err?.code === "23503" || msg.includes("foreign key constraint")) {
        return res.status(400).json({
          // 400 Bad Request
          success: false,
          error: "Foreign key violation: The specified mason or meeting does not exist",
          details: err?.detail ?? err?.message
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: err?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Masons on Meetings POST endpoint setup complete");
}

// src/routes/formSubmissionRoutes/masonOnScheme.ts
import { z as z18 } from "zod";
var insertMasonOnSchemeSchema2 = z18.object({
  masonId: z18.string().uuid("Invalid Mason ID format. Expected UUID."),
  schemeId: z18.string().uuid("Invalid Scheme ID format. Expected UUID."),
  status: z18.string().min(1, "Status is required.").optional().nullable()
  // Allow optional status
});
function setupMasonOnSchemePostRoutes(app2) {
  app2.post("/api/masons-on-scheme", async (req, res) => {
    const tableName4 = "Mason on Scheme";
    try {
      const validated = insertMasonOnSchemeSchema2.parse(req.body);
      const insertData = {
        masonId: validated.masonId,
        schemeId: validated.schemeId,
        ...validated.status && { status: validated.status }
        // Only add status if provided
      };
      const [newRecord] = await db.insert(masonOnScheme).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} enrollment created successfully`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, {
        message: err?.message,
        code: err?.code,
        // SQLSTATE (e.g., 23505 for duplicate, 23503 for FK)
        constraint: err?.constraint,
        detail: err?.detail
      });
      if (err instanceof z18.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: err.errors
        });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23505" || msg.includes("duplicate key") || msg.includes("mason_on_scheme_pkey")) {
        return res.status(409).json({
          // 409 Conflict
          success: false,
          error: "This mason is already enrolled in this scheme"
        });
      }
      if (err?.code === "23503" || msg.includes("foreign key constraint")) {
        return res.status(400).json({
          // 400 Bad Request
          success: false,
          error: "Foreign key violation: The specified mason or scheme does not exist",
          details: err?.detail ?? err?.message
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: err?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Masons on Scheme POST endpoint setup complete");
}

// src/routes/formSubmissionRoutes/masonpcSide.ts
import { z as z19 } from "zod";
import { randomUUID as randomUUID11 } from "crypto";

// src/utils/pointsCalcLogic.ts
var LOYALTY_CONSTANTS = {
  BASE_POINTS_PER_BAG: 1,
  REFERRAL_BONUS_POINTS: 100,
  REFERRAL_BAG_THRESHOLD: 200,
  BONANZA_ADDITIONAL_POINTS_PER_BAG: 3,
  // 4 Total - 1 Base = 3 Additional
  BONANZA_START_DATE: /* @__PURE__ */ new Date("2025-11-15T00:00:00.000Z"),
  // ⚠️ CORRECTED END DATE: from 15th Mar to 15th Jan 2026, based on image.
  BONANZA_END_DATE: /* @__PURE__ */ new Date("2026-01-15T23:59:59.999Z"),
  // Joining Bonus: "250 points" (15th Nov to 31st Mar 2026)
  JOINING_BONUS_POINTS: 250,
  JOINING_BONUS_START_DATE: /* @__PURE__ */ new Date("2025-11-15T00:00:00.000Z"),
  JOINING_BONUS_END_DATE: /* @__PURE__ */ new Date("2026-03-31T23:59:59.999Z"),
  // New end date
  // Extra Points: "Every 250 bags = +500 points" (15th Nov to 31st Mar 2026)
  EXTRA_BONUS_BAG_SLAB: 250,
  EXTRA_BONUS_POINTS: 500,
  EXTRA_BONUS_START_DATE: /* @__PURE__ */ new Date("2025-11-15T00:00:00.000Z"),
  EXTRA_BONUS_END_DATE: /* @__PURE__ */ new Date("2026-03-31T23:59:59.999Z")
  // New end date
};
function calculateJoiningBonusPoints() {
  const today = /* @__PURE__ */ new Date();
  const isJoiningPeriod = today >= LOYALTY_CONSTANTS.JOINING_BONUS_START_DATE && today <= LOYALTY_CONSTANTS.JOINING_BONUS_END_DATE;
  return isJoiningPeriod ? LOYALTY_CONSTANTS.JOINING_BONUS_POINTS : 0;
}
function calculateBaseAndBonanzaPoints(bagCount, purchaseDate) {
  let points = bagCount * LOYALTY_CONSTANTS.BASE_POINTS_PER_BAG;
  const isBonanzaPeriod = purchaseDate >= LOYALTY_CONSTANTS.BONANZA_START_DATE && purchaseDate <= LOYALTY_CONSTANTS.BONANZA_END_DATE;
  if (isBonanzaPeriod) {
    points += bagCount * LOYALTY_CONSTANTS.BONANZA_ADDITIONAL_POINTS_PER_BAG;
  }
  return points;
}
function calculateExtraBonusPoints(oldTotalBags, newBagCount, transactionDate) {
  const isExtraBonusPeriod = transactionDate >= LOYALTY_CONSTANTS.EXTRA_BONUS_START_DATE && transactionDate <= LOYALTY_CONSTANTS.EXTRA_BONUS_END_DATE;
  if (!isExtraBonusPeriod) {
    return 0;
  }
  const newTotalBags = oldTotalBags + newBagCount;
  const slab = LOYALTY_CONSTANTS.EXTRA_BONUS_BAG_SLAB;
  const oldSlabCount = Math.floor(oldTotalBags / slab);
  const newSlabCount = Math.floor(newTotalBags / slab);
  const slabsCrossed = newSlabCount - oldSlabCount;
  if (slabsCrossed <= 0) {
    return 0;
  }
  return slabsCrossed * LOYALTY_CONSTANTS.EXTRA_BONUS_POINTS;
}
function checkReferralBonusTrigger(oldTotalBags, newBagCount) {
  const threshold = LOYALTY_CONSTANTS.REFERRAL_BAG_THRESHOLD;
  const newTotalBags = oldTotalBags + newBagCount;
  const trigger = oldTotalBags < threshold && newTotalBags >= threshold;
  return trigger ? LOYALTY_CONSTANTS.REFERRAL_BONUS_POINTS : 0;
}

// src/routes/formSubmissionRoutes/masonpcSide.ts
var strOrNull4 = z19.preprocess((val) => {
  if (val === "") return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return val;
}, z19.string().nullable().optional());
var intOrNull2 = z19.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z19.number().int().nullable().optional());
var insertMasonPcSideSchema2 = z19.object({
  name: z19.string().min(1, "Name is required"),
  phoneNumber: z19.string().min(1, "Phone number is required"),
  kycDocumentName: strOrNull4,
  kycDocumentIdNum: strOrNull4,
  // UPDATED: Field renamed from verificationStatus to kycStatus
  kycStatus: strOrNull4,
  bagsLifted: intOrNull2,
  // pointsBalance is removed from the POST body as it's set by the server
  isReferred: z19.boolean().nullable().optional(),
  referredByUser: strOrNull4,
  referredToUser: strOrNull4,
  dealerId: strOrNull4,
  // Will be validated by DB foreign key
  userId: intOrNull2
  // Will be validated by DB foreign key
}).strict();
function setupMasonPcSidePostRoutes(app2) {
  app2.post("/api/masons", async (req, res) => {
    const tableName4 = "Mason";
    const joiningPoints = calculateJoiningBonusPoints();
    try {
      const validated = insertMasonPcSideSchema2.parse(req.body);
      const generatedMasonId = randomUUID11();
      let newRecord;
      let ledgerEntry;
      const transactionResult = await db.transaction(async (tx) => {
        const insertData = {
          id: generatedMasonId,
          // Use the generated ID
          name: validated.name,
          phoneNumber: validated.phoneNumber,
          kycDocumentName: validated.kycDocumentName ?? null,
          kycDocumentIdNum: validated.kycDocumentIdNum ?? null,
          kycStatus: validated.kycStatus ?? "pending",
          // Default to pending if not provided
          bagsLifted: validated.bagsLifted ?? 0,
          pointsBalance: joiningPoints,
          // <<<--- SET INITIAL BALANCE
          isReferred: validated.isReferred ?? null,
          referredByUser: validated.referredByUser ?? null,
          referredToUser: validated.referredToUser ?? null,
          dealerId: validated.dealerId ?? null,
          userId: validated.userId ?? null
        };
        const [mason] = await tx.insert(masonPcSide).values(insertData).returning();
        if (!mason) {
          tx.rollback();
          throw new Error("Failed to create new mason record.");
        }
        const [ledger] = await tx.insert(pointsLedger).values({
          id: randomUUID11(),
          masonId: generatedMasonId,
          sourceType: "adjustment",
          // Use 'adjustment' or similar for one-time bonuses
          sourceId: generatedMasonId,
          // Link ledger entry to the newly created Mason ID
          points: joiningPoints,
          memo: "Credit for one-time joining bonus"
        }).returning();
        if (!ledger) {
          tx.rollback();
          throw new Error("Failed to create joining bonus ledger entry.");
        }
        return { mason, ledger };
      });
      newRecord = transactionResult.mason;
      ledgerEntry = transactionResult.ledger;
      return res.status(201).json({
        success: true,
        message: `${tableName4} created successfully. Joining bonus of ${joiningPoints} points credited.`,
        data: newRecord,
        ledgerEntry
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, {
        message: err?.message,
        code: err?.code,
        constraint: err?.constraint,
        detail: err?.detail
      });
      if (err instanceof z19.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23503" || msg.includes("foreign key constraint")) {
        let field = "related record";
        if (msg.includes("mason_pc_side_dealer_id_fkey")) {
          field = "dealerId";
        } else if (msg.includes("mason_pc_side_user_id_fkey")) {
          field = "userId";
        }
        return res.status(400).json({
          success: false,
          error: `Foreign key violation: The specified ${field} does not exist.`,
          details: err?.detail ?? err?.message
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: err?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Masons POST endpoint setup complete (with Joining Bonus transaction)");
}

// src/routes/formSubmissionRoutes/schemesOffers.ts
import { z as z20 } from "zod";
var strOrNull5 = z20.preprocess((val) => {
  if (val === "") return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return val;
}, z20.string().nullable().optional());
var dateOrNull2 = z20.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  try {
    const d = new Date(String(val));
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}, z20.date().nullable().optional());
var insertSchemeOfferSchema = z20.object({
  name: z20.string().min(1, "Name is required"),
  description: strOrNull5,
  startDate: dateOrNull2,
  endDate: dateOrNull2
}).strict();
function setupSchemesOffersPostRoutes(app2) {
  app2.post("/api/schemes-offers", async (req, res) => {
    const tableName4 = "Scheme/Offer";
    try {
      const validated = insertSchemeOfferSchema.parse(req.body);
      const insertData = {
        name: validated.name,
        description: validated.description ?? null,
        startDate: validated.startDate ?? null,
        // Zod helper ensures this is a Date or null
        endDate: validated.endDate ?? null
        // Zod helper ensures this is a Date or null
      };
      const [newRecord] = await db.insert(schemesOffers).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, {
        message: err?.message,
        code: err?.code,
        detail: err?.detail
      });
      if (err instanceof z20.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: err?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Schemes/Offers POST endpoint setup complete");
}

// src/routes/formSubmissionRoutes/bagsLift.ts
import { z as z21 } from "zod";
import { randomUUID as randomUUID12 } from "crypto";
var bagLiftSubmissionSchema = insertBagLiftSchema.omit({
  id: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  pointsCredited: true,
  imageUrl: true
}).extend({
  // Renamed to 'masonId' for consistency, assuming it maps to masonPcSide.id
  masonId: z21.string().uuid({ message: "A valid Mason ID (UUID) is required." }),
  //dealerId: z.string().min(1, 'Dealer ID is required.'),
  // We coerce to Date, but ensure it's still treated as a timestamp/date
  purchaseDate: z21.string().transform((str) => new Date(str)),
  bagCount: z21.number().int().positive("Bag count must be a positive integer."),
  memo: z21.string().max(500).optional(),
  // Note: Not inserted, but validated
  imageUrl: z21.string().url({ message: "Invalid image URL" }).optional()
});
function setupBagLiftsPostRoute(app2) {
  app2.post("/api/bag-lifts", async (req, res) => {
    try {
      const validationResult = bagLiftSubmissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed for Bag Lift submission.",
          details: validationResult.error.errors
        });
      }
      const validatedData = validationResult.data;
      const { masonId, bagCount, purchaseDate, imageUrl, ...bagLiftBody } = validatedData;
      const calculatedPoints = calculateBaseAndBonanzaPoints(bagCount, purchaseDate);
      const generatedBagLiftId = randomUUID12();
      const insertData = {
        ...bagLiftBody,
        id: generatedBagLiftId,
        masonId,
        bagCount,
        purchaseDate,
        imageUrl,
        pointsCredited: calculatedPoints,
        // <<<--- Calculated on server via imported function
        status: "pending",
        approvedBy: null,
        approvedAt: null
      };
      const [newBagLift] = await db.insert(bagLifts).values(insertData).returning();
      if (!newBagLift) {
        throw new Error("Failed to insert new bag lift record.");
      }
      res.status(201).json({
        success: true,
        message: `Bag Lift successfully submitted for TSO approval. Calculated points: ${newBagLift.pointsCredited}.`,
        data: newBagLift
      });
    } catch (error) {
      console.error(`POST Bag Lift error:`, error);
      if (error instanceof z21.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create bag lift entry.`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Bag Lifts POST endpoint setup complete (Now defaults to PENDING status and calculates points securely using centralized logic)");
}

// src/routes/formSubmissionRoutes/rewardsRedemption.ts
import { z as z22 } from "zod";
import { randomUUID as randomUUID13 } from "crypto";
import { eq as eq45, sql as sql14 } from "drizzle-orm";
var redemptionSubmissionSchema = insertRewardRedemptionSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Explicitly define required fields and coercions
  masonId: z22.string().uuid({ message: "A valid Mason ID (UUID) is required." }),
  // Brand ID is an integer in the schema
  rewardId: z22.preprocess(
    (v) => typeof v === "string" ? parseInt(v, 10) : v,
    z22.number().int().positive("A valid Reward ID is required.")
  ),
  quantity: z22.number().int().positive("Quantity must be a positive integer.").default(1),
  pointsDebited: z22.number().int().positive("Points debited must be a positive integer."),
  // Optional delivery details
  deliveryName: z22.string().max(160).optional(),
  deliveryPhone: z22.string().max(20).optional(),
  deliveryAddress: z22.string().optional(),
  // Optional memo for the points ledger entry
  memo: z22.string().max(500).optional()
});
function setupRewardsRedemptionPostRoute(app2) {
  app2.post("/api/rewards-redemption", async (req, res) => {
    try {
      const validationResult = redemptionSubmissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed for Redemption submission.",
          details: validationResult.error.errors
        });
      }
      const validatedData = validationResult.data;
      const { masonId, pointsDebited, quantity, memo, ...redemptionBody } = validatedData;
      const totalPointsDebited = pointsDebited * quantity;
      const [masonRecord] = await db.select({
        pointsBalance: masonPcSide.pointsBalance
      }).from(masonPcSide).where(eq45(masonPcSide.id, masonId)).limit(1);
      if (!masonRecord) {
        return res.status(404).json({ success: false, error: "Mason not found." });
      }
      if (masonRecord.pointsBalance < totalPointsDebited) {
        return res.status(400).json({
          success: false,
          error: `Insufficient points balance. Required: ${totalPointsDebited}, Available: ${masonRecord.pointsBalance}.`
        });
      }
      const generatedRedemptionId = randomUUID13();
      const result = await db.transaction(async (tx) => {
        const [newRedemption] = await tx.insert(rewardRedemptions).values({
          ...redemptionBody,
          id: generatedRedemptionId,
          // Use the manually generated ID
          masonId,
          pointsDebited: totalPointsDebited,
          // Save the total points debited
          quantity,
          status: "placed"
          // Initial status
        }).returning();
        if (!newRedemption) {
          tx.rollback();
          throw new Error("Failed to insert new reward redemption record.");
        }
        const [newLedgerEntry] = await tx.insert(pointsLedger).values({
          masonId: newRedemption.masonId,
          sourceType: "redemption",
          sourceId: newRedemption.id,
          // Link to the newly created redemption ID
          // Points are NEGATIVE for a DEBIT
          points: -totalPointsDebited,
          memo: memo || `Debit for ${newRedemption.quantity} x Reward ID ${newRedemption.rewardId}`
        }).returning();
        if (!newLedgerEntry) {
          tx.rollback();
          throw new Error("Failed to insert corresponding points ledger entry (debit).");
        }
        await tx.update(masonPcSide).set({
          pointsBalance: sql14`${masonPcSide.pointsBalance} - ${totalPointsDebited}`
        }).where(eq45(masonPcSide.id, masonId));
        return { redemption: newRedemption, ledger: newLedgerEntry };
      });
      res.status(201).json({
        success: true,
        message: "Reward redemption successfully placed and points debited.",
        data: result.redemption,
        ledgerEntry: result.ledger
      });
    } catch (error) {
      console.error(`POST Reward Redemption error:`, error);
      if (error instanceof z22.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to place reward redemption.`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Rewards Redemption POST endpoint setup complete");
}

// src/routes/formSubmissionRoutes/kycSubmission.ts
import { z as z23 } from "zod";
import { randomUUID as randomUUID14 } from "crypto";
import { eq as eq46 } from "drizzle-orm";
var kycSubmissionSchema = z23.object({
  masonId: z23.string().uuid({ message: "A valid Mason ID (UUID) is required." }),
  aadhaarNumber: z23.string().max(20).optional().nullable(),
  panNumber: z23.string().max(20).optional().nullable(),
  voterIdNumber: z23.string().max(20).optional().nullable(),
  // Documents should be a JSON object of URLs/metadata
  documents: z23.object({
    aadhaarFrontUrl: z23.string().url().optional(),
    aadhaarBackUrl: z23.string().url().optional(),
    panUrl: z23.string().url().optional(),
    voterUrl: z23.string().url().optional()
  }).optional().nullable(),
  remark: z23.string().max(500).optional().nullable()
}).strict();
function setupKycSubmissionsPostRoute(app2) {
  app2.post("/api/kyc-submissions", async (req, res) => {
    const tableName4 = "KYC Submission";
    try {
      const input = kycSubmissionSchema.parse(req.body);
      const { masonId, documents, ...rest } = input;
      const [mason] = await db.select({ id: masonPcSide.id }).from(masonPcSide).where(eq46(masonPcSide.id, masonId)).limit(1);
      if (!mason) {
        return res.status(404).json({ success: false, error: "Mason not found." });
      }
      const [newRecord] = await db.transaction(async (tx) => {
        const [submission] = await tx.insert(kycSubmissions).values({
          id: randomUUID14(),
          masonId,
          ...rest,
          // Convert JS object to JSON string for Postgres
          documents: documents ? JSON.stringify(documents) : null,
          status: "pending"
          // Default status on submission
        }).returning();
        await tx.update(masonPcSide).set({ kycStatus: "pending" }).where(eq46(masonPcSide.id, masonId));
        return [submission];
      });
      return res.status(201).json({
        success: true,
        message: `${tableName4} submitted successfully and awaiting TSO approval.`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, err);
      if (err instanceof z23.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.errors });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: err?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 KYC Submissions POST endpoint setup complete");
}

// src/routes/formSubmissionRoutes/rewards.ts
import { z as z24 } from "zod";
var newRewardSchema = insertRewardsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Coerce categoryId from string to number
  categoryId: z24.preprocess(
    (v) => typeof v === "string" ? parseInt(v, 10) : v,
    z24.number().int().positive("Category ID must be a positive integer.")
  ),
  // Numeric fields for point cost and quantity/stock
  pointCost: z24.coerce.number().int().positive("Point cost must be a positive integer."),
  totalAvailableQuantity: z24.coerce.number().int().nonnegative("Total quantity cannot be negative."),
  stock: z24.coerce.number().int().nonnegative("Stock cannot be negative."),
  // Meta is jsonb, allow object or stringified json
  meta: z24.any().optional().nullable(),
  isActive: z24.boolean().optional().default(true)
}).strict();
function setupRewardsPostRoute(app2) {
  app2.post("/api/rewards", async (req, res) => {
    const tableName4 = "Reward";
    try {
      const input = newRewardSchema.parse(req.body);
      const [newRecord] = await db.insert(rewards).values({
        ...input,
        // Drizzle needs JSON objects or strings for JSONB.
        meta: input.meta ? JSON.stringify(input.meta) : null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} added to catalogue successfully`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName4} error:`, err);
      if (err instanceof z24.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: err.errors
        });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23505" || msg.includes("unique constraint")) {
        return res.status(409).json({ success: false, error: "Reward name already exists" });
      }
      if (err?.code === "23503" || msg.includes("foreign key constraint")) {
        return res.status(400).json({ success: false, error: "Foreign key violation: Invalid categoryId.", details: err?.detail });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: err?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Rewards POST endpoint setup complete");
}

// src/routes/formSubmissionRoutes/technicalSites.ts
import { z as z25 } from "zod";
import { randomUUID as randomUUID15 } from "crypto";
function createAutoCRUD36(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4 } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const parsed2 = schema.safeParse(req.body);
      if (!parsed2.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed for Technical Site submission.",
          details: parsed2.error.errors
        });
      }
      const validatedData = parsed2.data;
      const generatedId = randomUUID15();
      const insertData = {
        ...validatedData,
        id: generatedId,
        // Drizzle will handle the default timestamps (createdAt/updatedAt) if not provided,
        // but it's often safer to explicitly cast/set Date fields from Zod strings.
        constructionStartDate: validatedData.constructionStartDate ? new Date(validatedData.constructionStartDate) : null,
        constructionEndDate: validatedData.constructionEndDate ? new Date(validatedData.constructionEndDate) : null,
        firstVistDate: validatedData.firstVistDate ? new Date(validatedData.firstVistDate) : null,
        lastVisitDate: validatedData.lastVisitDate ? new Date(validatedData.lastVisitDate) : null
      };
      const [newRecord] = await db.insert(table4).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName4} created successfully with ID ${newRecord.id}`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
      if (error instanceof z25.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      const msg = String(error?.message ?? "").toLowerCase();
      if (error?.code === "23503" || msg.includes("violates foreign key constraint")) {
        return res.status(400).json({ success: false, error: "Foreign Key violation: Related Dealer/Mason/PC ID does not exist." });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupTechnicalSitesPostRoutes(app2) {
  createAutoCRUD36(app2, {
    endpoint: "technical-sites",
    table: technicalSites,
    schema: insertTechnicalSiteSchema,
    tableName: "Technical Site"
  });
  console.log("\u2705 Technical Sites POST endpoint setup complete");
}

// src/routes/updateRoutes/dealers.ts
import { eq as eq47 } from "drizzle-orm";
import { z as z26 } from "zod";
var strOrNull6 = z26.preprocess((val) => {
  if (val === "" || val === void 0) return null;
  if (val === null) return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return String(val);
}, z26.string().nullable().optional());
var dateOrNull3 = z26.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}, z26.date().nullable().optional());
var numOrNull3 = z26.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z26.number().nullable().optional());
var intOrNull3 = z26.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z26.number().int().nullable().optional());
var toStringArray4 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    return t.includes(",") ? t.split(",").map((s) => s.trim()).filter(Boolean) : [t];
  }
  return [];
};
var toDateOnlyString2 = (d) => {
  if (!d) return null;
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};
var dealerBaseSchema = z26.object({
  userId: intOrNull3,
  type: z26.string().min(1),
  parentDealerId: strOrNull6,
  name: z26.string().min(1),
  region: z26.string().min(1),
  area: z26.string().min(1),
  phoneNo: z26.string().min(1),
  address: z26.string().min(1),
  pinCode: strOrNull6,
  // numeric coords
  latitude: numOrNull3,
  longitude: numOrNull3,
  dateOfBirth: dateOrNull3,
  anniversaryDate: dateOrNull3,
  // numeric potentials
  totalPotential: z26.coerce.number(),
  bestPotential: z26.coerce.number(),
  brandSelling: z26.preprocess(toStringArray4, z26.array(z26.string()).min(1)),
  feedbacks: z26.string().min(1),
  remarks: strOrNull6,
  dealerDevelopmentStatus: strOrNull6,
  dealerDevelopmentObstacle: strOrNull6,
  salesGrowthPercentage: numOrNull3,
  noOfPJP: intOrNull3,
  verificationStatus: z26.enum(["PENDING", "VERIFIED"]).optional(),
  whatsappNo: strOrNull6,
  emailId: z26.preprocess((val) => val === "" ? null : val, z26.string().email().nullable().optional()),
  businessType: strOrNull6,
  // --- ✅ NEW FIELDS ADDED ---
  nameOfFirm: strOrNull6,
  underSalesPromoterName: strOrNull6,
  // --- END NEW FIELDS ---
  gstinNo: strOrNull6,
  panNo: strOrNull6,
  tradeLicNo: strOrNull6,
  aadharNo: strOrNull6,
  godownSizeSqFt: intOrNull3,
  godownCapacityMTBags: strOrNull6,
  godownAddressLine: strOrNull6,
  godownLandMark: strOrNull6,
  godownDistrict: strOrNull6,
  godownArea: strOrNull6,
  godownRegion: strOrNull6,
  godownPinCode: strOrNull6,
  residentialAddressLine: strOrNull6,
  residentialLandMark: strOrNull6,
  residentialDistrict: strOrNull6,
  residentialArea: strOrNull6,
  residentialRegion: strOrNull6,
  residentialPinCode: strOrNull6,
  bankAccountName: strOrNull6,
  bankName: strOrNull6,
  bankBranchAddress: strOrNull6,
  bankAccountNumber: strOrNull6,
  bankIfscCode: strOrNull6,
  brandName: strOrNull6,
  monthlySaleMT: numOrNull3,
  noOfDealers: intOrNull3,
  areaCovered: strOrNull6,
  projectedMonthlySalesBestCementMT: numOrNull3,
  noOfEmployeesInSales: intOrNull3,
  declarationName: strOrNull6,
  declarationPlace: strOrNull6,
  declarationDate: dateOrNull3,
  tradeLicencePicUrl: strOrNull6,
  shopPicUrl: strOrNull6,
  dealerPicUrl: strOrNull6,
  blankChequePicUrl: strOrNull6,
  partnershipDeedPicUrl: strOrNull6
});
var dealerUpdateSchema = dealerBaseSchema.partial().extend({
  // Optional geofence radius for Radar circle
  radius: z26.preprocess((v) => v === "" ? void 0 : v, z26.coerce.number().min(10).max(1e4).optional())
}).strict();
async function upsertRadarGeofence(dealer, radius) {
  if (!process.env.RADAR_SECRET_KEY) {
    throw new Error("RADAR_SECRET_KEY is not configured");
  }
  const lat = dealer.latitude;
  const lng = dealer.longitude;
  if (typeof lat !== "number" || isNaN(lat) || typeof lng !== "number" || isNaN(lng)) {
    throw new Error("Dealer latitude/longitude missing or invalid for geofence update");
  }
  const tag = "dealer";
  const externalId = `dealer:${dealer.id}`;
  const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;
  const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
  const finalRadius = Math.min(1e4, Math.max(10, radius ?? 25));
  const form = new URLSearchParams();
  form.set("description", description);
  form.set("type", "circle");
  form.set("coordinates", JSON.stringify([lng, lat]));
  form.set("radius", String(finalRadius));
  const metadata = {
    dealerId: String(dealer.id),
    ...dealer.userId != null ? { userId: String(dealer.userId) } : {},
    ...dealer.region ? { region: dealer.region } : {},
    ...dealer.area ? { area: dealer.area } : {},
    ...dealer.phoneNo ? { phoneNo: dealer.phoneNo } : {},
    ...dealer.verificationStatus ? { verificationStatus: dealer.verificationStatus } : {},
    // --- ✅ NEW FIELDS ADDED ---
    ...dealer.nameOfFirm ? { nameOfFirm: dealer.nameOfFirm } : {},
    ...dealer.underSalesPromoterName ? { promoterName: dealer.underSalesPromoterName } : {}
    // --- END NEW FIELDS ---
  };
  if (Object.keys(metadata).length) {
    form.set("metadata", JSON.stringify(metadata));
  }
  const upRes = await fetch(radarUrl, {
    method: "PUT",
    headers: {
      Authorization: process.env.RADAR_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });
  const upJson = await upRes.json().catch(() => ({}));
  if (!upRes.ok || upJson?.meta?.code !== 200 || !upJson?.geofence) {
    throw new Error(upJson?.meta?.message || upJson?.message || "Failed to upsert dealer geofence in Radar");
  }
  return upJson.geofence;
}
function setupDealersPatchRoutes(app2) {
  app2.patch("/api/dealers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = dealerUpdateSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existingDealer] = await db.select().from(dealers).where(eq47(dealers.id, id)).limit(1);
      if (!existingDealer) {
        return res.status(404).json({ success: false, error: `Dealer with ID '${id}' not found.` });
      }
      const patch = {};
      if (input.userId !== void 0) patch.userId = input.userId;
      if (input.type !== void 0) patch.type = input.type;
      if (input.parentDealerId !== void 0) patch.parentDealerId = input.parentDealerId;
      if (input.name !== void 0) patch.name = input.name;
      if (input.region !== void 0) patch.region = input.region;
      if (input.area !== void 0) patch.area = input.area;
      if (input.phoneNo !== void 0) patch.phoneNo = input.phoneNo;
      if (input.address !== void 0) patch.address = input.address;
      if (input.pinCode !== void 0) patch.pinCode = input.pinCode;
      if (input.latitude !== void 0) patch.latitude = input.latitude === null ? null : input.latitude;
      if (input.longitude !== void 0) patch.longitude = input.longitude === null ? null : input.longitude;
      if (input.dateOfBirth !== void 0) patch.dateOfBirth = toDateOnlyString2(input.dateOfBirth);
      if (input.anniversaryDate !== void 0) patch.anniversaryDate = toDateOnlyString2(input.anniversaryDate);
      if (input.totalPotential !== void 0) patch.totalPotential = input.totalPotential;
      if (input.bestPotential !== void 0) patch.bestPotential = input.bestPotential;
      if (input.brandSelling !== void 0) patch.brandSelling = input.brandSelling;
      if (input.feedbacks !== void 0) patch.feedbacks = input.feedbacks;
      if (input.remarks !== void 0) patch.remarks = input.remarks;
      if (input.dealerDevelopmentStatus !== void 0) patch.dealerDevelopmentStatus = input.dealerDevelopmentStatus;
      if (input.dealerDevelopmentObstacle !== void 0) patch.dealerDevelopmentObstacle = input.dealerDevelopmentObstacle;
      if (input.salesGrowthPercentage !== void 0) patch.salesGrowthPercentage = input.salesGrowthPercentage ?? null;
      if (input.noOfPJP !== void 0) patch.noOfPJP = input.noOfPJP;
      if (input.verificationStatus !== void 0) patch.verificationStatus = input.verificationStatus;
      if (input.whatsappNo !== void 0) patch.whatsappNo = input.whatsappNo;
      if (input.emailId !== void 0) patch.emailId = input.emailId;
      if (input.businessType !== void 0) patch.businessType = input.businessType;
      if (input.nameOfFirm !== void 0) patch.nameOfFirm = input.nameOfFirm;
      if (input.underSalesPromoterName !== void 0) patch.underSalesPromoterName = input.underSalesPromoterName;
      if (input.gstinNo !== void 0) patch.gstinNo = input.gstinNo;
      if (input.panNo !== void 0) patch.panNo = input.panNo;
      if (input.tradeLicNo !== void 0) patch.tradeLicNo = input.tradeLicNo;
      if (input.aadharNo !== void 0) patch.aadharNo = input.aadharNo;
      if (input.godownSizeSqFt !== void 0) patch.godownSizeSqFt = input.godownSizeSqFt;
      if (input.godownCapacityMTBags !== void 0) patch.godownCapacityMTBags = input.godownCapacityMTBags;
      if (input.godownAddressLine !== void 0) patch.godownAddressLine = input.godownAddressLine;
      if (input.godownLandMark !== void 0) patch.godownLandMark = input.godownLandMark;
      if (input.godownDistrict !== void 0) patch.godownDistrict = input.godownDistrict;
      if (input.godownArea !== void 0) patch.godownArea = input.godownArea;
      if (input.godownRegion !== void 0) patch.godownRegion = input.godownRegion;
      if (input.godownPinCode !== void 0) patch.godownPinCode = input.godownPinCode;
      if (input.residentialAddressLine !== void 0) patch.residentialAddressLine = input.residentialAddressLine;
      if (input.residentialLandMark !== void 0) patch.residentialLandMark = input.residentialLandMark;
      if (input.residentialDistrict !== void 0) patch.residentialDistrict = input.residentialDistrict;
      if (input.residentialArea !== void 0) patch.residentialArea = input.residentialArea;
      if (input.residentialRegion !== void 0) patch.residentialRegion = input.residentialRegion;
      if (input.residentialPinCode !== void 0) patch.residentialPinCode = input.residentialPinCode;
      if (input.bankAccountName !== void 0) patch.bankAccountName = input.bankAccountName;
      if (input.bankName !== void 0) patch.bankName = input.bankName;
      if (input.bankBranchAddress !== void 0) patch.bankBranchAddress = input.bankBranchAddress;
      if (input.bankAccountNumber !== void 0) patch.bankAccountNumber = input.bankAccountNumber;
      if (input.bankIfscCode !== void 0) patch.bankIfscCode = input.bankIfscCode;
      if (input.brandName !== void 0) patch.brandName = input.brandName;
      if (input.monthlySaleMT !== void 0) patch.monthlySaleMT = input.monthlySaleMT ?? null;
      if (input.noOfDealers !== void 0) patch.noOfDealers = input.noOfDealers;
      if (input.areaCovered !== void 0) patch.areaCovered = input.areaCovered;
      if (input.projectedMonthlySalesBestCementMT !== void 0) patch.projectedMonthlySalesBestCementMT = input.projectedMonthlySalesBestCementMT ?? null;
      if (input.noOfEmployeesInSales !== void 0) patch.noOfEmployeesInSales = input.noOfEmployeesInSales;
      if (input.declarationName !== void 0) patch.declarationName = input.declarationName;
      if (input.declarationPlace !== void 0) patch.declarationPlace = input.declarationPlace;
      if (input.declarationDate !== void 0) patch.declarationDate = toDateOnlyString2(input.declarationDate);
      if (input.tradeLicencePicUrl !== void 0) patch.tradeLicencePicUrl = input.tradeLicencePicUrl;
      if (input.shopPicUrl !== void 0) patch.shopPicUrl = input.shopPicUrl;
      if (input.dealerPicUrl !== void 0) patch.dealerPicUrl = input.dealerPicUrl;
      if (input.blankChequePicUrl !== void 0) patch.blankChequePicUrl = input.blankChequePicUrl;
      if (input.partnershipDeedPicUrl !== void 0) patch.partnershipDeedPicUrl = input.partnershipDeedPicUrl;
      const radarUpdateNeeded = input.latitude !== void 0 || input.longitude !== void 0 || input.name !== void 0 || input.radius !== void 0;
      let geofenceRef = void 0;
      if (radarUpdateNeeded) {
        const nextLat = input.latitude ?? (existingDealer.latitude != null ? Number(existingDealer.latitude) : null);
        const nextLng = input.longitude ?? (existingDealer.longitude != null ? Number(existingDealer.longitude) : null);
        const updatedDealerForRadar = {
          ...existingDealer,
          ...patch,
          latitude: nextLat,
          longitude: nextLng
        };
        try {
          geofenceRef = await upsertRadarGeofence(updatedDealerForRadar, input.radius);
        } catch (radarError) {
          return res.status(502).json({
            success: false,
            error: "Failed to update Radar geofence",
            details: radarError?.message ?? "Unknown Radar error"
          });
        }
      }
      patch.updatedAt = /* @__PURE__ */ new Date();
      const [updatedDealer] = await db.update(dealers).set(patch).where(eq47(dealers.id, id)).returning();
      return res.json({
        success: true,
        message: "Dealer updated successfully",
        data: updatedDealer,
        geofenceRef: geofenceRef ? { id: geofenceRef._id, tag: geofenceRef.tag, externalId: geofenceRef.externalId } : "not_updated"
      });
    } catch (error) {
      if (error instanceof z26.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update Dealer error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update dealer",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Dealers PATCH endpoints + Radar update logic setup complete");
}

// src/routes/updateRoutes/pjp.ts
import { eq as eq48 } from "drizzle-orm";
import { z as z27 } from "zod";
var toDateOnly5 = (d) => d.toISOString().slice(0, 10);
var strOrNull7 = z27.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z27.string().nullable().optional());
var pjpPatchSchema = z27.object({
  userId: z27.coerce.number().int().positive().optional(),
  createdById: z27.coerce.number().int().positive().optional(),
  // --- ✅ FIX ---
  dealerId: strOrNull7,
  // Replaced visitDealerName
  // --- END FIX ---
  planDate: z27.coerce.date().optional(),
  areaToBeVisited: z27.string().max(500).optional(),
  description: z27.string().max(500).optional().nullable(),
  // Allow regular null
  status: z27.string().max(50).optional(),
  verificationStatus: z27.string().max(50).optional().nullable(),
  additionalVisitRemarks: z27.string().max(500).optional().nullable()
}).strict();
function setupPjpPatchRoutes(app2) {
  app2.patch("/api/pjp/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = pjpPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select({ id: permanentJourneyPlans.id }).from(permanentJourneyPlans).where(eq48(permanentJourneyPlans.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `PJP with ID '${id}' not found.`
        });
      }
      const patch = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.userId !== void 0) patch.userId = input.userId;
      if (input.createdById !== void 0) patch.createdById = input.createdById;
      if (input.dealerId !== void 0) patch.dealerId = input.dealerId;
      if (input.planDate !== void 0) patch.planDate = toDateOnly5(input.planDate);
      if (input.areaToBeVisited !== void 0) patch.areaToBeVisited = input.areaToBeVisited;
      if (input.status !== void 0) patch.status = input.status;
      if (input.description !== void 0) patch.description = input.description;
      if (input.verificationStatus !== void 0) patch.verificationStatus = input.verificationStatus;
      if (input.additionalVisitRemarks !== void 0) patch.additionalVisitRemarks = input.additionalVisitRemarks;
      const [updated] = await db.update(permanentJourneyPlans).set(patch).where(eq48(permanentJourneyPlans.id, id)).returning();
      return res.json({
        success: true,
        message: "Permanent Journey Plan updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z27.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update PJP error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update PJP"
      });
    }
  });
  console.log("\u2705 PJP PATCH endpoints (using dealerId) setup complete");
}

// src/routes/updateRoutes/dailytask.ts
import { eq as eq49 } from "drizzle-orm";
import { z as z28 } from "zod";
var dailyTaskUpdateSchema = insertDailyTaskSchema.partial();
function setupDailyTaskPatchRoutes(app2) {
  app2.patch("/api/daily-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = dailyTaskUpdateSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update were provided."
        });
      }
      const [existingTask] = await db.select().from(dailyTasks).where(eq49(dailyTasks.id, id)).limit(1);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: `Daily Task with ID '${id}' not found.`
        });
      }
      const [updatedTask] = await db.update(dailyTasks).set({
        ...validatedData,
        updatedAt: /* @__PURE__ */ new Date()
        // Automatically update the timestamp
      }).where(eq49(dailyTasks.id, id)).returning();
      res.json({
        success: true,
        message: "Daily Task updated successfully",
        data: updatedTask
      });
    } catch (error) {
      if (error instanceof z28.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update Daily Task error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update Daily Task",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Daily Tasks PATCH endpoints setup complete");
}

// src/routes/updateRoutes/brandMapping.ts
import { eq as eq50 } from "drizzle-orm";
import { z as z29 } from "zod";
var mappingUpdateSchema = insertDealerBrandMappingSchema.pick({ capacityMT: true });
function setupDealerBrandMappingPatchRoutes(app2) {
  app2.patch("/api/dealer-brand-mapping/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = mappingUpdateSchema.parse(req.body);
      const [existingMapping] = await db.select().from(dealerBrandMapping).where(eq50(dealerBrandMapping.id, id)).limit(1);
      if (!existingMapping) {
        return res.status(404).json({
          success: false,
          error: `Dealer Brand Mapping with ID '${id}' not found.`
        });
      }
      const [updatedMapping] = await db.update(dealerBrandMapping).set({
        capacityMT: validatedData.capacityMT
      }).where(eq50(dealerBrandMapping.id, id)).returning();
      res.json({
        success: true,
        message: "Dealer Brand Mapping updated successfully",
        data: updatedMapping
      });
    } catch (error) {
      if (error instanceof z29.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update Dealer Brand Mapping error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update Dealer Brand Mapping",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Dealer Brand Mapping PATCH endpoints setup complete");
}

// src/routes/updateRoutes/brands.ts
import { eq as eq51 } from "drizzle-orm";
import { z as z30 } from "zod";
var brandUpdateSchema = insertBrandSchema.pick({ name: true });
function setupBrandsPatchRoutes(app2) {
  app2.patch("/api/brands/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid brand ID." });
      }
      const validatedData = brandUpdateSchema.parse(req.body);
      const [existingBrand] = await db.select().from(brands).where(eq51(brands.id, id)).limit(1);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          error: `Brand with ID '${id}' not found.`
        });
      }
      const [updatedBrand] = await db.update(brands).set({
        name: validatedData.name
      }).where(eq51(brands.id, id)).returning();
      res.json({
        success: true,
        message: "Brand updated successfully",
        data: updatedBrand
      });
    } catch (error) {
      if (error instanceof z30.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update Brand error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update brand",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Brands PATCH endpoints setup complete");
}

// src/routes/updateRoutes/ratings.ts
import { eq as eq52 } from "drizzle-orm";
import { z as z31 } from "zod";
var ratingUpdateSchema = insertRatingSchema.pick({ rating: true });
function setupRatingsPatchRoutes(app2) {
  app2.patch("/api/ratings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid rating ID." });
      }
      const validatedData = ratingUpdateSchema.parse(req.body);
      const [existingRating] = await db.select().from(ratings).where(eq52(ratings.id, id)).limit(1);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: `Rating with ID '${id}' not found.`
        });
      }
      const [updatedRating] = await db.update(ratings).set({
        rating: validatedData.rating
      }).where(eq52(ratings.id, id)).returning();
      res.json({
        success: true,
        message: "Rating updated successfully",
        data: updatedRating
      });
    } catch (error) {
      if (error instanceof z31.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update Rating error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update rating",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Ratings PATCH endpoints setup complete");
}

// src/routes/updateRoutes/dealerReportandScores.ts
import { eq as eq53 } from "drizzle-orm";
import { z as z32 } from "zod";
var dealerScoresUpdateSchema = insertDealerReportsAndScoresSchema.partial();
function setupDealerScoresPatchRoutes(app2) {
  app2.patch("/api/dealer-reports-scores/:dealerId", async (req, res) => {
    try {
      const { dealerId } = req.params;
      const validatedData = dealerScoresUpdateSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update were provided."
        });
      }
      const [existingRecord] = await db.select().from(dealerReportsAndScores).where(eq53(dealerReportsAndScores.dealerId, dealerId)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `Dealer scores for Dealer ID '${dealerId}' not found.`
        });
      }
      const [updatedRecord] = await db.update(dealerReportsAndScores).set({
        ...validatedData,
        lastUpdatedDate: /* @__PURE__ */ new Date(),
        // Always update the lastUpdatedDate
        updatedAt: /* @__PURE__ */ new Date()
        // Always update the timestamp
      }).where(eq53(dealerReportsAndScores.dealerId, dealerId)).returning();
      res.json({
        success: true,
        message: "Dealer scores updated successfully",
        data: updatedRecord
      });
    } catch (error) {
      if (error instanceof z32.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update Dealer Scores error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update dealer scores",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Dealer Reports and Scores PATCH endpoints setup complete");
}

// src/routes/updateRoutes/dvr.ts
import { eq as eq54 } from "drizzle-orm";
import { z as z33 } from "zod";
var toDateOnly6 = (d) => d.toISOString().slice(0, 10);
var toStringArray5 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s.includes(",") ? s.split(",").map((t) => t.trim()).filter(Boolean) : [s];
  }
  return [];
};
var strOrNull8 = z33.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z33.string().nullable().optional());
var numOrNull4 = z33.preprocess((val) => val === "" || val === null || val === void 0 ? null : val, z33.coerce.number().nullable().optional());
var dvrPatchSchema = z33.object({
  // --- ✅ FIX ---
  dealerId: strOrNull8,
  subDealerId: strOrNull8,
  // --- END FIX ---
  userId: z33.coerce.number().int().positive().optional(),
  reportDate: z33.coerce.date().optional(),
  dealerType: z33.string().max(50).optional(),
  // dealerName: nullableString, // <-- REMOVED
  // subDealerName: nullableString, // <-- REMOVED
  location: z33.string().max(500).optional(),
  latitude: z33.coerce.number().optional(),
  longitude: z33.coerce.number().optional(),
  visitType: z33.string().max(50).optional(),
  dealerTotalPotential: z33.coerce.number().optional(),
  dealerBestPotential: z33.coerce.number().optional(),
  brandSelling: z33.preprocess(toStringArray5, z33.array(z33.string()).min(1)).optional(),
  contactPerson: strOrNull8,
  contactPersonPhoneNo: strOrNull8,
  todayOrderMt: z33.coerce.number().optional(),
  todayCollectionRupees: z33.coerce.number().optional(),
  overdueAmount: numOrNull4,
  feedbacks: z33.string().max(500).min(1).optional(),
  solutionBySalesperson: strOrNull8,
  anyRemarks: strOrNull8,
  checkInTime: z33.coerce.date().optional(),
  checkOutTime: z33.coerce.date().nullable().optional(),
  timeSpentinLoc: strOrNull8,
  inTimeImageUrl: strOrNull8,
  outTimeImageUrl: strOrNull8,
  pjpId: z33.string().max(255).nullable().optional()
}).strict();
function setupDailyVisitReportsPatchRoutes(app2) {
  app2.patch("/api/daily-visit-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = dvrPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select({ id: dailyVisitReports.id }).from(dailyVisitReports).where(eq54(dailyVisitReports.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `DVR with ID '${id}' not found.`
        });
      }
      const patch = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.dealerId !== void 0) patch.dealerId = input.dealerId;
      if (input.subDealerId !== void 0) patch.subDealerId = input.subDealerId;
      if (input.userId !== void 0) patch.userId = input.userId;
      if (input.reportDate !== void 0) patch.reportDate = toDateOnly6(input.reportDate);
      if (input.dealerType !== void 0) patch.dealerType = input.dealerType;
      if (input.location !== void 0) patch.location = input.location;
      if (input.visitType !== void 0) patch.visitType = input.visitType;
      if (input.latitude !== void 0) patch.latitude = String(input.latitude);
      if (input.longitude !== void 0) patch.longitude = String(input.longitude);
      if (input.dealerTotalPotential !== void 0) patch.dealerTotalPotential = String(input.dealerTotalPotential);
      if (input.dealerBestPotential !== void 0) patch.dealerBestPotential = String(input.dealerBestPotential);
      if (input.todayOrderMt !== void 0) patch.todayOrderMt = String(input.todayOrderMt);
      if (input.todayCollectionRupees !== void 0) patch.todayCollectionRupees = String(input.todayCollectionRupees);
      if (input.overdueAmount !== void 0) patch.overdueAmount = input.overdueAmount ? String(input.overdueAmount) : null;
      if (input.brandSelling !== void 0) patch.brandSelling = input.brandSelling;
      if (input.contactPerson !== void 0) patch.contactPerson = input.contactPerson;
      if (input.contactPersonPhoneNo !== void 0) patch.contactPersonPhoneNo = input.contactPersonPhoneNo;
      if (input.feedbacks !== void 0) patch.feedbacks = input.feedbacks;
      if (input.solutionBySalesperson !== void 0) patch.solutionBySalesperson = input.solutionBySalesperson;
      if (input.anyRemarks !== void 0) patch.anyRemarks = input.anyRemarks;
      if (input.checkInTime !== void 0) patch.checkInTime = input.checkInTime;
      if (input.checkOutTime !== void 0) patch.checkOutTime = input.checkOutTime;
      if (input.timeSpentinLoc !== void 0) patch.timeSpentinLoc = input.timeSpentinLoc;
      if (input.inTimeImageUrl !== void 0) patch.inTimeImageUrl = input.inTimeImageUrl;
      if (input.outTimeImageUrl !== void 0) patch.outTimeImageUrl = input.outTimeImageUrl;
      if (input.pjpId !== void 0) patch.pjpId = input.pjpId;
      const [updated] = await db.update(dailyVisitReports).set(patch).where(eq54(dailyVisitReports.id, id)).returning();
      return res.json({
        success: true,
        message: "Daily Visit Report updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z33.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update DVR error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update DVR"
      });
    }
  });
  console.log("\u2705 DVR PATCH endpoints (using dealerId) setup complete");
}

// src/routes/updateRoutes/tvr.ts
import { eq as eq55 } from "drizzle-orm";
import { z as z34 } from "zod";
var toDateOnly7 = (d) => d.toISOString().slice(0, 10);
var toStringArray6 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s.includes(",") ? s.split(",").map((t) => t.trim()).filter(Boolean) : [s];
  }
  return [];
};
var nullableString2 = z34.string().transform((s) => s.trim() === "" ? null : s).optional().nullable();
var tvrPatchSchema = z34.object({
  userId: z34.coerce.number().int().positive().optional(),
  reportDate: z34.coerce.date().optional(),
  visitType: z34.string().max(50).optional(),
  siteNameConcernedPerson: z34.string().max(255).optional(),
  phoneNo: z34.string().max(20).optional(),
  emailId: nullableString2,
  clientsRemarks: z34.string().max(500).optional(),
  salespersonRemarks: z34.string().max(500).optional(),
  checkInTime: z34.coerce.date().optional(),
  checkOutTime: z34.coerce.date().nullable().optional(),
  inTimeImageUrl: nullableString2,
  outTimeImageUrl: nullableString2,
  // Array fields
  siteVisitBrandInUse: z34.preprocess(toStringArray6, z34.array(z34.string()).min(1)).optional(),
  influencerType: z34.preprocess(toStringArray6, z34.array(z34.string()).min(1)).optional(),
  // Nullable text fields
  siteVisitStage: nullableString2,
  conversionFromBrand: nullableString2,
  conversionQuantityUnit: nullableString2,
  associatedPartyName: nullableString2,
  serviceType: nullableString2,
  qualityComplaint: nullableString2,
  promotionalActivity: nullableString2,
  channelPartnerVisit: nullableString2,
  // Nullable numeric
  conversionQuantityValue: z34.coerce.number().nullable().optional(),
  siteVisitType: nullableString2,
  dhalaiVerificationCode: nullableString2,
  isVerificationStatus: nullableString2,
  meetingId: nullableString2,
  pjpId: nullableString2,
  timeSpentinLoc: nullableString2,
  purposeOfVisit: nullableString2,
  sitePhotoUrl: nullableString2,
  firstVisitTime: z34.coerce.date().nullable().optional(),
  lastVisitTime: z34.coerce.date().nullable().optional(),
  firstVisitDay: nullableString2,
  lastVisitDay: nullableString2,
  siteVisitsCount: z34.coerce.number().int().nullable().optional(),
  otherVisitsCount: z34.coerce.number().int().nullable().optional(),
  totalVisitsCount: z34.coerce.number().int().nullable().optional(),
  region: nullableString2,
  area: nullableString2,
  latitude: z34.coerce.number().nullable().optional(),
  longitude: z34.coerce.number().nullable().optional(),
  masonId: nullableString2
}).strict();
function setupTechnicalVisitReportsPatchRoutes(app2) {
  app2.patch("/api/technical-visit-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = tvrPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update were provided." });
      }
      const [existing] = await db.select({ id: technicalVisitReports.id }).from(technicalVisitReports).where(eq55(technicalVisitReports.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `Technical Visit Report with ID '${id}' not found.`
        });
      }
      const patch = {};
      if (input.userId !== void 0) patch.userId = input.userId;
      if (input.reportDate !== void 0) patch.reportDate = toDateOnly7(input.reportDate);
      if (input.visitType !== void 0) patch.visitType = input.visitType;
      if (input.siteNameConcernedPerson !== void 0) patch.siteNameConcernedPerson = input.siteNameConcernedPerson;
      if (input.phoneNo !== void 0) patch.phoneNo = input.phoneNo;
      if (input.emailId !== void 0) patch.emailId = input.emailId;
      if (input.clientsRemarks !== void 0) patch.clientsRemarks = input.clientsRemarks;
      if (input.salespersonRemarks !== void 0) patch.salespersonRemarks = input.salespersonRemarks;
      if (input.checkInTime !== void 0) patch.checkInTime = input.checkInTime;
      if (input.checkOutTime !== void 0) patch.checkOutTime = input.checkOutTime;
      if (input.inTimeImageUrl !== void 0) patch.inTimeImageUrl = input.inTimeImageUrl;
      if (input.outTimeImageUrl !== void 0) patch.outTimeImageUrl = input.outTimeImageUrl;
      if (input.siteVisitBrandInUse !== void 0) patch.siteVisitBrandInUse = input.siteVisitBrandInUse;
      if (input.influencerType !== void 0) patch.influencerType = input.influencerType;
      if (input.siteVisitStage !== void 0) patch.siteVisitStage = input.siteVisitStage;
      if (input.conversionFromBrand !== void 0) patch.conversionFromBrand = input.conversionFromBrand;
      if (input.conversionQuantityValue !== void 0) patch.conversionQuantityValue = input.conversionQuantityValue;
      if (input.conversionQuantityUnit !== void 0) patch.conversionQuantityUnit = input.conversionQuantityUnit;
      if (input.associatedPartyName !== void 0) patch.associatedPartyName = input.associatedPartyName;
      if (input.serviceType !== void 0) patch.serviceType = input.serviceType;
      if (input.qualityComplaint !== void 0) patch.qualityComplaint = input.qualityComplaint;
      if (input.promotionalActivity !== void 0) patch.promotionalActivity = input.promotionalActivity;
      if (input.channelPartnerVisit !== void 0) patch.channelPartnerVisit = input.channelPartnerVisit;
      if (input.siteVisitType !== void 0) patch.siteVisitType = input.siteVisitType;
      if (input.dhalaiVerificationCode !== void 0) patch.dhalaiVerificationCode = input.dhalaiVerificationCode;
      if (input.isVerificationStatus !== void 0) patch.isVerificationStatus = input.isVerificationStatus;
      if (input.meetingId !== void 0) patch.meetingId = input.meetingId;
      if (input.pjpId !== void 0) patch.pjpId = input.pjpId;
      if (input.timeSpentinLoc !== void 0) patch.timeSpentinLoc = input.timeSpentinLoc;
      if (input.purposeOfVisit !== void 0) patch.purposeOfVisit = input.purposeOfVisit;
      if (input.sitePhotoUrl !== void 0) patch.sitePhotoUrl = input.sitePhotoUrl;
      if (input.firstVisitTime !== void 0) patch.firstVisitTime = input.firstVisitTime;
      if (input.lastVisitTime !== void 0) patch.lastVisitTime = input.lastVisitTime;
      if (input.firstVisitDay !== void 0) patch.firstVisitDay = input.firstVisitDay;
      if (input.lastVisitDay !== void 0) patch.lastVisitDay = input.lastVisitDay;
      if (input.siteVisitsCount !== void 0) patch.siteVisitsCount = input.siteVisitsCount;
      if (input.otherVisitsCount !== void 0) patch.otherVisitsCount = input.otherVisitsCount;
      if (input.totalVisitsCount !== void 0) patch.totalVisitsCount = input.totalVisitsCount;
      if (input.region !== void 0) patch.region = input.region;
      if (input.area !== void 0) patch.area = input.area;
      if (input.masonId !== void 0) patch.masonId = input.masonId;
      if (input.conversionQuantityValue !== void 0) {
        patch.conversionQuantityValue = input.conversionQuantityValue !== null ? String(input.conversionQuantityValue) : null;
      }
      if (input.latitude !== void 0) {
        patch.latitude = input.latitude !== null ? String(input.latitude) : null;
      }
      if (input.longitude !== void 0) {
        patch.longitude = input.longitude !== null ? String(input.longitude) : null;
      }
      patch.updatedAt = /* @__PURE__ */ new Date();
      const [updated] = await db.update(technicalVisitReports).set(patch).where(eq55(technicalVisitReports.id, id)).returning();
      return res.json({
        success: true,
        message: "Technical Visit Report updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z34.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code
          }))
        });
      }
      console.error("Update TVR error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update Technical Visit Report",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Technical Visit Reports PATCH endpoint setup complete");
}

// src/routes/updateRoutes/tsoMeetings.ts
import { eq as eq56 } from "drizzle-orm";
import { z as z35 } from "zod";
var toDateOnly8 = (d) => d.toISOString().slice(0, 10);
var nullableNumber2 = z35.coerce.number().positive().optional().nullable();
var meetingPatchSchema = z35.object({
  createdByUserId: z35.coerce.number().int().positive().optional(),
  type: z35.string().max(100).min(1).optional(),
  date: z35.coerce.date().optional(),
  location: z35.string().max(500).min(1).optional(),
  budgetAllocated: nullableNumber2,
  participantsCount: z35.coerce.number().int().positive().optional().nullable()
}).strict();
function setupTsoMeetingsPatchRoutes(app2) {
  app2.patch("/api/tso-meetings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = meetingPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select({ id: tsoMeetings.id }).from(tsoMeetings).where(eq56(tsoMeetings.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `Meeting with ID '${id}' not found.` });
      }
      const patch = {};
      if (input.createdByUserId !== void 0) patch.createdByUserId = input.createdByUserId;
      if (input.type !== void 0) patch.type = input.type;
      if (input.date !== void 0) patch.date = toDateOnly8(input.date);
      if (input.location !== void 0) patch.location = input.location;
      if (input.participantsCount !== void 0) patch.participantsCount = input.participantsCount;
      if (input.budgetAllocated !== void 0) {
        patch.budgetAllocated = input.budgetAllocated ? String(input.budgetAllocated) : null;
      }
      patch.updatedAt = /* @__PURE__ */ new Date();
      const [updated] = await db.update(tsoMeetings).set(patch).where(eq56(tsoMeetings.id, id)).returning();
      return res.json({
        success: true,
        message: "TSO Meeting updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z35.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update TSO Meeting error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update TSO Meeting"
      });
    }
  });
  console.log("\u2705 TSO Meetings PATCH endpoint setup complete");
}

// src/routes/updateRoutes/salesorder.ts
import { z as z36 } from "zod";
import { eq as eq57 } from "drizzle-orm";
var toYYYYMMDD2 = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "string") {
    const d = new Date(v);
    if (Number.isNaN(+d)) return v;
    return d.toISOString().slice(0, 10);
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
};
var toDecimalString2 = (v) => {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return String(n);
};
var nullIfEmpty2 = (v) => v == null || typeof v === "string" && v.trim() === "" ? null : String(v);
var salesOrderPatchSchema = z36.object({
  userId: z36.coerce.number().int().optional().nullable(),
  dealerId: z36.string().max(255).optional().nullable().or(z36.literal("")),
  dvrId: z36.string().max(255).optional().nullable().or(z36.literal("")),
  pjpId: z36.string().max(255).optional().nullable().or(z36.literal("")),
  orderDate: z36.union([z36.string(), z36.date()]).optional(),
  orderPartyName: z36.string().min(1).optional(),
  // ... (all other fields) ...
  partyPhoneNo: z36.string().optional().nullable().or(z36.literal("")),
  partyArea: z36.string().optional().nullable().or(z36.literal("")),
  partyRegion: z36.string().optional().nullable().or(z36.literal("")),
  partyAddress: z36.string().optional().nullable().or(z36.literal("")),
  deliveryDate: z36.union([z36.string(), z36.date()]).optional().nullable(),
  deliveryArea: z36.string().optional().nullable().or(z36.literal("")),
  deliveryRegion: z36.string().optional().nullable().or(z36.literal("")),
  deliveryAddress: z36.string().optional().nullable().or(z36.literal("")),
  deliveryLocPincode: z36.string().optional().nullable().or(z36.literal("")),
  paymentMode: z36.string().optional().nullable().or(z36.literal("")),
  paymentTerms: z36.string().optional().nullable().or(z36.literal("")),
  paymentAmount: z36.union([z36.string(), z36.number()]).optional().nullable(),
  receivedPayment: z36.union([z36.string(), z36.number()]).optional().nullable(),
  receivedPaymentDate: z36.union([z36.string(), z36.date()]).optional().nullable(),
  pendingPayment: z36.union([z36.string(), z36.number()]).optional().nullable(),
  orderQty: z36.union([z36.string(), z36.number()]).optional().nullable(),
  orderUnit: z36.string().max(20).optional().nullable().or(z36.literal("")),
  itemPrice: z36.union([z36.string(), z36.number()]).optional().nullable(),
  discountPercentage: z36.union([z36.string(), z36.number()]).optional().nullable(),
  itemPriceAfterDiscount: z36.union([z36.string(), z36.number()]).optional().nullable(),
  itemType: z36.string().max(20).optional().nullable().or(z36.literal("")),
  itemGrade: z36.string().max(10).optional().nullable().or(z36.literal("")),
  // --- ✅ FIX ---
  status: z36.string().max(50).optional()
  // Admin approval field
  // --- END FIX ---
}).strict();
function setupSalesOrdersPatchRoutes(app2) {
  app2.patch("/api/sales-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = salesOrderPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select().from(salesOrders).where(eq57(salesOrders.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `Sales Order with ID '${id}' not found.` });
      }
      const patch = { updatedAt: /* @__PURE__ */ new Date() };
      if (input.userId !== void 0) patch.userId = input.userId;
      if (input.dealerId !== void 0) patch.dealerId = nullIfEmpty2(input.dealerId);
      if (input.dvrId !== void 0) patch.dvrId = nullIfEmpty2(input.dvrId);
      if (input.pjpId !== void 0) patch.pjpId = nullIfEmpty2(input.pjpId);
      if (input.orderDate !== void 0) patch.orderDate = toYYYYMMDD2(input.orderDate);
      if (input.orderPartyName !== void 0) patch.orderPartyName = input.orderPartyName;
      if (input.partyPhoneNo !== void 0) patch.partyPhoneNo = nullIfEmpty2(input.partyPhoneNo);
      if (input.partyArea !== void 0) patch.partyArea = nullIfEmpty2(input.partyArea);
      if (input.partyRegion !== void 0) patch.partyRegion = nullIfEmpty2(input.partyRegion);
      if (input.partyAddress !== void 0) patch.partyAddress = nullIfEmpty2(input.partyAddress);
      if (input.deliveryDate !== void 0) patch.deliveryDate = toYYYYMMDD2(input.deliveryDate);
      if (input.deliveryArea !== void 0) patch.deliveryArea = nullIfEmpty2(input.deliveryArea);
      if (input.deliveryRegion !== void 0) patch.deliveryRegion = nullIfEmpty2(input.deliveryRegion);
      if (input.deliveryAddress !== void 0) patch.deliveryAddress = nullIfEmpty2(input.deliveryAddress);
      if (input.deliveryLocPincode !== void 0) patch.deliveryLocPincode = nullIfEmpty2(input.deliveryLocPincode);
      if (input.paymentMode !== void 0) patch.paymentMode = nullIfEmpty2(input.paymentMode);
      if (input.paymentTerms !== void 0) patch.paymentTerms = nullIfEmpty2(input.paymentTerms);
      if (input.paymentAmount !== void 0) patch.paymentAmount = toDecimalString2(input.paymentAmount);
      if (input.receivedPayment !== void 0) patch.receivedPayment = toDecimalString2(input.receivedPayment);
      if (input.receivedPaymentDate !== void 0) patch.receivedPaymentDate = toYYYYMMDD2(input.receivedPaymentDate);
      if (input.orderQty !== void 0) patch.orderQty = toDecimalString2(input.orderQty);
      if (input.orderUnit !== void 0) patch.orderUnit = nullIfEmpty2(input.orderUnit);
      if (input.itemPrice !== void 0) patch.itemPrice = toDecimalString2(input.itemPrice);
      if (input.discountPercentage !== void 0) patch.discountPercentage = toDecimalString2(input.discountPercentage);
      if (input.itemType !== void 0) patch.itemType = nullIfEmpty2(input.itemType);
      if (input.itemGrade !== void 0) patch.itemGrade = nullIfEmpty2(input.itemGrade);
      if (input.status !== void 0) patch.status = input.status;
      const p = input.itemPrice !== void 0 ? patch.itemPrice : existing.itemPrice;
      const d = input.discountPercentage !== void 0 ? patch.discountPercentage : existing.discountPercentage;
      if (input.itemPriceAfterDiscount !== void 0) {
        patch.itemPriceAfterDiscount = toDecimalString2(input.itemPriceAfterDiscount);
      } else if (input.itemPrice !== void 0 || input.discountPercentage !== void 0) {
        if (p != null && d != null) {
          patch.itemPriceAfterDiscount = String(Number(p) * (1 - Number(d) / 100));
        }
      }
      const pa = input.paymentAmount !== void 0 ? patch.paymentAmount : existing.paymentAmount;
      const rp = input.receivedPayment !== void 0 ? patch.receivedPayment : existing.receivedPayment;
      if (input.pendingPayment !== void 0) {
        patch.pendingPayment = toDecimalString2(input.pendingPayment);
      } else if (input.paymentAmount !== void 0 || input.receivedPayment !== void 0) {
        if (pa != null && rp != null) {
          patch.pendingPayment = String(Number(pa) - Number(rp));
        }
      }
      const [updated] = await db.update(salesOrders).set(patch).where(eq57(salesOrders.id, id)).returning();
      return res.json({
        success: true,
        message: "Sales Order updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z36.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update Sales Order error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update sales order"
      });
    }
  });
  console.log("\u2705 Sales Orders PATCH endpoint (with status) setup complete");
}

// src/routes/updateRoutes/masonpcSide.ts
import { eq as eq58 } from "drizzle-orm";
import { z as z37 } from "zod";
var strOrNull9 = z37.preprocess((val) => {
  if (val === "") return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return val;
}, z37.string().nullable().optional());
var intOrNull4 = z37.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z37.number().int().nullable().optional());
var masonBaseSchema = z37.object({
  name: z37.string().min(1, "Name is required"),
  phoneNumber: z37.string().min(1, "Phone number is required"),
  kycDocumentName: strOrNull9,
  kycDocumentIdNum: strOrNull9,
  kycStatus: strOrNull9,
  pointsBalance: intOrNull4,
  bagsLifted: intOrNull4,
  isReferred: z37.boolean().nullable().optional(),
  referredByUser: strOrNull9,
  referredToUser: strOrNull9,
  dealerId: strOrNull9,
  userId: intOrNull4,
  firebaseUid: strOrNull9
});
var masonUpdateSchema = masonBaseSchema.partial().strict();
function cleanUpdatePayload(data) {
  const payload = {};
  for (const key in data) {
    const value = data[key];
    if (value !== void 0) {
      payload[key] = value;
    }
  }
  return payload;
}
function setupMasonPcSidePatchRoutes(app2) {
  app2.patch("/api/masons/:id", async (req, res) => {
    const tableName4 = "Mason";
    try {
      const { id } = req.params;
      if (!z37.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: "Invalid Mason ID format. Expected UUID." });
      }
      const validatedData = masonUpdateSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update were provided."
        });
      }
      const updatePayload = cleanUpdatePayload(validatedData);
      const [existingMason] = await db.select({ id: masonPcSide.id }).from(masonPcSide).where(eq58(masonPcSide.id, id)).limit(1);
      if (!existingMason) {
        return res.status(404).json({
          success: false,
          error: `Mason with ID '${id}' not found.`
        });
      }
      const [updatedMason] = await db.update(masonPcSide).set(updatePayload).where(eq58(masonPcSide.id, id)).returning();
      res.json({
        success: true,
        message: "Mason updated successfully",
        data: updatedMason
      });
    } catch (err) {
      if (err instanceof z37.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23503" || msg.includes("foreign key constraint")) {
        let field = "related record";
        if (msg.includes("mason_pc_side_dealer_id_fkey")) {
          field = "dealerId";
        } else if (msg.includes("mason_pc_side_user_id_fkey")) {
          field = "userId";
        }
        return res.status(400).json({
          // 400 Bad Request
          success: false,
          error: `Foreign key violation: The specified ${field} does not exist.`,
          details: err?.detail ?? err?.message
        });
      }
      console.error(`Update ${tableName4} error:`, err);
      res.status(500).json({
        success: false,
        error: `Failed to update ${tableName4}`,
        details: err instanceof Error ? err.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Masons PATCH endpoints setup complete");
}

// src/routes/updateRoutes/schemesOffers.ts
import { eq as eq59 } from "drizzle-orm";
import { z as z38 } from "zod";
var strOrNull10 = z38.preprocess((val) => {
  if (val === "" || val === void 0) return null;
  if (val === null) return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return val;
}, z38.string().nullable().optional());
var dateOrNull4 = z38.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  try {
    const d = new Date(String(val));
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}, z38.date().nullable().optional());
var schemeOfferBaseSchema = z38.object({
  name: z38.string().min(1, "Name is required"),
  description: strOrNull10.optional(),
  // Make optional here to allow PATCH to omit it
  startDate: dateOrNull4.optional(),
  endDate: dateOrNull4.optional()
});
var schemeOfferPatchSchema = schemeOfferBaseSchema.partial().strict();
var schemeOfferPutSchema = z38.object({
  name: z38.string().min(1, "Name is required"),
  description: strOrNull10.transform((val) => val ?? null),
  // Transform to null if missing/empty string
  startDate: dateOrNull4.transform((val) => val ?? null),
  endDate: dateOrNull4.transform((val) => val ?? null)
}).strict();
function setupSchemesOffersPatchRoutes(app2) {
  const tableName4 = "Scheme/Offer";
  app2.patch("/api/schemes-offers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!z38.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: "Invalid Scheme ID format. Expected UUID." });
      }
      const validatedData = schemeOfferPatchSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update were provided." });
      }
      const [existingRecord] = await db.select({ id: schemesOffers.id }).from(schemesOffers).where(eq59(schemesOffers.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName4} with ID '${id}' not found.` });
      }
      const [updatedRecord] = await db.update(schemesOffers).set(validatedData).where(eq59(schemesOffers.id, id)).returning();
      return res.json({
        success: true,
        message: `${tableName4} updated successfully (PATCH)`,
        data: updatedRecord
      });
    } catch (err) {
      if (err instanceof z38.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.issues });
      }
      console.error(`PATCH ${tableName4} error:`, err);
      return res.status(500).json({ success: false, error: `Failed to update ${tableName4}`, details: err?.message ?? "Unknown error" });
    }
  });
  app2.put("/api/schemes-offers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!z38.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: "Invalid Scheme ID format. Expected UUID." });
      }
      const validatedData = schemeOfferPutSchema.parse(req.body);
      const [existingRecord] = await db.select({ id: schemesOffers.id }).from(schemesOffers).where(eq59(schemesOffers.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName4} with ID '${id}' not found for replacement.` });
      }
      const [updatedRecord] = await db.update(schemesOffers).set(validatedData).where(eq59(schemesOffers.id, id)).returning();
      return res.json({
        success: true,
        message: `${tableName4} replaced successfully (PUT)`,
        data: updatedRecord
      });
    } catch (err) {
      if (err instanceof z38.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.issues });
      }
      console.error(`PUT ${tableName4} error:`, err);
      return res.status(500).json({ success: false, error: `Failed to replace ${tableName4}`, details: err?.message ?? "Unknown error" });
    }
  });
  console.log("\u2705 Schemes/Offers PATCH and PUT endpoints setup complete");
}

// src/routes/updateRoutes/kycSubmission.ts
import { eq as eq60 } from "drizzle-orm";
import { z as z39 } from "zod";
var kycApprovalSchema = z39.object({
  status: z39.enum(["approved", "rejected", "pending"]),
  remark: z39.string().max(500).optional().nullable()
}).strict();
function setupKycSubmissionsPatchRoute(app2) {
  app2.patch("/api/kyc-submissions/:id", async (req, res) => {
    const tableName4 = "KYC Submission";
    try {
      const { id } = req.params;
      if (!z39.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: "Invalid Submission ID format. Expected UUID." });
      }
      const input = kycApprovalSchema.parse(req.body);
      const [existingRecord] = await db.select().from(kycSubmissions).where(eq60(kycSubmissions.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName4} with ID '${id}' not found.` });
      }
      const { status, remark } = input;
      const masonId = existingRecord.masonId;
      const [updatedSubmission] = await db.transaction(async (tx) => {
        const [submission] = await tx.update(kycSubmissions).set({
          status,
          remark: remark ?? null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq60(kycSubmissions.id, id)).returning();
        await tx.update(masonPcSide).set({ kycStatus: status }).where(eq60(masonPcSide.id, masonId));
        return [submission];
      });
      res.json({
        success: true,
        message: `KYC submission status updated to '${updatedSubmission.status}' and Mason's status updated.`,
        data: updatedSubmission
      });
    } catch (error) {
      if (error instanceof z39.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error(`PATCH ${tableName4} error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName4} status.`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 KYC Submissions PATCH (Approval) endpoint setup complete");
}

// src/routes/updateRoutes/rewards.ts
import { eq as eq61 } from "drizzle-orm";
import { z as z40 } from "zod";
var rewardPatchSchema = insertRewardsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial().extend({
  categoryId: z40.preprocess(
    (v) => typeof v === "string" ? parseInt(v, 10) : v,
    z40.number().int().positive("Category ID must be a positive integer.").optional()
  ),
  pointCost: z40.coerce.number().int().positive("Point cost must be a positive integer.").optional(),
  totalAvailableQuantity: z40.coerce.number().int().nonnegative("Total quantity cannot be negative.").optional(),
  stock: z40.coerce.number().int().nonnegative("Stock cannot be negative.").optional(),
  meta: z40.any().optional().nullable(),
  isActive: z40.boolean().optional()
}).strict();
function setupRewardsPatchRoute(app2) {
  app2.patch("/api/rewards/:id", async (req, res) => {
    const tableName4 = "Reward";
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid Reward ID." });
      const input = rewardPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update were provided." });
      }
      const [existingRecord] = await db.select({ id: rewards.id }).from(rewards).where(eq61(rewards.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ success: false, error: `${tableName4} with ID '${id}' not found.` });
      }
      const patchData = {};
      Object.assign(patchData, input);
      if (input.meta !== void 0) {
        patchData.meta = input.meta ? JSON.stringify(input.meta) : null;
      }
      patchData.updatedAt = /* @__PURE__ */ new Date();
      const [updatedRecord] = await db.update(rewards).set(patchData).where(eq61(rewards.id, id)).returning();
      return res.json({
        success: true,
        message: `${tableName4} updated successfully`,
        data: updatedRecord
      });
    } catch (err) {
      console.error(`PATCH ${tableName4} error:`, err);
      if (err instanceof z40.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.errors });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23505" || msg.includes("unique constraint")) {
        return res.status(409).json({ success: false, error: "Reward name already exists" });
      }
      if (err?.code === "23503" || msg.includes("foreign key constraint")) {
        return res.status(400).json({ success: false, error: "Foreign key violation: Invalid categoryId.", details: err?.detail });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName4}`
      });
    }
  });
  console.log("\u2705 Rewards PATCH endpoint setup complete");
}

// src/routes/updateRoutes/rewardsRedemption.ts
import { eq as eq62, sql as sql15 } from "drizzle-orm";
import { z as z41 } from "zod";
var redemptionFulfillmentSchema = z41.object({
  status: z41.enum(["approved", "shipped", "delivered", "rejected"]),
  fulfillmentNotes: z41.string().max(500).optional().nullable()
}).strict();
function setupRewardsRedemptionPatchRoute(app2) {
  app2.patch("/api/rewards-redemption/:id", async (req, res) => {
    const tableName4 = "Reward Redemption";
    try {
      const { id } = req.params;
      if (!req.auth || !req.auth.sub) {
        return res.status(401).json({ success: false, error: "Authentication details missing." });
      }
      const authenticatedUserId = parseInt(req.auth.sub, 10);
      if (!z41.string().uuid().safeParse(id).success) {
        return res.status(400).json({ success: false, error: "Invalid Redemption ID format. Expected UUID." });
      }
      const input = redemptionFulfillmentSchema.parse(req.body);
      const [existingRecord] = await db.select().from(rewardRedemptions).where(eq62(rewardRedemptions.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName4} with ID '${id}' not found.` });
      }
      const { status, fulfillmentNotes } = input;
      const currentStatus = existingRecord.status;
      const masonId = existingRecord.masonId;
      const points = existingRecord.pointsDebited;
      if (currentStatus === "delivered" && status !== "delivered") {
        return res.status(400).json({ success: false, error: "Cannot change status of an already delivered item." });
      }
      const updatedRecord = await db.transaction(async (tx) => {
        if (currentStatus === "placed" && status === "approved") {
          await tx.insert(pointsLedger).values({
            masonId,
            sourceType: "redemption",
            sourceId: id,
            // Link back to the Redemption record
            points: -points,
            // ⬅️ DEBIT: Insert negative points
            memo: `Points deducted for approved redemption ID ${id}. Approved by TSO ${authenticatedUserId}.`
          }).returning();
          await tx.update(masonPcSide).set({
            pointsBalance: sql15`${masonPcSide.pointsBalance} - ${points}`
            // ⬅️ DEBIT: Subtract the points
          }).where(eq62(masonPcSide.id, masonId));
          const [updated] = await tx.update(rewardRedemptions).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(eq62(rewardRedemptions.id, id)).returning();
          return updated;
        } else if (status !== "approved") {
          const [updated] = await tx.update(rewardRedemptions).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq62(rewardRedemptions.id, id)).returning();
          return updated;
        } else if (currentStatus === "approved" && status === "approved") {
          const [updated] = await tx.update(rewardRedemptions).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq62(rewardRedemptions.id, id)).returning();
          return updated;
        } else {
          tx.rollback();
          throw new Error(`Invalid status transition from '${currentStatus}' to '${status}'.`);
        }
      });
      res.json({
        success: true,
        message: `${tableName4} status updated to '${updatedRecord.status}' successfully.`,
        data: updatedRecord
      });
    } catch (error) {
      if (error instanceof z41.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error(`PATCH ${tableName4} error:`, error);
      const msg = error?.message ?? "";
      if (msg.includes("Invalid status transition") || msg.includes("Mason ID")) {
        return res.status(400).json({ success: false, error: msg });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to update ${tableName4} status.`
      });
    }
  });
  console.log("\u2705 Reward Redemptions PATCH (Debit/Fulfillment) endpoint setup complete");
}

// src/routes/updateRoutes/bagsLift.ts
import { eq as eq63, sql as sql16 } from "drizzle-orm";
import { z as z42 } from "zod";
import { randomUUID as randomUUID16 } from "crypto";
var bagLiftApprovalSchema = z42.object({
  status: z42.enum(["approved", "rejected", "pending"]),
  memo: z42.string().max(500).optional()
  // 'approvedBy' was removed. It will be taken from the authenticated user's token (req.auth.sub).
}).strict();
function setupBagLiftsPatchRoute(app2) {
  app2.patch("/api/bag-lifts/:id", tsoAuth, async (req, res) => {
    const tableName4 = "Bag Lift";
    try {
      const { id } = req.params;
      const authenticatedUserId = parseInt(req.auth.sub, 10);
      if (isNaN(authenticatedUserId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID in auth token." });
      }
      const input = bagLiftApprovalSchema.parse(req.body);
      const [existingRecord] = await db.select().from(bagLifts).where(eq63(bagLifts.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ error: `${tableName4} with ID '${id}' not found.` });
      }
      const { status, memo } = input;
      const currentStatus = existingRecord.status;
      const masonId = existingRecord.masonId;
      const points = existingRecord.pointsCredited;
      if (status === currentStatus) {
        return res.status(400).json({ success: false, error: `Status is already '${currentStatus}'.` });
      }
      if (status === "approved" && currentStatus === "rejected") {
        return res.status(400).json({ success: false, error: "Cannot directly approve a previously rejected transaction." });
      }
      const updatedBagLift = await db.transaction(async (tx) => {
        if (status === "approved" && currentStatus === "pending") {
          const [masonBeforeCredit] = await tx.select().from(masonPcSide).where(eq63(masonPcSide.id, masonId)).limit(1);
          if (!masonBeforeCredit) {
            tx.rollback();
            throw new Error(`Mason ID ${masonId} not found.`);
          }
          const [updated] = await tx.update(bagLifts).set({
            status: "approved",
            approvedBy: authenticatedUserId,
            // <-- Use the ID from auth
            approvedAt: /* @__PURE__ */ new Date()
          }).where(eq63(bagLifts.id, id)).returning();
          await tx.insert(pointsLedger).values({
            masonId,
            sourceType: "bag_lift",
            sourceId: updated.id,
            points,
            memo: memo || `Credit for ${updated.bagCount} bags (Base+Bonanza).`
          }).returning();
          await tx.update(masonPcSide).set({
            pointsBalance: sql16`${masonPcSide.pointsBalance} + ${points}`,
            bagsLifted: sql16`${masonPcSide.bagsLifted} + ${updated.bagCount}`
          }).where(eq63(masonPcSide.id, masonId));
          const oldTotalBags = masonBeforeCredit.bagsLifted ?? 0;
          const currentLiftBags = updated.bagCount;
          const extraBonus = calculateExtraBonusPoints(oldTotalBags, currentLiftBags, existingRecord.purchaseDate);
          if (extraBonus > 0) {
            await tx.insert(pointsLedger).values({
              masonId,
              points: extraBonus,
              sourceType: "adjustment",
              // Policy Rule 13 uses "adjustment" type
              memo: `Extra Bonus: ${extraBonus} points for crossing bag slab.`
            });
            await tx.update(masonPcSide).set({
              pointsBalance: sql16`${masonPcSide.pointsBalance} + ${extraBonus}`
            }).where(eq63(masonPcSide.id, masonId));
          }
          if (masonBeforeCredit.referredByUser) {
            const referrerId = masonBeforeCredit.referredByUser;
            const referralPoints = checkReferralBonusTrigger(oldTotalBags, currentLiftBags);
            if (referralPoints > 0) {
              await tx.insert(pointsLedger).values({
                masonId: referrerId,
                points: referralPoints,
                sourceType: "referral_bonus",
                memo: `Referral bonus for Mason ${masonId} hitting 200 bags.`
              });
              await tx.update(masonPcSide).set({
                pointsBalance: sql16`${masonPcSide.pointsBalance} + ${referralPoints}`
              }).where(eq63(masonPcSide.id, referrerId));
            }
          }
          return updated;
        } else if (status === "rejected" && currentStatus === "approved") {
          const [updated] = await tx.update(bagLifts).set({
            status: "rejected"
            // Note: We keep the original 'approvedBy' ID to know who approved it,
            // but we could nullify it if business logic required.
            // approvedBy: null, 
          }).where(eq63(bagLifts.id, id)).returning();
          await tx.insert(pointsLedger).values({
            masonId,
            sourceType: "adjustment",
            sourceId: randomUUID16(),
            // New UUID for the adjustment record
            points: -points,
            // Negative points for debit
            memo: memo || `Debit adjustment: Bag Lift ${id} rejected by User ${authenticatedUserId}. Reversing main points.`
          }).returning();
          await tx.update(masonPcSide).set({
            pointsBalance: sql16`${masonPcSide.pointsBalance} - ${points}`,
            // FIX 2: Apply non-null assertion to existingRecord.bagCount
            bagsLifted: sql16`${masonPcSide.bagsLifted} - ${existingRecord.bagCount}`
          }).where(eq63(masonPcSide.id, masonId));
          return updated;
        } else {
          const [updated] = await tx.update(bagLifts).set({ status }).where(eq63(bagLifts.id, id)).returning();
          return updated;
        }
      });
      res.json({
        success: true,
        message: `Bag Lift status updated to '${updatedBagLift.status}' successfully.`,
        data: updatedBagLift
      });
    } catch (error) {
      if (error instanceof z42.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error(`PATCH Bag Lift error:`, error);
      return res.status(500).json({
        success: false,
        error: `Failed to update Bag Lift status.`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Bag Lifts PATCH (Approval) endpoint setup complete (Now protected by tsoAuth middleware)");
}

// src/routes/updateRoutes/technicalSites.ts
import { eq as eq64 } from "drizzle-orm";
import { z as z43 } from "zod";
var strOrNull11 = z43.preprocess((val) => {
  if (val === "" || val === void 0) return null;
  if (val === null) return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return String(val);
}, z43.string().nullable().optional());
var dateOrNull5 = z43.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}, z43.date().nullable().optional());
var numOrNull5 = z43.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z43.number().nullable().optional());
var boolOrNull = z43.preprocess((val) => {
  if (val === "true" || val === true) return true;
  if (val === "false" || val === false) return false;
  if (val === "" || val === null || val === void 0) return null;
  return void 0;
}, z43.boolean().nullable().optional());
var technicalSiteBaseSchema = z43.object({
  siteName: z43.string().min(1).max(255).optional(),
  concernedPerson: z43.string().min(1).max(255).optional(),
  phoneNo: z43.string().min(1).max(20).optional(),
  address: strOrNull11,
  latitude: numOrNull5,
  longitude: numOrNull5,
  siteType: strOrNull11,
  area: strOrNull11,
  region: strOrNull11,
  keyPersonName: strOrNull11,
  keyPersonPhoneNum: strOrNull11,
  stageOfConstruction: strOrNull11,
  // Dates are coerced to Date objects here, then converted back to string/Date in the handler
  constructionStartDate: dateOrNull5,
  constructionEndDate: dateOrNull5,
  firstVistDate: dateOrNull5,
  lastVisitDate: dateOrNull5,
  convertedSite: boolOrNull,
  needFollowUp: boolOrNull,
  // Foreign Keys (must be UUID string or null)
  relatedDealerID: strOrNull11,
  // z.string().uuid().nullable().optional() equivalent
  relatedMasonpcID: strOrNull11
});
var technicalSitePatchSchema = technicalSiteBaseSchema.partial().strict();
var technicalSitePutSchema = technicalSiteBaseSchema.extend({
  // Make required fields mandatory for PUT operations
  siteName: z43.string().min(1).max(255),
  concernedPerson: z43.string().min(1).max(255),
  phoneNo: z43.string().min(1).max(20)
});
var toDrizzleDateValue = (d) => {
  if (!d) return null;
  return d;
};
function setupTechnicalSitesUpdateRoutes(app2) {
  app2.patch("/api/technical-sites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = technicalSitePatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existingSite] = await db.select().from(technicalSites).where(eq64(technicalSites.id, id)).limit(1);
      if (!existingSite) {
        return res.status(404).json({ success: false, error: `Technical Site with ID '${id}' not found.` });
      }
      const patch = {};
      Object.keys(input).forEach((key) => {
        const value = input[key];
        if (key.includes("Date")) {
          patch[key] = toDrizzleDateValue(value);
        } else if (value !== void 0) {
          patch[key] = value;
        }
      });
      patch.updatedAt = /* @__PURE__ */ new Date();
      const [updatedSite] = await db.update(technicalSites).set(patch).where(eq64(technicalSites.id, id)).returning();
      return res.json({
        success: true,
        message: "Technical Site updated successfully",
        data: updatedSite
      });
    } catch (error) {
      if (error instanceof z43.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update Technical Site error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update technical site",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  app2.put("/api/technical-sites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = technicalSitePutSchema.parse(req.body);
      const [existingSite] = await db.select().from(technicalSites).where(eq64(technicalSites.id, id)).limit(1);
      if (!existingSite) {
        return res.status(404).json({ success: false, error: `Technical Site with ID '${id}' not found.` });
      }
      const updateData = {};
      Object.entries(input).forEach(([key, value]) => {
        if (key.includes("Date")) {
          updateData[key] = toDrizzleDateValue(value);
        } else {
          updateData[key] = value;
        }
      });
      updateData.updatedAt = /* @__PURE__ */ new Date();
      updateData.id = id;
      const [updatedSite] = await db.update(technicalSites).set(updateData).where(eq64(technicalSites.id, id)).returning();
      return res.json({
        success: true,
        message: "Technical Site replaced successfully",
        data: updatedSite
      });
    } catch (error) {
      if (error instanceof z43.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed for full replacement", details: error.issues });
      }
      console.error("PUT Technical Site error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to replace technical site",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 Technical Sites PATCH and PUT endpoints setup complete");
}

// src/routes/geoTrackingRoutes/geoTracking.ts
import { eq as eq65, desc as desc34 } from "drizzle-orm";
import { z as z44 } from "zod";
import crypto3 from "crypto";
var geoTrackingUpdateSchema = insertGeoTrackingSchema.partial();
function setupGeoTrackingRoutes(app2) {
  app2.get("/api/geotracking/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID." });
      }
      const records = await db.select().from(geoTracking).where(eq65(geoTracking.userId, userId)).orderBy(desc34(geoTracking.recordedAt));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get Geo-tracking by User ID error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch tracking data." });
    }
  });
  app2.get("/api/geotracking/journey/:journeyId", async (req, res) => {
    try {
      const { journeyId } = req.params;
      const records = await db.select().from(geoTracking).where(eq65(geoTracking.journeyId, journeyId)).orderBy(desc34(geoTracking.recordedAt));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get Geo-tracking by Journey ID error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch journey data." });
    }
  });
  app2.get("/api/geotracking/user/:userId/latest", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID." });
      }
      const [latest] = await db.select().from(geoTracking).where(eq65(geoTracking.userId, userId)).orderBy(desc34(geoTracking.recordedAt)).limit(1);
      if (!latest) {
        return res.json({ success: true, data: null });
      }
      const normalized = {
        ...latest,
        recordedAt: latest.recordedAt instanceof Date ? latest.recordedAt.toISOString() : latest.recordedAt
      };
      return res.json({ success: true, data: normalized });
    } catch (err) {
      console.error("Get latest geo-tracking by User ID error:", err);
      return res.status(500).json({ success: false, error: "Failed to fetch latest tracking data." });
    }
  });
  app2.post("/api/geotracking", async (req, res) => {
    try {
      const incomingRaw = JSON.parse(JSON.stringify(req.body || {}));
      for (const badKey of ["id", "ID", "Id", "_id", "uuid", "UUID", "Uuid"]) {
        if (badKey in incomingRaw) delete incomingRaw[badKey];
      }
      const COERCE_TO_STRING_KEYS = [
        "latitude",
        "longitude",
        "dest_lat",
        "dest_lng",
        "destLat",
        "destLng",
        "total_distance_travelled",
        "totalDistanceTravelled",
        "latitude_str",
        "longitude_str"
        // in case weird keys exist
      ];
      for (const key of COERCE_TO_STRING_KEYS) {
        if (key in incomingRaw && typeof incomingRaw[key] === "number") {
          incomingRaw[key] = incomingRaw[key].toString();
        }
      }
      const parsed2 = insertGeoTrackingSchema.safeParse(incomingRaw);
      if (!parsed2.success) {
        return res.status(400).json({ success: false, error: "Invalid body", details: parsed2.error.flatten() });
      }
      const data = parsed2.data;
      const now = /* @__PURE__ */ new Date();
      const payload = {
        id: crypto3.randomUUID(),
        userId: data.userId ?? data.user_id,
        latitude: typeof data.latitude === "string" ? Number(data.latitude) : data.latitude ?? (data.lat ? Number(data.lat) : void 0),
        longitude: typeof data.longitude === "string" ? Number(data.longitude) : data.longitude ?? (data.lng ? Number(data.lng) : void 0),
        recordedAt: data.recorded_at ? new Date(data.recorded_at) : now,
        locationType: data.location_type ?? data.locationType,
        appState: data.app_state ?? data.appState,
        totalDistanceTravelled: data.total_distance_travelled ?? data.totalDistanceTravelled,
        journeyId: data.journey_id ?? data.journeyId ?? data.journey,
        isActive: typeof data.is_active === "boolean" ? data.is_active : typeof data.isActive === "boolean" ? data.isActive : true,
        destLat: data.dest_lat ?? data.destLat,
        destLng: data.dest_lng ?? data.destLng,
        createdAt: now,
        updatedAt: now
      };
      for (const k of Object.keys(payload)) {
        if (payload[k] === void 0 || payload[k] === null || payload[k] === "") delete payload[k];
      }
      console.log("\u{1F501} FINAL INSERT PAYLOAD:", payload);
      const [inserted] = await db.insert(geoTracking).values(payload).returning();
      return res.status(201).json({ success: true, data: inserted });
    } catch (err) {
      if (err?.issues) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.issues });
      }
      console.error("[geotracking] error", err);
      return res.status(500).json({ success: false, error: "Failed to create tracking point", details: err?.message ?? String(err) });
    }
  });
  app2.patch("/api/geotracking/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = geoTrackingUpdateSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update were provided." });
      }
      const [existingRecord] = await db.select().from(geoTracking).where(eq65(geoTracking.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ success: false, error: `Tracking record with ID '${id}' not found.` });
      }
      const [updatedRecord] = await db.update(geoTracking).set({ ...validatedData, updatedAt: /* @__PURE__ */ new Date() }).where(eq65(geoTracking.id, id)).returning();
      res.json({ success: true, message: "Tracking record updated successfully", data: updatedRecord });
    } catch (error) {
      if (error instanceof z44.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update Geo-tracking error:", error);
      res.status(500).json({ success: false, error: "Failed to update tracking record." });
    }
  });
  console.log("\u2705 Geo-Tracking GET, POST, and PATCH endpoints setup complete");
}

// src/bots/aiService.ts
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
var openai = null;
var systemPrompt = "You are a helpful and friendly AI assistant. Your name is CemTemChat AI. Keep your responses concise, friendly, and easy to understand. Do not mention that you are an AI unless it is directly relevant to the conversation.";
async function getAICompletion(userMessage) {
  if (!openai) {
    throw new Error("AI service not initialized. Did you forget to call setupAiService(app)?");
  }
  console.log(`\u{1F916} Sending request to OpenRouter for: "${userMessage}"`);
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      // 👉 2. SEND THE PROMPT WITH THE MESSAGE
      // The 'messages' array now includes the system prompt before the user's message.
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });
    const content = completion.choices[0]?.message?.content;
    console.log("\u2705 AI Response Received.");
    return content || null;
  } catch (error) {
    console.error("\u{1F4A5} An error occurred while fetching the AI completion:", error);
    throw error;
  }
}
function setupAiService(app2) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  const YOUR_SITE_URL = process.env.YOUR_SITE_URL || "https://myserverbymycoco.onrender.com";
  const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || "My-AI-Service";
  if (!OPENROUTER_API_KEY) {
    console.error("\u274C FATAL ERROR: OPENROUTER_API_KEY is not set in your .env file.");
    throw new Error("OPENROUTER_API_KEY missing");
  }
  if (!openai) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME
      }
    });
    console.log("\u2705 OpenAI client initialized via OpenRouter");
  }
  if (app2) {
    app2.locals = app2.locals || {};
    app2.locals.openai = openai;
    app2.locals.getAICompletion = getAICompletion;
  }
  return { openai, getAICompletion };
}

// src/bots/telegramService.ts
import TelegramBot from "node-telegram-bot-api";
var TelegramService = class {
  bot = null;
  io = null;
  config;
  socketsSet = /* @__PURE__ */ new Set();
  constructor(config) {
    if (!config.token) throw new Error("Telegram token required");
    this.config = {
      useWebhook: false,
      pollingIntervalMs: 300,
      ...config
    };
  }
  attachSocketIO(io) {
    this.io = io;
    this.setupSocketHandlers();
  }
  async start() {
    if (this.bot) return;
    this.bot = new TelegramBot(this.config.token, {
      polling: this.config.useWebhook ? false : {
        interval: this.config.pollingIntervalMs,
        autoStart: true,
        params: { timeout: 10 }
      }
    });
    this.bot.on("message", (msg) => this.handleTelegramMessage(msg));
    this.bot.on("polling_error", (err) => console.error("Telegram polling error", err?.message || err));
    this.bot.on("error", (err) => console.error("Telegram bot error", err?.message || err));
    try {
      const me = await this.bot.getMe();
      console.log(`\u2705 TelegramService started as @${me.username} (${me.id})`);
    } catch (e) {
      console.warn("TelegramService started but getMe() failed.", e);
    }
  }
  async stop() {
    if (!this.bot) return;
    try {
      if (this.bot.isPolling && this.bot.isPolling()) {
        await this.bot.stopPolling();
      }
    } catch (e) {
      console.error("Error while stopping Telegram bot", e);
    } finally {
      this.bot = null;
    }
  }
  async sendToTelegram(chatId, text2, options) {
    if (!this.bot) throw new Error("Telegram bot not started");
    try {
      await this.bot.sendMessage(chatId, text2, options);
    } catch (err) {
      console.error(`Failed to send message to ${chatId}`, err);
      throw err;
    }
  }
  /**
   * Internal: handle incoming telegram messages, get AI reply, and send it back.
   * Also forwards the original message to the webapp via socket.io.
   */
  // 👈 3. The message handler is now async to await the AI response
  async handleTelegramMessage(msg) {
    const text2 = (msg.text || msg.caption || "").trim();
    const chatId = msg.chat.id;
    if (!text2) {
      return;
    }
    if (text2.toLowerCase() === "/start") {
      this.sendToTelegram(
        chatId,
        "Hello! I am an AI assistant powered by OpenRouter. Ask me anything."
      );
      return;
    }
    try {
      console.log(`\u{1F9E0} Processing AI request for chat ${chatId}: "${text2}"`);
      this.bot?.sendChatAction(chatId, "typing");
      const aiReply = await getAICompletion(text2);
      if (aiReply) {
        await this.sendToTelegram(chatId, aiReply);
      } else {
        await this.sendToTelegram(chatId, "Sorry, I couldn't come up with a response.");
      }
    } catch (error) {
      console.error(`\u{1F4A5} Failed to get AI response for chat ${chatId}:`, error);
      await this.sendToTelegram(chatId, "Sorry, I'm having trouble connecting to my brain right now. Please try again later.");
    }
  }
  setupSocketHandlers() {
    if (!this.io) return;
    this.io.on("connection", (socket) => {
      console.log(`\u{1F50C} Socket connected: ${socket.id}`);
      this.socketsSet.add(socket.id);
      socket.on("web:sendMessage", async (payload, ack) => {
        try {
          if (!payload || typeof payload.chatId !== "number" || !payload.text) {
            const err = { ok: false, error: "invalid_payload" };
            if (ack) ack(err);
            return;
          }
          await this.sendToTelegram(payload.chatId, payload.text, payload.options);
          if (ack) ack({ ok: true });
        } catch (err) {
          console.error("Error sending message from web to telegram", err);
          if (ack) ack({ ok: false, error: err?.message || "send_failed" });
        }
      });
      socket.on("web:botStatus", (cb) => {
        if (cb) cb({ running: !!this.bot });
      });
      socket.on("disconnect", () => {
        console.log(`\u{1F50C} Socket disconnected: ${socket.id}`);
        this.socketsSet.delete(socket.id);
      });
    });
  }
};
function setupTelegramService(app2, config) {
  const maybeIo = typeof app2?.get === "function" && app2.get("io") || app2?.locals && app2.locals.io || app2 && app2.io || void 0;
  const token = process.env.TELEGRAM_BOT_TOKEN || config?.token || "";
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not set and no token provided in config");
  }
  const svc = new TelegramService({ token, ...config });
  if (maybeIo) {
    try {
      svc.attachSocketIO(maybeIo);
      console.log("\u{1F517} Attached Socket.IO to TelegramService");
    } catch (err) {
      console.warn("Failed to attach Socket.IO to TelegramService", err);
    }
  } else {
    console.warn("No Socket.IO instance found on app \u2014 webapp will not receive messages via socket.");
  }
  svc.start().catch((err) => {
    console.error("Failed to start TelegramService", err);
  });
  return svc;
}

// index.ts
dotenv2.config({ path: path.resolve(process.cwd(), ".env") });
console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "YES" : "NO");
console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
var app = express();
var DEFAULT_PORT = 8e3;
var parsed = parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10);
var PORT = Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use((req, res, next) => {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Field Force Management API!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
console.log("\u{1F50C} Registering API routes...");
setupAuthRoutes(app);
setupUsersRoutes(app);
setupCompaniesRoutes(app);
setupLogoutAuthRoutes(app);
setupAuthFirebaseRoutes(app);
setupBrandsAndMappingRoutes(app);
setupDealersRoutes(app);
setupDailyTasksRoutes(app);
setupPJPRoutes(app);
setupCompetitionReportsRoutes(app);
setupDailyVisitReportsRoutes(app);
setupTechnicalVisitReportsRoutes(app);
setupTsoMeetingsGetRoutes(app);
setupDealerReportsAndScoresRoutes(app);
setupRatingsRoutes(app);
setupSalesmanLeaveApplicationsRoutes(app);
setupSalesOrdersRoutes(app);
setupSalesmanAttendanceRoutes(app);
setupMasonsOnMeetingsGetRoutes(app);
setupMasonsOnSchemeGetRoutes(app);
setupMasonsPcSideRoutes(app);
setupSchemesOffersRoutes(app);
setupBagLiftsGetRoutes(app);
setupPointsLedgerGetRoutes(app);
setupRewardsGetRoutes(app);
setupRewardsRedemptionGetRoutes(app);
setupKycSubmissionsRoutes(app);
setupTechnicalSitesRoutes(app);
setupTechnicalVisitReportsPostRoutes(app);
setupPermanentJourneyPlansPostRoutes(app);
setupDealersPostRoutes(app);
setupSalesmanLeaveApplicationsPostRoutes(app);
setupCompetitionReportsPostRoutes(app);
setupDailyTasksPostRoutes(app);
setupDealerReportsAndScoresPostRoutes(app);
setupRatingsPostRoutes(app);
setupBrandsPostRoutes(app);
setupSalesOrdersPostRoutes(app);
setupDealerBrandMappingPostRoutes(app);
setupDailyVisitReportsPostRoutes(app);
setupAttendanceInPostRoutes(app);
setupAttendanceOutPostRoutes(app);
setupTsoMeetingsPostRoutes(app);
setupMasonOnMeetingPostRoutes(app);
setupMasonOnSchemePostRoutes(app);
setupMasonPcSidePostRoutes(app);
setupSchemesOffersPostRoutes(app);
setupRewardCategoriesGetRoutes(app);
setupKycSubmissionsPostRoute(app);
setupRewardsPostRoute(app);
setupPointsLedgerGetRoutes(app);
setupTechnicalSitesPostRoutes(app);
setupDealersDeleteRoutes(app);
setupPermanentJourneyPlansDeleteRoutes(app);
setupTechnicalVisitReportsDeleteRoutes(app);
setupDailyVisitReportsDeleteRoutes(app);
setupDailyTasksDeleteRoutes(app);
setupSalesmanLeaveApplicationsDeleteRoutes(app);
setupCompetitionReportsDeleteRoutes(app);
setupBrandsDeleteRoutes(app);
setupRatingsDeleteRoutes(app);
setupSalesOrdersDeleteRoutes(app);
setupDealerReportsAndScoresDeleteRoutes(app);
setupTsoMeetingsDeleteRoutes(app);
setupDealersPatchRoutes(app);
setupDealerScoresPatchRoutes(app);
setupRatingsPatchRoutes(app);
setupDailyTaskPatchRoutes(app);
setupDealerBrandMappingPatchRoutes(app);
setupBrandsPatchRoutes(app);
setupPjpPatchRoutes(app);
setupDailyVisitReportsPatchRoutes(app);
setupTechnicalVisitReportsPatchRoutes(app);
setupTsoMeetingsPatchRoutes(app);
setupSalesOrdersPatchRoutes(app);
setupDealerSyncRoutes(app);
setupMasonPcSidePatchRoutes(app);
setupSchemesOffersPatchRoutes(app);
setupBagLiftsPostRoute(app);
setupRewardsRedemptionPostRoute(app);
setupKycSubmissionsPatchRoute(app);
setupRewardsPatchRoute(app);
setupRewardsRedemptionPatchRoute(app);
setupBagLiftsPatchRoute(app);
setupTechnicalSitesUpdateRoutes(app);
setupGeoTrackingRoutes(app);
setupR2Upload(app);
console.log("\u2705 All routes registered successfully.");
setupAiService(app);
setupTelegramService(app);
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Resource not found" });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    details: err.message
  });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\u2705 Server is running and listening on http://0.0.0.0:${PORT}`);
});
