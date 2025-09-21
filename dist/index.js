var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// index.ts
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

// src/db/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  brands: () => brands,
  clientReports: () => clientReports,
  collectionReports: () => collectionReports,
  companies: () => companies,
  competitionReports: () => competitionReports,
  dailyTasks: () => dailyTasks,
  dailyVisitReports: () => dailyVisitReports,
  ddp: () => ddp,
  dealerBrandMapping: () => dealerBrandMapping,
  dealerReportsAndScores: () => dealerReportsAndScores,
  dealers: () => dealers,
  geoTracking: () => geoTracking,
  insertBrandSchema: () => insertBrandSchema,
  insertClientReportSchema: () => insertClientReportSchema,
  insertCollectionReportSchema: () => insertCollectionReportSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCompetitionReportSchema: () => insertCompetitionReportSchema,
  insertDailyTaskSchema: () => insertDailyTaskSchema,
  insertDailyVisitReportSchema: () => insertDailyVisitReportSchema,
  insertDdpSchema: () => insertDdpSchema,
  insertDealerBrandMappingSchema: () => insertDealerBrandMappingSchema,
  insertDealerReportsAndScoresSchema: () => insertDealerReportsAndScoresSchema,
  insertDealerSchema: () => insertDealerSchema,
  insertGeoTrackingSchema: () => insertGeoTrackingSchema,
  insertMasterConnectedTableSchema: () => insertMasterConnectedTableSchema,
  insertPermanentJourneyPlanSchema: () => insertPermanentJourneyPlanSchema,
  insertRatingSchema: () => insertRatingSchema,
  insertSalesOrderSchema: () => insertSalesOrderSchema,
  insertSalesReportSchema: () => insertSalesReportSchema,
  insertSalesmanAttendanceSchema: () => insertSalesmanAttendanceSchema,
  insertSalesmanLeaveApplicationSchema: () => insertSalesmanLeaveApplicationSchema,
  insertTechnicalVisitReportSchema: () => insertTechnicalVisitReportSchema,
  insertUserSchema: () => insertUserSchema,
  masterConnectedTable: () => masterConnectedTable,
  permanentJourneyPlans: () => permanentJourneyPlans,
  ratings: () => ratings,
  salesOrders: () => salesOrders,
  salesReport: () => salesReport,
  salesmanAttendance: () => salesmanAttendance,
  salesmanLeaveApplications: () => salesmanLeaveApplications,
  technicalVisitReports: () => technicalVisitReports,
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
  index
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
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
  salesmanLoginId: varchar("salesman_login_id", { length: 255 }).unique(),
  hashedPassword: text("hashed_password"),
  reportsToId: integer("reports_to_id").references(() => users.id, { onDelete: "set null" })
  // ← Add `: any` here
}, (t) => [
  uniqueIndex("users_companyid_email_unique").on(t.companyId, t.email),
  index("idx_user_company_id").on(t.companyId),
  index("idx_workos_user_id").on(t.workosUserId)
]);
var dailyVisitReports = pgTable("daily_visit_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportDate: date("report_date").notNull(),
  dealerType: varchar("dealer_type", { length: 50 }).notNull(),
  dealerName: varchar("dealer_name", { length: 255 }),
  subDealerName: varchar("sub_dealer_name", { length: 255 }),
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
  inTimeImageUrl: varchar("in_time_image_url", { length: 500 }),
  outTimeImageUrl: varchar("out_time_image_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_daily_visit_reports_user_id").on(t.userId)
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
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
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
  channelPartnerVisit: text("channel_partner_visit")
}, (t) => [
  index("idx_technical_visit_reports_user_id").on(t.userId)
]);
var permanentJourneyPlans = pgTable("permanent_journey_plans", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  planDate: date("plan_date").notNull(),
  areaToBeVisited: varchar("area_to_be_visited", { length: 500 }).notNull(),
  description: varchar("description", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_permanent_journey_plans_user_id").on(t.userId),
  index("idx_permanent_journey_plans_created_by_id").on(t.createdById)
]);
var dealers = pgTable("dealers", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  parentDealerId: varchar("parent_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // ← Add `: any` here
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
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_dealers_user_id").on(t.userId),
  index("idx_dealers_parent_dealer_id").on(t.parentDealerId)
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
  adminRemarks: varchar("admin_remarks", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_salesman_leave_applications_user_id").on(t.userId)
]);
var clientReports = pgTable("client_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`substr(replace(cast(gen_random_uuid() as text),'-',''),1,25)`),
  dealerType: text("dealerType").notNull(),
  dealerSubDealerName: text("dealer_sub_dealer_name").notNull(),
  location: text("location").notNull(),
  typeBestNonBest: text("type_best_non_best").notNull(),
  dealerTotalPotential: numeric("dealerTotalPotential", { precision: 10, scale: 2 }).notNull(),
  dealerBestPotential: numeric("dealerBestPotential", { precision: 10, scale: 2 }).notNull(),
  brandSelling: text("brandSelling").array().notNull(),
  contactPerson: text("contactPerson").notNull(),
  contactPersonPhoneNo: text("contact_person_phone_no").notNull(),
  todayOrderMT: numeric("today_order_mt", { precision: 10, scale: 2 }).notNull(),
  todayCollection: numeric("today_collection_rupees", { precision: 10, scale: 2 }).notNull(),
  feedbacks: text("feedbacks").notNull(),
  solutionsAsPerSalesperson: text("solutions_as_per_salesperson").notNull(),
  anyRemarks: text("anyRemarks").notNull(),
  checkOutTime: timestamp("check_out_time", { withTimezone: true, precision: 6 }).notNull(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
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
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_geo_user_time").on(t.userId, t.recordedAt),
  index("idx_geo_journey_time").on(t.journeyId, t.recordedAt),
  index("idx_geo_active").on(t.isActive),
  index("idx_geo_tracking_user_id").on(t.userId),
  index("idx_geo_tracking_recorded_at").on(t.recordedAt)
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
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" })
}, (t) => [
  index("idx_daily_tasks_user_id").on(t.userId),
  index("idx_daily_tasks_assigned_by_user_id").on(t.assignedByUserId),
  index("idx_daily_tasks_task_date").on(t.taskDate),
  index("idx_daily_tasks_pjp_id").on(t.pjpId),
  index("idx_daily_tasks_related_dealer_id").on(t.relatedDealerId),
  index("idx_daily_tasks_date_user").on(t.taskDate, t.userId),
  index("idx_daily_tasks_status").on(t.status)
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
var salesReport = pgTable("sales_report", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  monthlyTarget: numeric("monthly_target", { precision: 12, scale: 2 }).notNull(),
  tillDateAchievement: numeric("till_date_achievement", { precision: 12, scale: 2 }).notNull(),
  yesterdayTarget: numeric("yesterday_target", { precision: 12, scale: 2 }),
  yesterdayAchievement: numeric("yesterday_achievement", { precision: 12, scale: 2 }),
  salesPersonId: integer("sales_person_id").notNull().references(() => users.id),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id)
});
var collectionReports = pgTable("collection_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  dvrId: varchar("dvr_id", { length: 255 }).notNull().unique().references(() => dailyVisitReports.id, { onDelete: "cascade" }),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id, { onDelete: "cascade" }),
  collectedAmount: numeric("collected_amount", { precision: 12, scale: 2 }).notNull(),
  collectedOnDate: date("collected_on_date").notNull(),
  weeklyTarget: numeric("weekly_target", { precision: 12, scale: 2 }),
  tillDateAchievement: numeric("till_date_achievement", { precision: 12, scale: 2 }),
  yesterdayTarget: numeric("yesterday_target", { precision: 12, scale: 2 }),
  yesterdayAchievement: numeric("yesterday_achievement", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
}, (t) => [
  index("idx_collection_reports_dealer_id").on(t.dealerId)
]);
var ddp = pgTable("dealer_development_process", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id),
  creationDate: date("creation_date").notNull(),
  status: text("status").notNull(),
  obstacle: text("obstacle")
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
  capacityMT: numeric("capacity_mt", { precision: 12, scale: 2 }).notNull()
}, (t) => [
  uniqueIndex("dealer_brand_mapping_dealer_id_brand_id_unique").on(t.dealerId, t.brandId)
]);
var salesOrders = pgTable("sales_orders", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salesmanId: integer("salesman_id").references(() => users.id, { onDelete: "set null" }),
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  orderTotal: numeric("orderTotal", { precision: 12, scale: 2 }).notNull(),
  advancePayment: numeric("advancePayment", { precision: 12, scale: 2 }).notNull(),
  pendingPayment: numeric("pendingPayment", { precision: 12, scale: 2 }).notNull(),
  estimatedDelivery: date("estimatedDelivery").notNull(),
  remarks: varchar("remarks", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_sales_orders_salesman_id").on(t.salesmanId),
  index("idx_sales_orders_dealer_id").on(t.dealerId)
]);
var masterConnectedTable = pgTable("master_connected_table", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  companyId: integer("companyId"),
  userId: integer("userId"),
  dealerId: varchar("dealerId", { length: 255 }),
  dvrId: varchar("dvrId", { length: 255 }),
  tvrId: varchar("tvrId", { length: 255 }),
  permanentJourneyPlanId: varchar("permanentJourneyPlanId", { length: 255 }),
  permanentJourneyPlanCreatedById: integer("permanentJourneyPlanCreatedById"),
  dailyTaskId: varchar("dailyTaskId", { length: 255 }),
  attendanceId: varchar("attendanceId", { length: 255 }),
  leaveApplicationId: varchar("leaveApplicationId", { length: 255 }),
  clientReportId: varchar("clientReportId", { length: 255 }),
  competitionReportId: varchar("competitionReportId", { length: 255 }),
  geoTrackingId: varchar("geoTrackingId", { length: 255 }),
  salesOrderId: varchar("salesOrderId", { length: 255 }),
  // MOVED TO MATCH ORDER
  dealerReportsAndScoresId: varchar("dealerReportsAndScoresId", { length: 255 }),
  salesReportId: integer("salesReportId"),
  collectionReportId: varchar("collectionReportId", { length: 255 }),
  ddpId: integer("ddpId"),
  ratingId: integer("ratingId"),
  brandId: integer("brandId"),
  dealerBrandMappingId: varchar("dealerBrandMappingId", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_mct_company_id").on(t.companyId),
  index("idx_mct_user_id").on(t.userId),
  index("idx_mct_dealer_id").on(t.dealerId),
  index("idx_mct_pjp_id").on(t.permanentJourneyPlanId),
  index("idx_mct_pjp_created_by_id").on(t.permanentJourneyPlanCreatedById),
  index("idx_mct_dailytask_id").on(t.dailyTaskId),
  index("idx_mct_dvr_id").on(t.dvrId),
  index("idx_mct_tvr_id").on(t.tvrId),
  index("idx_mct_attendance_id").on(t.attendanceId),
  index("idx_mct_leave_id").on(t.leaveApplicationId),
  index("idx_mct_client_report_id").on(t.clientReportId),
  index("idx_mct_comp_report_id").on(t.competitionReportId),
  index("idx_mct_geotracking_id").on(t.geoTrackingId),
  index("idx_mct_sales_order_id").on(t.salesOrderId),
  // MOVED TO MATCH ORDER
  index("idx_mct_dealer_scores_id").on(t.dealerReportsAndScoresId),
  index("idx_mct_sales_report_id").on(t.salesReportId),
  index("idx_mct_collection_report_id").on(t.collectionReportId),
  index("idx_mct_ddp_id").on(t.ddpId),
  index("idx_mct_rating_id").on(t.ratingId),
  index("idx_mct_brand_id").on(t.brandId),
  index("idx_mct_dealer_brand_map_id").on(t.dealerBrandMappingId)
]);
var insertCompanySchema = createInsertSchema(companies);
var insertUserSchema = createInsertSchema(users);
var insertDailyVisitReportSchema = createInsertSchema(dailyVisitReports);
var insertTechnicalVisitReportSchema = createInsertSchema(technicalVisitReports);
var insertPermanentJourneyPlanSchema = createInsertSchema(permanentJourneyPlans);
var insertDealerSchema = createInsertSchema(dealers);
var insertSalesmanAttendanceSchema = createInsertSchema(salesmanAttendance);
var insertSalesmanLeaveApplicationSchema = createInsertSchema(salesmanLeaveApplications);
var insertClientReportSchema = createInsertSchema(clientReports);
var insertCompetitionReportSchema = createInsertSchema(competitionReports);
var insertGeoTrackingSchema = createInsertSchema(geoTracking);
var insertDailyTaskSchema = createInsertSchema(dailyTasks);
var insertDealerReportsAndScoresSchema = createInsertSchema(dealerReportsAndScores);
var insertSalesReportSchema = createInsertSchema(salesReport);
var insertCollectionReportSchema = createInsertSchema(collectionReports);
var insertDdpSchema = createInsertSchema(ddp);
var insertRatingSchema = createInsertSchema(ratings);
var insertSalesOrderSchema = createInsertSchema(salesOrders);
var insertBrandSchema = createInsertSchema(brands);
var insertDealerBrandMappingSchema = createInsertSchema(dealerBrandMapping);
var insertMasterConnectedTableSchema = createInsertSchema(masterConnectedTable);

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
function toJsonSafe(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (_, value) => typeof value === "bigint" ? Number(value) : value
  ));
}
function setupAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const loginId = String(req.body?.loginId ?? "").trim();
      const password = String(req.body?.password ?? "");
      if (!loginId || !password)
        return res.status(400).json({ error: "Login ID and password are required bitch" });
      const [row] = await db.select({
        id: users.id,
        email: users.email,
        status: users.status,
        hashedPassword: users.hashedPassword,
        salesmanLoginId: users.salesmanLoginId,
        companyId: users.companyId,
        companyName: companies.companyName
        // optional
      }).from(users).leftJoin(companies, eq(users.companyId, companies.id)).where(or(eq(users.salesmanLoginId, loginId), eq(users.email, loginId))).limit(1);
      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      if (row.status !== "active") return res.status(401).json({ error: "Account is not active" });
      if (!row.hashedPassword || row.hashedPassword !== password)
        return res.status(401).json({ error: "Invalid credentials" });
      const { hashedPassword, ...safe } = row;
      return res.json({ success: true, user: toJsonSafe(safe), message: "Login successful bitch" });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });
  app2.get("/api/user/:id", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
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
        reportsToId: users.reportsToId
      }).from(users).leftJoin(companies, eq(companies.id, users.companyId)).where(eq(users.id, userId)).limit(1);
      if (!rows.length) {
        return res.status(404).json({ error: "User not found" });
      }
      const row = rows[0];
      const user = {
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
        company: row.companyId ? { id: row.companyId, companyName: row.companyName ?? "" } : null
      };
      res.json({ user: toJsonSafe(user) });
    } catch (err) {
      console.error("GET /api/user error:", err);
      res.status(500).json({ error: "Failed to load user" });
    }
  });
  console.log("\u2705 Authentication endpoints setup complete");
}

// src/routes/users.ts
import { eq as eq2, and, desc, like } from "drizzle-orm";
function toJsonSafe2(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (_, value) => typeof value === "bigint" ? Number(value) : value
  ));
}
function createAutoCRUD(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", role, region, area, status, companyId, search, ...filters } = req.query;
      let whereCondition = void 0;
      if (search) {
        whereCondition = like(table.email, `%${search}%`);
      }
      if (role) {
        whereCondition = whereCondition ? and(whereCondition, eq2(table.role, role)) : eq2(table.role, role);
      }
      if (region) {
        whereCondition = whereCondition ? and(whereCondition, eq2(table.region, region)) : eq2(table.region, region);
      }
      if (area) {
        whereCondition = whereCondition ? and(whereCondition, eq2(table.area, area)) : eq2(table.area, area);
      }
      if (status) {
        whereCondition = whereCondition ? and(whereCondition, eq2(table.status, status)) : eq2(table.status, status);
      }
      if (companyId) {
        whereCondition = whereCondition ? and(whereCondition, eq2(table.companyId, parseInt(companyId))) : eq2(table.companyId, parseInt(companyId));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "companyId" || key === "reportsToId") {
            whereCondition = whereCondition ? and(whereCondition, eq2(table[key], parseInt(value))) : eq2(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and(whereCondition, eq2(table[key], value)) : eq2(table[key], value);
          }
        }
      });
      const baseQuery = db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }).from(table);
      let query = baseQuery.$dynamic();
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe2(records) });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/company/:companyId`, async (req, res) => {
    try {
      const { companyId } = req.params;
      const { limit = "50", role, region, area, status } = req.query;
      let whereCondition = eq2(table.companyId, parseInt(companyId));
      if (role) {
        whereCondition = and(whereCondition, eq2(table.role, role));
      }
      if (region) {
        whereCondition = and(whereCondition, eq2(table.region, region));
      }
      if (area) {
        whereCondition = and(whereCondition, eq2(table.area, area));
      }
      if (status) {
        whereCondition = and(whereCondition, eq2(table.status, status));
      }
      const records = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }).from(table).where(whereCondition).orderBy(desc(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe2(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Company error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }).from(table).where(eq2(table.id, parseInt(id))).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      res.json({ success: true, data: toJsonSafe2(record) });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/role/:role`, async (req, res) => {
    try {
      const { role } = req.params;
      const { limit = "50", companyId, region, area, status } = req.query;
      let whereCondition = eq2(table.role, role);
      if (companyId) {
        whereCondition = and(whereCondition, eq2(table.companyId, parseInt(companyId)));
      }
      if (region) {
        whereCondition = and(whereCondition, eq2(table.region, region));
      }
      if (area) {
        whereCondition = and(whereCondition, eq2(table.area, area));
      }
      if (status) {
        whereCondition = and(whereCondition, eq2(table.status, status));
      }
      const records = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }).from(table).where(whereCondition).orderBy(desc(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe2(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Role error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/region/:region`, async (req, res) => {
    try {
      const { region } = req.params;
      const { limit = "50", companyId, role, area, status } = req.query;
      let whereCondition = eq2(table.region, region);
      if (companyId) {
        whereCondition = and(whereCondition, eq2(table.companyId, parseInt(companyId)));
      }
      if (role) {
        whereCondition = and(whereCondition, eq2(table.role, role));
      }
      if (area) {
        whereCondition = and(whereCondition, eq2(table.area, area));
      }
      if (status) {
        whereCondition = and(whereCondition, eq2(table.status, status));
      }
      const records = await db.select({
        id: table.id,
        email: table.email,
        firstName: table.firstName,
        lastName: table.lastName,
        role: table.role,
        phoneNumber: table.phoneNumber,
        region: table.region,
        area: table.area,
        salesmanLoginId: table.salesmanLoginId,
        status: table.status,
        companyId: table.companyId,
        reportsToId: table.reportsToId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }).from(table).where(whereCondition).orderBy(desc(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe2(records) });
    } catch (error) {
      console.error(`Get ${tableName}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
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
    // No auto fields or date fields needed
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
  app2.get("/api/companies/region/:region", async (req, res) => {
    try {
      const { region } = req.params;
      const { limit = "50", area } = req.query;
      let whereCondition = eq3(companies.region, region);
      if (area) {
        whereCondition = and2(whereCondition, eq3(companies.area, area));
      }
      const records = await db.select({
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
      }).from(companies).where(whereCondition).orderBy(desc2(companies.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe3(records) });
    } catch (error) {
      console.error("Get Companies by Region error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch companies by region",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/companies/area/:area", async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = "50", region } = req.query;
      let whereCondition = eq3(companies.area, area);
      if (region) {
        whereCondition = and2(whereCondition, eq3(companies.region, region));
      }
      const records = await db.select({
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
      }).from(companies).where(whereCondition).orderBy(desc2(companies.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: toJsonSafe3(records) });
    } catch (error) {
      console.error("Get Companies by Area error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch companies by area",
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
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  if (endpoint === "brands") {
    app2.get(`/api/${endpoint}`, async (req, res) => {
      try {
        const { limit = "50", search, name, ...filters } = req.query;
        let whereCondition = void 0;
        if (search) {
          whereCondition = like2(table.name, `%${search}%`);
        }
        if (name) {
          whereCondition = whereCondition ? and3(whereCondition, eq4(table.name, name)) : eq4(table.name, name);
        }
        Object.entries(filters).forEach(([key, value]) => {
          if (value && table[key]) {
            whereCondition = whereCondition ? and3(whereCondition, eq4(table[key], value)) : eq4(table[key], value);
          }
        });
        let query = db.select().from(table);
        if (whereCondition) {
          query = query.where(whereCondition);
        }
        const records = await query.orderBy(table.name).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName}s error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/:id`, async (req, res) => {
      try {
        const { id } = req.params;
        const [record] = await db.select().from(table).where(eq4(table.id, parseInt(id))).limit(1);
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
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/name/:name`, async (req, res) => {
      try {
        const { name } = req.params;
        const [record] = await db.select().from(table).where(eq4(table.name, name)).limit(1);
        if (!record) {
          return res.status(404).json({
            success: false,
            error: `${tableName} with name '${name}' not found`
          });
        }
        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Get ${tableName} by name error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}`,
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
          whereCondition = eq4(table.dealerId, dealerId);
        }
        if (brandId) {
          whereCondition = whereCondition ? and3(whereCondition, eq4(table.brandId, parseInt(brandId))) : eq4(table.brandId, parseInt(brandId));
        }
        Object.entries(filters).forEach(([key, value]) => {
          if (value && table[key]) {
            if (key === "brandId") {
              whereCondition = whereCondition ? and3(whereCondition, eq4(table[key], parseInt(value))) : eq4(table[key], parseInt(value));
            } else {
              whereCondition = whereCondition ? and3(whereCondition, eq4(table[key], value)) : eq4(table[key], value);
            }
          }
        });
        let query = db.select().from(table);
        if (whereCondition) {
          query = query.where(whereCondition);
        }
        const records = await query.orderBy(desc3(table.capacityMT)).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName}s error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/:id`, async (req, res) => {
      try {
        const { id } = req.params;
        const [record] = await db.select().from(table).where(eq4(table.id, id)).limit(1);
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
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
      try {
        const { dealerId } = req.params;
        const { limit = "50", brandId } = req.query;
        let whereCondition = eq4(table.dealerId, dealerId);
        if (brandId) {
          whereCondition = and3(whereCondition, eq4(table.brandId, parseInt(brandId)));
        }
        const records = await db.select().from(table).where(whereCondition).orderBy(desc3(table.capacityMT)).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName}s by Dealer error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}s`,
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    app2.get(`/api/${endpoint}/brand/:brandId`, async (req, res) => {
      try {
        const { brandId } = req.params;
        const { limit = "50", dealerId } = req.query;
        let whereCondition = eq4(table.brandId, parseInt(brandId));
        if (dealerId) {
          whereCondition = and3(whereCondition, eq4(table.dealerId, dealerId));
        }
        const records = await db.select().from(table).where(whereCondition).orderBy(desc3(table.capacityMT)).limit(parseInt(limit));
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Get ${tableName}s by Brand error:`, error);
        res.status(500).json({
          success: false,
          error: `Failed to fetch ${tableName}s`,
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

// src/routes/dataFetchingRoutes/clientReports.ts
import { eq as eq5, and as and4, desc as desc4 } from "drizzle-orm";
function createAutoCRUD3(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", userId, dealerType, typeBestNonBest, location, ...filters } = req.query;
      let whereCondition = void 0;
      if (userId) {
        whereCondition = eq5(table.userId, parseInt(userId));
      }
      if (dealerType) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table.dealerType, dealerType)) : eq5(table.dealerType, dealerType);
      }
      if (typeBestNonBest) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table.typeBestNonBest, typeBestNonBest)) : eq5(table.typeBestNonBest, typeBestNonBest);
      }
      if (location) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table.location, location)) : eq5(table.location, location);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and4(whereCondition, eq5(table[key], parseInt(value))) : eq5(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and4(whereCondition, eq5(table[key], value)) : eq5(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc4(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", dealerType, typeBestNonBest } = req.query;
      let whereCondition = eq5(table.userId, parseInt(userId));
      if (dealerType) {
        whereCondition = and4(whereCondition, eq5(table.dealerType, dealerType));
      }
      if (typeBestNonBest) {
        whereCondition = and4(whereCondition, eq5(table.typeBestNonBest, typeBestNonBest));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc4(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq5(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer-type/:dealerType`, async (req, res) => {
    try {
      const { dealerType } = req.params;
      const { limit = "50", userId, typeBestNonBest } = req.query;
      let whereCondition = eq5(table.dealerType, dealerType);
      if (userId) {
        whereCondition = and4(whereCondition, eq5(table.userId, parseInt(userId)));
      }
      if (typeBestNonBest) {
        whereCondition = and4(whereCondition, eq5(table.typeBestNonBest, typeBestNonBest));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc4(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupClientReportsRoutes(app2) {
  createAutoCRUD3(app2, {
    endpoint: "client-reports",
    table: clientReports,
    schema: insertClientReportSchema,
    tableName: "Client Report"
    // No auto fields or date fields needed
  });
  console.log("\u2705 Client Reports GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/collectionReports.ts
import { eq as eq6, and as and5, desc as desc5, gte, lte } from "drizzle-orm";
function createAutoCRUD4(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", dealerId, dvrId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and5(
          gte(table[dateField], startDate),
          lte(table[dateField], endDate)
        );
      }
      if (dealerId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table.dealerId, dealerId)) : eq6(table.dealerId, dealerId);
      }
      if (dvrId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table.dvrId, dvrId)) : eq6(table.dvrId, dvrId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          whereCondition = whereCondition ? and5(whereCondition, eq6(table[key], value)) : eq6(table[key], value);
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc5(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50" } = req.query;
      let whereCondition = eq6(table.dealerId, dealerId);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and5(
          whereCondition,
          gte(table[dateField], startDate),
          lte(table[dateField], endDate)
        );
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc5(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq6(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dvr/:dvrId`, async (req, res) => {
    try {
      const { dvrId } = req.params;
      const [record] = await db.select().from(table).where(eq6(table.dvrId, dvrId)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found for DVR ID: ${dvrId}`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName} by DVR error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCollectionReportsRoutes(app2) {
  createAutoCRUD4(app2, {
    endpoint: "collection-reports",
    table: collectionReports,
    schema: insertCollectionReportSchema,
    tableName: "Collection Report",
    dateField: "collectedOnDate",
    autoFields: {
      collectedOnDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Collection Reports GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/competetionReports.ts
import { eq as eq7, and as and6, desc as desc6, gte as gte2, lte as lte2 } from "drizzle-orm";
function createAutoCRUD5(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, brandName, schemesYesNo, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and6(
          gte2(table[dateField], startDate),
          lte2(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and6(whereCondition, eq7(table.userId, parseInt(userId))) : eq7(table.userId, parseInt(userId));
      }
      if (brandName) {
        whereCondition = whereCondition ? and6(whereCondition, eq7(table.brandName, brandName)) : eq7(table.brandName, brandName);
      }
      if (schemesYesNo) {
        whereCondition = whereCondition ? and6(whereCondition, eq7(table.schemesYesNo, schemesYesNo)) : eq7(table.schemesYesNo, schemesYesNo);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and6(whereCondition, eq7(table[key], parseInt(value))) : eq7(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and6(whereCondition, eq7(table[key], value)) : eq7(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc6(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", brandName } = req.query;
      let whereCondition = eq7(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and6(
          whereCondition,
          gte2(table[dateField], startDate),
          lte2(table[dateField], endDate)
        );
      }
      if (brandName) {
        whereCondition = and6(whereCondition, eq7(table.brandName, brandName));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc6(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq7(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/brand/:brandName`, async (req, res) => {
    try {
      const { brandName } = req.params;
      const { startDate, endDate, limit = "50", userId } = req.query;
      let whereCondition = eq7(table.brandName, brandName);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and6(
          whereCondition,
          gte2(table[dateField], startDate),
          lte2(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and6(whereCondition, eq7(table.userId, parseInt(userId)));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc6(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Brand error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCompetitionReportsRoutes(app2) {
  createAutoCRUD5(app2, {
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
import { eq as eq8, and as and7, desc as desc7, gte as gte3, lte as lte3 } from "drizzle-orm";
function createAutoCRUD6(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", status, userId, assignedByUserId, visitType, relatedDealerId, pjpId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and7(
          gte3(table[dateField], startDate),
          lte3(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table.status, status)) : eq8(table.status, status);
      }
      if (userId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table.userId, parseInt(userId))) : eq8(table.userId, parseInt(userId));
      }
      if (assignedByUserId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table.assignedByUserId, parseInt(assignedByUserId))) : eq8(table.assignedByUserId, parseInt(assignedByUserId));
      }
      if (visitType) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table.visitType, visitType)) : eq8(table.visitType, visitType);
      }
      if (relatedDealerId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table.relatedDealerId, relatedDealerId)) : eq8(table.relatedDealerId, relatedDealerId);
      }
      if (pjpId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table.pjpId, pjpId)) : eq8(table.pjpId, pjpId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          whereCondition = whereCondition ? and7(whereCondition, eq8(table[key], value)) : eq8(table[key], value);
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc7(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", status, visitType } = req.query;
      let whereCondition = eq8(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and7(
          whereCondition,
          gte3(table[dateField], startDate),
          lte3(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = and7(whereCondition, eq8(table.status, status));
      }
      if (visitType) {
        whereCondition = and7(whereCondition, eq8(table.visitType, visitType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc7(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq8(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/assigned-by/:assignedByUserId`, async (req, res) => {
    try {
      const { assignedByUserId } = req.params;
      const { startDate, endDate, limit = "50", status, userId } = req.query;
      let whereCondition = eq8(table.assignedByUserId, parseInt(assignedByUserId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and7(
          whereCondition,
          gte3(table[dateField], startDate),
          lte3(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = and7(whereCondition, eq8(table.status, status));
      }
      if (userId) {
        whereCondition = and7(whereCondition, eq8(table.userId, parseInt(userId)));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc7(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Assigner error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, assignedByUserId } = req.query;
      let whereCondition = eq8(table.status, status);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and7(
          whereCondition,
          gte3(table[dateField], startDate),
          lte3(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and7(whereCondition, eq8(table.userId, parseInt(userId)));
      }
      if (assignedByUserId) {
        whereCondition = and7(whereCondition, eq8(table.assignedByUserId, parseInt(assignedByUserId)));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc7(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyTasksRoutes(app2) {
  createAutoCRUD6(app2, {
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
import { eq as eq9, and as and8, desc as desc8 } from "drizzle-orm";
function createAutoCRUD7(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", region, area, type, userId, ...filters } = req.query;
      let whereCondition = void 0;
      if (region) {
        whereCondition = whereCondition ? and8(whereCondition, eq9(table.region, region)) : eq9(table.region, region);
      }
      if (area) {
        whereCondition = whereCondition ? and8(whereCondition, eq9(table.area, area)) : eq9(table.area, area);
      }
      if (type) {
        whereCondition = whereCondition ? and8(whereCondition, eq9(table.type, type)) : eq9(table.type, type);
      }
      if (userId) {
        whereCondition = whereCondition ? and8(whereCondition, eq9(table.userId, parseInt(userId))) : eq9(table.userId, parseInt(userId));
      }
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc8(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", region, area, type } = req.query;
      let whereCondition = eq9(table.userId, parseInt(userId));
      if (region) {
        whereCondition = and8(whereCondition, eq9(table.region, region));
      }
      if (area) {
        whereCondition = and8(whereCondition, eq9(table.area, area));
      }
      if (type) {
        whereCondition = and8(whereCondition, eq9(table.type, type));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc8(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq9(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/region/:region`, async (req, res) => {
    try {
      const { region } = req.params;
      const { limit = "50", area, type } = req.query;
      let whereCondition = eq9(table.region, region);
      if (area) {
        whereCondition = and8(whereCondition, eq9(table.area, area));
      }
      if (type) {
        whereCondition = and8(whereCondition, eq9(table.type, type));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc8(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/area/:area`, async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = "50", type, region } = req.query;
      let whereCondition = eq9(table.area, area);
      if (region) {
        whereCondition = and8(whereCondition, eq9(table.region, region));
      }
      if (type) {
        whereCondition = and8(whereCondition, eq9(table.type, type));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc8(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Area error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealersRoutes(app2) {
  createAutoCRUD7(app2, {
    endpoint: "dealers",
    table: dealers,
    schema: insertDealerSchema,
    tableName: "Dealer"
    // No auto fields needed - all required fields should be provided
    // No dateField since dealers doesn't have date-based filtering like DVR/TVR
  });
  console.log("\u2705 Dealers GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/pjp.ts
import { eq as eq10, and as and9, desc as desc9, gte as gte4, lte as lte4 } from "drizzle-orm";
function createAutoCRUD8(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", status, userId, createdById, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and9(
          gte4(table[dateField], startDate),
          lte4(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = whereCondition ? and9(whereCondition, eq10(table.status, status)) : eq10(table.status, status);
      }
      if (userId) {
        whereCondition = whereCondition ? and9(whereCondition, eq10(table.userId, parseInt(userId))) : eq10(table.userId, parseInt(userId));
      }
      if (createdById) {
        whereCondition = whereCondition ? and9(whereCondition, eq10(table.createdById, parseInt(createdById))) : eq10(table.createdById, parseInt(createdById));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          whereCondition = whereCondition ? and9(whereCondition, eq10(table[key], value)) : eq10(table[key], value);
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc9(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", status, completed } = req.query;
      let whereCondition = eq10(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and9(
          whereCondition,
          gte4(table[dateField], startDate),
          lte4(table[dateField], endDate)
        );
      }
      if (completed === "true" && table.status) {
        whereCondition = and9(whereCondition, eq10(table.status, "completed"));
      }
      if (status) {
        whereCondition = and9(whereCondition, eq10(table.status, status));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc9(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq10(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/created-by/:createdById`, async (req, res) => {
    try {
      const { createdById } = req.params;
      const { startDate, endDate, limit = "50", status } = req.query;
      let whereCondition = eq10(table.createdById, parseInt(createdById));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and9(
          whereCondition,
          gte4(table[dateField], startDate),
          lte4(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = and9(whereCondition, eq10(table.status, status));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc9(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Creator error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, createdById } = req.query;
      let whereCondition = eq10(table.status, status);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and9(
          whereCondition,
          gte4(table[dateField], startDate),
          lte4(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and9(whereCondition, eq10(table.userId, parseInt(userId)));
      }
      if (createdById) {
        whereCondition = and9(whereCondition, eq10(table.createdById, parseInt(createdById)));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc9(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupPJPRoutes(app2) {
  createAutoCRUD8(app2, {
    endpoint: "pjp",
    table: permanentJourneyPlans,
    schema: insertPermanentJourneyPlanSchema,
    tableName: "Permanent Journey Plan",
    dateField: "planDate",
    autoFields: {
      planDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      // date type
      status: () => "pending"
      // default status
    }
  });
  console.log("\u2705 Permanent Journey Plans GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/ddp.ts
import { eq as eq11, and as and10, desc as desc10, gte as gte5, lte as lte5 } from "drizzle-orm";
function createAutoCRUD9(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, dealerId, status, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and10(
          gte5(table[dateField], startDate),
          lte5(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table.userId, parseInt(userId))) : eq11(table.userId, parseInt(userId));
      }
      if (dealerId) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table.dealerId, dealerId)) : eq11(table.dealerId, dealerId);
      }
      if (status) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table.status, status)) : eq11(table.status, status);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and10(whereCondition, eq11(table[key], parseInt(value))) : eq11(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and10(whereCondition, eq11(table[key], value)) : eq11(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.id;
      const records = await query.orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", status, dealerId } = req.query;
      let whereCondition = eq11(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and10(
          whereCondition,
          gte5(table[dateField], startDate),
          lte5(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = and10(whereCondition, eq11(table.status, status));
      }
      if (dealerId) {
        whereCondition = and10(whereCondition, eq11(table.dealerId, dealerId));
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq11(table.id, parseInt(id))).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50", status, userId } = req.query;
      let whereCondition = eq11(table.dealerId, dealerId);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and10(
          whereCondition,
          gte5(table[dateField], startDate),
          lte5(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = and10(whereCondition, eq11(table.status, status));
      }
      if (userId) {
        whereCondition = and10(whereCondition, eq11(table.userId, parseInt(userId)));
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, dealerId } = req.query;
      let whereCondition = eq11(table.status, status);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and10(
          whereCondition,
          gte5(table[dateField], startDate),
          lte5(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and10(whereCondition, eq11(table.userId, parseInt(userId)));
      }
      if (dealerId) {
        whereCondition = and10(whereCondition, eq11(table.dealerId, dealerId));
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc10(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDdpRoutes(app2) {
  createAutoCRUD9(app2, {
    endpoint: "ddp",
    table: ddp,
    schema: insertDdpSchema,
    tableName: "Dealer Development Process",
    dateField: "creationDate",
    autoFields: {
      creationDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Dealer Development Process GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/dealerReportandScores.ts
import { eq as eq12, and as and11, desc as desc11, gte as gte6, lte as lte6 } from "drizzle-orm";
function createAutoCRUD10(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", dealerId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and11(
          gte6(table[dateField], startDate),
          lte6(table[dateField], endDate)
        );
      }
      if (dealerId) {
        whereCondition = whereCondition ? and11(whereCondition, eq12(table.dealerId, dealerId)) : eq12(table.dealerId, dealerId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          whereCondition = whereCondition ? and11(whereCondition, eq12(table[key], value)) : eq12(table[key], value);
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.id;
      const records = await query.orderBy(desc11(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq12(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50" } = req.query;
      let whereCondition = eq12(table.dealerId, dealerId);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and11(
          whereCondition,
          gte6(table[dateField], startDate),
          lte6(table[dateField], endDate)
        );
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc11(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
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
      let whereCondition = and11(
        gte6(table[scoreType], parseFloat(minScore)),
        lte6(table[scoreType], parseFloat(maxScore))
      );
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and11(
          whereCondition,
          gte6(table[dateField], startDate),
          lte6(table[dateField], endDate)
        );
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc11(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Score Range error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s by score range`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealerReportsAndScoresRoutes(app2) {
  createAutoCRUD10(app2, {
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
import { eq as eq13, and as and12, desc as desc12 } from "drizzle-orm";
function createAutoCRUD11(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", userId, area, region, rating, ...filters } = req.query;
      let whereCondition = void 0;
      if (userId) {
        whereCondition = eq13(table.userId, parseInt(userId));
      }
      if (area) {
        whereCondition = whereCondition ? and12(whereCondition, eq13(table.area, area)) : eq13(table.area, area);
      }
      if (region) {
        whereCondition = whereCondition ? and12(whereCondition, eq13(table.region, region)) : eq13(table.region, region);
      }
      if (rating) {
        whereCondition = whereCondition ? and12(whereCondition, eq13(table.rating, parseInt(rating))) : eq13(table.rating, parseInt(rating));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId" || key === "rating") {
            whereCondition = whereCondition ? and12(whereCondition, eq13(table[key], parseInt(value))) : eq13(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and12(whereCondition, eq13(table[key], value)) : eq13(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc12(table.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = "50", area, region, rating } = req.query;
      let whereCondition = eq13(table.userId, parseInt(userId));
      if (area) {
        whereCondition = and12(whereCondition, eq13(table.area, area));
      }
      if (region) {
        whereCondition = and12(whereCondition, eq13(table.region, region));
      }
      if (rating) {
        whereCondition = and12(whereCondition, eq13(table.rating, parseInt(rating)));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc12(table.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq13(table.id, parseInt(id))).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/area/:area`, async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = "50", userId, region } = req.query;
      let whereCondition = eq13(table.area, area);
      if (userId) {
        whereCondition = and12(whereCondition, eq13(table.userId, parseInt(userId)));
      }
      if (region) {
        whereCondition = and12(whereCondition, eq13(table.region, region));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc12(table.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Area error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/region/:region`, async (req, res) => {
    try {
      const { region } = req.params;
      const { limit = "50", userId, area } = req.query;
      let whereCondition = eq13(table.region, region);
      if (userId) {
        whereCondition = and12(whereCondition, eq13(table.userId, parseInt(userId)));
      }
      if (area) {
        whereCondition = and12(whereCondition, eq13(table.area, area));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc12(table.rating)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Region error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsRoutes(app2) {
  createAutoCRUD11(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating"
    // No auto fields or date fields needed
  });
  console.log("\u2705 Ratings GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/salesmanLeaveApplications.ts
import { eq as eq14, and as and13, desc as desc13, gte as gte8, lte as lte8 } from "drizzle-orm";
function createAutoCRUD12(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, leaveType, status, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and13(
          gte8(table[dateField], startDate),
          lte8(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table.userId, parseInt(userId))) : eq14(table.userId, parseInt(userId));
      }
      if (leaveType) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table.leaveType, leaveType)) : eq14(table.leaveType, leaveType);
      }
      if (status) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table.status, status)) : eq14(table.status, status);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and13(whereCondition, eq14(table[key], parseInt(value))) : eq14(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and13(whereCondition, eq14(table[key], value)) : eq14(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc13(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", status, leaveType } = req.query;
      let whereCondition = eq14(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and13(
          whereCondition,
          gte8(table[dateField], startDate),
          lte8(table[dateField], endDate)
        );
      }
      if (status) {
        whereCondition = and13(whereCondition, eq14(table.status, status));
      }
      if (leaveType) {
        whereCondition = and13(whereCondition, eq14(table.leaveType, leaveType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc13(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq14(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, leaveType } = req.query;
      let whereCondition = eq14(table.status, status);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and13(
          whereCondition,
          gte8(table[dateField], startDate),
          lte8(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and13(whereCondition, eq14(table.userId, parseInt(userId)));
      }
      if (leaveType) {
        whereCondition = and13(whereCondition, eq14(table.leaveType, leaveType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc13(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Status error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsRoutes(app2) {
  createAutoCRUD12(app2, {
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

// src/routes/dataFetchingRoutes/salesReports.ts
import { eq as eq15, and as and14, desc as desc14, gte as gte9, lte as lte9 } from "drizzle-orm";
function createAutoCRUD13(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", salesPersonId, dealerId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and14(
          gte9(table[dateField], startDate),
          lte9(table[dateField], endDate)
        );
      }
      if (salesPersonId) {
        whereCondition = whereCondition ? and14(whereCondition, eq15(table.salesPersonId, parseInt(salesPersonId))) : eq15(table.salesPersonId, parseInt(salesPersonId));
      }
      if (dealerId) {
        whereCondition = whereCondition ? and14(whereCondition, eq15(table.dealerId, dealerId)) : eq15(table.dealerId, dealerId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "salesPersonId") {
            whereCondition = whereCondition ? and14(whereCondition, eq15(table[key], parseInt(value))) : eq15(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and14(whereCondition, eq15(table[key], value)) : eq15(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.id;
      const records = await query.orderBy(desc14(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/salesperson/:salesPersonId`, async (req, res) => {
    try {
      const { salesPersonId } = req.params;
      const { startDate, endDate, limit = "50", dealerId } = req.query;
      let whereCondition = eq15(table.salesPersonId, parseInt(salesPersonId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and14(
          whereCondition,
          gte9(table[dateField], startDate),
          lte9(table[dateField], endDate)
        );
      }
      if (dealerId) {
        whereCondition = and14(whereCondition, eq15(table.dealerId, dealerId));
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc14(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Sales Person error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq15(table.id, parseInt(id))).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50", salesPersonId } = req.query;
      let whereCondition = eq15(table.dealerId, dealerId);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and14(
          whereCondition,
          gte9(table[dateField], startDate),
          lte9(table[dateField], endDate)
        );
      }
      if (salesPersonId) {
        whereCondition = and14(whereCondition, eq15(table.salesPersonId, parseInt(salesPersonId)));
      }
      const orderField = table[dateField] || table.id;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc14(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesReportRoutes(app2) {
  createAutoCRUD13(app2, {
    endpoint: "sales-reports",
    table: salesReport,
    schema: insertSalesReportSchema,
    tableName: "Sales Report",
    dateField: "date",
    autoFields: {
      date: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Sales Report GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/salesOrder.ts
import { eq as eq16, and as and15, desc as desc15, gte as gte10, lte as lte10 } from "drizzle-orm";
function createAutoCRUD14(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", salesmanId, dealerId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and15(
          gte10(table[dateField], startDate),
          lte10(table[dateField], endDate)
        );
      }
      if (salesmanId) {
        whereCondition = whereCondition ? and15(whereCondition, eq16(table.salesmanId, parseInt(salesmanId))) : eq16(table.salesmanId, parseInt(salesmanId));
      }
      if (dealerId) {
        whereCondition = whereCondition ? and15(whereCondition, eq16(table.dealerId, dealerId)) : eq16(table.dealerId, dealerId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "salesmanId") {
            whereCondition = whereCondition ? and15(whereCondition, eq16(table[key], parseInt(value))) : eq16(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and15(whereCondition, eq16(table[key], value)) : eq16(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc15(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/salesman/:salesmanId`, async (req, res) => {
    try {
      const { salesmanId } = req.params;
      const { startDate, endDate, limit = "50", dealerId } = req.query;
      let whereCondition = eq16(table.salesmanId, parseInt(salesmanId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and15(
          whereCondition,
          gte10(table[dateField], startDate),
          lte10(table[dateField], endDate)
        );
      }
      if (dealerId) {
        whereCondition = and15(whereCondition, eq16(table.dealerId, dealerId));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc15(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Salesman error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq16(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50", salesmanId } = req.query;
      let whereCondition = eq16(table.dealerId, dealerId);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and15(
          whereCondition,
          gte10(table[dateField], startDate),
          lte10(table[dateField], endDate)
        );
      }
      if (salesmanId) {
        whereCondition = and15(whereCondition, eq16(table.salesmanId, parseInt(salesmanId)));
      }
      const records = await db.select().from(table).where(whereCondition).orderBy(desc15(table.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesOrdersRoutes(app2) {
  createAutoCRUD14(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order",
    dateField: "estimatedDelivery"
    // No auto fields needed
  });
  console.log("\u2705 Sales Orders GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/dvr.ts
import { eq as eq17, and as and16, desc as desc16, gte as gte11, lte as lte11 } from "drizzle-orm";
function createAutoCRUD15(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, dealerType, visitType, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and16(
          gte11(table[dateField], startDate),
          lte11(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and16(whereCondition, eq17(table.userId, parseInt(userId))) : eq17(table.userId, parseInt(userId));
      }
      if (dealerType) {
        whereCondition = whereCondition ? and16(whereCondition, eq17(table.dealerType, dealerType)) : eq17(table.dealerType, dealerType);
      }
      if (visitType) {
        whereCondition = whereCondition ? and16(whereCondition, eq17(table.visitType, visitType)) : eq17(table.visitType, visitType);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and16(whereCondition, eq17(table[key], parseInt(value))) : eq17(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and16(whereCondition, eq17(table[key], value)) : eq17(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc16(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", dealerType, visitType } = req.query;
      let whereCondition = eq17(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and16(
          whereCondition,
          gte11(table[dateField], startDate),
          lte11(table[dateField], endDate)
        );
      }
      if (dealerType) {
        whereCondition = and16(whereCondition, eq17(table.dealerType, dealerType));
      }
      if (visitType) {
        whereCondition = and16(whereCondition, eq17(table.visitType, visitType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc16(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq17(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/visit-type/:visitType`, async (req, res) => {
    try {
      const { visitType } = req.params;
      const { startDate, endDate, limit = "50", userId, dealerType } = req.query;
      let whereCondition = eq17(table.visitType, visitType);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and16(
          whereCondition,
          gte11(table[dateField], startDate),
          lte11(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and16(whereCondition, eq17(table.userId, parseInt(userId)));
      }
      if (dealerType) {
        whereCondition = and16(whereCondition, eq17(table.dealerType, dealerType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc16(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Visit Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyVisitReportsRoutes(app2) {
  createAutoCRUD15(app2, {
    endpoint: "daily-visit-reports",
    table: dailyVisitReports,
    schema: insertDailyVisitReportSchema,
    tableName: "Daily Visit Report",
    dateField: "reportDate",
    autoFields: {
      reportDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Daily Visit Reports GET endpoints setup complete");
}

// src/routes/dataFetchingRoutes/salesmanAttendance.ts
import { eq as eq18, and as and17, desc as desc17, gte as gte12, lte as lte12 } from "drizzle-orm";
function createAutoCRUD16(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and17(
          gte12(table[dateField], startDate),
          lte12(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and17(whereCondition, eq18(table.userId, parseInt(userId))) : eq18(table.userId, parseInt(userId));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and17(whereCondition, eq18(table[key], parseInt(value))) : eq18(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and17(whereCondition, eq18(table[key], value)) : eq18(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc17(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50" } = req.query;
      let whereCondition = eq18(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and17(
          whereCondition,
          gte12(table[dateField], startDate),
          lte12(table[dateField], endDate)
        );
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc17(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq18(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId/today`, async (req, res) => {
    try {
      const { userId } = req.params;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const [record] = await db.select().from(table).where(
        and17(
          eq18(table.userId, parseInt(userId)),
          eq18(table.attendanceDate, today)
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
      console.error(`Get today's ${tableName} error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch today's ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanAttendanceRoutes(app2) {
  createAutoCRUD16(app2, {
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
import { eq as eq19, and as and18, desc as desc18, gte as gte13, lte as lte13 } from "drizzle-orm";
function createAutoCRUD17(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, visitType, serviceType, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and18(
          gte13(table[dateField], startDate),
          lte13(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and18(whereCondition, eq19(table.userId, parseInt(userId))) : eq19(table.userId, parseInt(userId));
      }
      if (visitType) {
        whereCondition = whereCondition ? and18(whereCondition, eq19(table.visitType, visitType)) : eq19(table.visitType, visitType);
      }
      if (serviceType) {
        whereCondition = whereCondition ? and18(whereCondition, eq19(table.serviceType, serviceType)) : eq19(table.serviceType, serviceType);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and18(whereCondition, eq19(table[key], parseInt(value))) : eq19(table[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and18(whereCondition, eq19(table[key], value)) : eq19(table[key], value);
          }
        }
      });
      let query = db.select().from(table);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await query.orderBy(desc18(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/user/:userId`, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = "50", visitType, serviceType } = req.query;
      let whereCondition = eq19(table.userId, parseInt(userId));
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and18(
          whereCondition,
          gte13(table[dateField], startDate),
          lte13(table[dateField], endDate)
        );
      }
      if (visitType) {
        whereCondition = and18(whereCondition, eq19(table.visitType, visitType));
      }
      if (serviceType) {
        whereCondition = and18(whereCondition, eq19(table.serviceType, serviceType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc18(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by User error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table).where(eq19(table.id, id)).limit(1);
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get(`/api/${endpoint}/visit-type/:visitType`, async (req, res) => {
    try {
      const { visitType } = req.params;
      const { startDate, endDate, limit = "50", userId, serviceType } = req.query;
      let whereCondition = eq19(table.visitType, visitType);
      if (startDate && endDate && dateField && table[dateField]) {
        whereCondition = and18(
          whereCondition,
          gte13(table[dateField], startDate),
          lte13(table[dateField], endDate)
        );
      }
      if (userId) {
        whereCondition = and18(whereCondition, eq19(table.userId, parseInt(userId)));
      }
      if (serviceType) {
        whereCondition = and18(whereCondition, eq19(table.serviceType, serviceType));
      }
      const orderField = table[dateField] || table.createdAt;
      const records = await db.select().from(table).where(whereCondition).orderBy(desc18(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName}s by Visit Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName}s`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupTechnicalVisitReportsRoutes(app2) {
  createAutoCRUD17(app2, {
    endpoint: "technical-visit-reports",
    table: technicalVisitReports,
    schema: insertTechnicalVisitReportSchema,
    tableName: "Technical Visit Report",
    dateField: "reportDate",
    autoFields: {
      reportDate: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // date type
    }
  });
  console.log("\u2705 Technical Visit Reports GET endpoints setup complete");
}

// src/routes/deleteRoutes/dealers.ts
import { eq as eq20, and as and19, gte as gte14, lte as lte14 } from "drizzle-orm";
function createAutoCRUD18(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq20(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq20(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq20(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq20(table.userId, parseInt(userId)));
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/parent/:parentDealerId`, async (req, res) => {
    try {
      const { parentDealerId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table).where(eq20(table.parentDealerId, parentDealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for parent dealer ${parentDealerId}`
        });
      }
      await db.delete(table).where(eq20(table.parentDealerId, parentDealerId));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for parent dealer ${parentDealerId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Parent Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and19(
        gte14(table[dateField], startDate),
        lte14(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealersDeleteRoutes(app2) {
  createAutoCRUD18(app2, {
    endpoint: "dealers",
    table: dealers,
    schema: insertDealerSchema,
    tableName: "Dealer",
    dateField: "createdAt",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Dealers DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/pjp.ts
import { eq as eq21, and as and20, gte as gte15, lte as lte15 } from "drizzle-orm";
function createAutoCRUD19(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq21(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq21(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq21(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq21(table.userId, parseInt(userId)));
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/created-by/:createdById`, async (req, res) => {
    try {
      const { createdById } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table).where(eq21(table.createdById, parseInt(createdById)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found created by user ${createdById}`
        });
      }
      await db.delete(table).where(eq21(table.createdById, parseInt(createdById)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully created by user ${createdById}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Created By error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      const recordsToDelete = await db.select().from(table).where(eq21(table.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with status ${status}`
        });
      }
      await db.delete(table).where(eq21(table.status, status));
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and20(
        gte15(table[dateField], startDate),
        lte15(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupPermanentJourneyPlansDeleteRoutes(app2) {
  createAutoCRUD19(app2, {
    endpoint: "pjp",
    table: permanentJourneyPlans,
    schema: insertPermanentJourneyPlanSchema,
    tableName: "Permanent Journey Plan",
    dateField: "planDate",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Permanent Journey Plans DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/tvr.ts
import { eq as eq22, and as and21, gte as gte16, lte as lte16 } from "drizzle-orm";
function createAutoCRUD20(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq22(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq22(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq22(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq22(table.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table).where(eq22(table.visitType, visitType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with visit type ${visitType}`
        });
      }
      await db.delete(table).where(eq22(table.visitType, visitType));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with visit type ${visitType}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Visit Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and21(
        gte16(table[dateField], startDate),
        lte16(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupTechnicalVisitReportsDeleteRoutes(app2) {
  createAutoCRUD20(app2, {
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
import { eq as eq23, and as and22, gte as gte17, lte as lte17 } from "drizzle-orm";
function createAutoCRUD21(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq23(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq23(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq23(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq23(table.userId, parseInt(userId)));
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/dealer-type/:dealerType`, async (req, res) => {
    try {
      const { dealerType } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table).where(eq23(table.dealerType, dealerType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with dealer type ${dealerType}`
        });
      }
      await db.delete(table).where(eq23(table.dealerType, dealerType));
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
      const recordsToDelete = await db.select().from(table).where(eq23(table.visitType, visitType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with visit type ${visitType}`
        });
      }
      await db.delete(table).where(eq23(table.visitType, visitType));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with visit type ${visitType}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Visit Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and22(
        gte17(table[dateField], startDate),
        lte17(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyVisitReportsDeleteRoutes(app2) {
  createAutoCRUD21(app2, {
    endpoint: "daily-visit-reports",
    table: dailyVisitReports,
    schema: insertDailyVisitReportSchema,
    tableName: "Daily Visit Report",
    dateField: "reportDate",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Daily Visit Reports DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/dailytask.ts
import { eq as eq24, and as and23, gte as gte18, lte as lte18 } from "drizzle-orm";
function createAutoCRUD22(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq24(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq24(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq24(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq24(table.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table).where(eq24(table.assignedByUserId, parseInt(assignedByUserId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found assigned by user ${assignedByUserId}`
        });
      }
      await db.delete(table).where(eq24(table.assignedByUserId, parseInt(assignedByUserId)));
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
      const recordsToDelete = await db.select().from(table).where(eq24(table.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with status ${status}`
        });
      }
      await db.delete(table).where(eq24(table.status, status));
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
      const recordsToDelete = await db.select().from(table).where(eq24(table.relatedDealerId, relatedDealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for dealer ${relatedDealerId}`
        });
      }
      await db.delete(table).where(eq24(table.relatedDealerId, relatedDealerId));
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and23(
        gte18(table[dateField], startDate),
        lte18(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyTasksDeleteRoutes(app2) {
  createAutoCRUD22(app2, {
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

// src/routes/deleteRoutes/salesreport.ts
import { eq as eq25, and as and24, gte as gte19, lte as lte19 } from "drizzle-orm";
function createAutoCRUD23(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq25(table.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq25(table.id, parseInt(id)));
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/salesperson/:salesPersonId`, async (req, res) => {
    try {
      const { salesPersonId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table).where(eq25(table.salesPersonId, parseInt(salesPersonId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for sales person ${salesPersonId}`
        });
      }
      await db.delete(table).where(eq25(table.salesPersonId, parseInt(salesPersonId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for sales person ${salesPersonId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Sales Person error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      const recordsToDelete = await db.select().from(table).where(eq25(table.dealerId, dealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for dealer ${dealerId}`
        });
      }
      await db.delete(table).where(eq25(table.dealerId, dealerId));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for dealer ${dealerId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and24(
        gte19(table[dateField], startDate),
        lte19(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesReportDeleteRoutes(app2) {
  createAutoCRUD23(app2, {
    endpoint: "sales-reports",
    table: salesReport,
    schema: insertSalesReportSchema,
    tableName: "Sales Report",
    dateField: "date",
    autoFields: {}
  });
  console.log("\u2705 Sales Report DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/salesmanleave.ts
import { eq as eq26, and as and25, gte as gte20, lte as lte20 } from "drizzle-orm";
function createAutoCRUD24(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq26(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq26(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq26(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq26(table.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table).where(eq26(table.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with status ${status}`
        });
      }
      await db.delete(table).where(eq26(table.status, status));
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
      const recordsToDelete = await db.select().from(table).where(eq26(table.leaveType, leaveType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with leave type ${leaveType}`
        });
      }
      await db.delete(table).where(eq26(table.leaveType, leaveType));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully with leave type ${leaveType}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Leave Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and25(
        gte20(table[dateField], startDate),
        lte20(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsDeleteRoutes(app2) {
  createAutoCRUD24(app2, {
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
import { eq as eq27, and as and26, gte as gte21, lte as lte21 } from "drizzle-orm";
function createAutoCRUD25(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq27(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq27(table.id, id));
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
      const recordsToDelete = await db.select().from(table).where(eq27(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq27(table.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table).where(eq27(table.brandName, brandName));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for brand ${brandName}`
        });
      }
      await db.delete(table).where(eq27(table.brandName, brandName));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for brand ${brandName}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Brand error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and26(
        gte21(table[dateField], startDate),
        lte21(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCompetitionReportsDeleteRoutes(app2) {
  createAutoCRUD25(app2, {
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

// src/routes/deleteRoutes/collectionreports.ts
function setupCollectionReportsDeleteRoutes(app2) {
  return 0;
}

// src/routes/deleteRoutes/brands.ts
import { eq as eq28 } from "drizzle-orm";
function createAutoCRUD26(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq28(table.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq28(table.id, parseInt(id)));
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
      const [existingRecord] = await db.select().from(table).where(eq28(table.name, name)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} with name '${name}' not found`
        });
      }
      await db.delete(table).where(eq28(table.name, name));
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
      const allRecords = await db.select().from(table);
      if (allRecords.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found to delete`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupBrandsDeleteRoutes(app2) {
  createAutoCRUD26(app2, {
    endpoint: "brands",
    table: brands,
    schema: insertBrandSchema,
    tableName: "Brand",
    autoFields: {}
  });
  console.log("\u2705 Brands DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/ratings.ts
import { eq as eq29 } from "drizzle-orm";
function createAutoCRUD27(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq29(table.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq29(table.id, parseInt(id)));
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
      const recordsToDelete = await db.select().from(table).where(eq29(table.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for user ${userId}`
        });
      }
      await db.delete(table).where(eq29(table.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table).where(eq29(table.area, area));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for area ${area}`
        });
      }
      await db.delete(table).where(eq29(table.area, area));
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
      const recordsToDelete = await db.select().from(table).where(eq29(table.region, region));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for region ${region}`
        });
      }
      await db.delete(table).where(eq29(table.region, region));
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
      const recordsToDelete = await db.select().from(table).where(eq29(table.rating, parseInt(rating)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found with rating ${rating}`
        });
      }
      await db.delete(table).where(eq29(table.rating, parseInt(rating)));
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsDeleteRoutes(app2) {
  createAutoCRUD27(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating",
    autoFields: {}
  });
  console.log("\u2705 Ratings DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/salesOrder.ts
import { eq as eq30, and as and29, gte as gte24, lte as lte24 } from "drizzle-orm";
function createAutoCRUD28(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq30(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq30(table.id, id));
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete(`/api/${endpoint}/salesman/:salesmanId`, async (req, res) => {
    try {
      const { salesmanId } = req.params;
      const { confirm } = req.query;
      if (confirm !== "true") {
        return res.status(400).json({
          success: false,
          error: "This action requires confirmation. Add ?confirm=true to proceed."
        });
      }
      const recordsToDelete = await db.select().from(table).where(eq30(table.salesmanId, parseInt(salesmanId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for salesman ${salesmanId}`
        });
      }
      await db.delete(table).where(eq30(table.salesmanId, parseInt(salesmanId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for salesman ${salesmanId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Salesman error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      const recordsToDelete = await db.select().from(table).where(eq30(table.dealerId, dealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found for dealer ${dealerId}`
        });
      }
      await db.delete(table).where(eq30(table.dealerId, dealerId));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName}(s) deleted successfully for dealer ${dealerId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName}s by Dealer error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName}s`,
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and29(
        gte24(table[dateField], startDate),
        lte24(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesOrdersDeleteRoutes(app2) {
  createAutoCRUD28(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order",
    dateField: "estimatedDelivery",
    autoFields: {
      createdAt: () => (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: () => (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  console.log("\u2705 Sales Orders DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/dealerReportsAndScores.ts
import { eq as eq31, and as and30, gte as gte25, lte as lte25 } from "drizzle-orm";
function createAutoCRUD29(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {}, dateField } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table).where(eq31(table.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName} not found`
        });
      }
      await db.delete(table).where(eq31(table.id, id));
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
      const [existingRecord] = await db.select().from(table).where(eq31(table.dealerId, dealerId)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName} found for dealer ${dealerId}`
        });
      }
      await db.delete(table).where(eq31(table.dealerId, dealerId));
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
      const whereCondition = and30(
        gte25(table[scoreType], parseFloat(minScore)),
        lte25(table[scoreType], parseFloat(maxScore))
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified score range`
        });
      }
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
      if (!dateField || !table[dateField]) {
        return res.status(400).json({
          success: false,
          error: `Date field not available for ${tableName}`
        });
      }
      const whereCondition = and30(
        gte25(table[dateField], startDate),
        lte25(table[dateField], endDate)
      );
      const recordsToDelete = await db.select().from(table).where(whereCondition);
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName}s found in the specified date range`
        });
      }
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealerReportsAndScoresDeleteRoutes(app2) {
  createAutoCRUD29(app2, {
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

// src/routes/formSubmissionRoutes/dvr.ts
import { z } from "zod";
import { randomUUID } from "crypto";
var dailyVisitReportSchema = z.object({
  userId: z.number().int().positive(),
  // DB: date not null
  reportDate: z.preprocess((arg) => arg ? new Date(String(arg)) : void 0, z.date()),
  dealerType: z.string().max(50),
  dealerName: z.string().max(255).optional().nullable(),
  subDealerName: z.string().max(255).optional().nullable(),
  location: z.string().max(500),
  // numeric(10,7)
  latitude: z.preprocess((v) => typeof v === "string" ? parseFloat(v) : v, z.number()),
  longitude: z.preprocess((v) => typeof v === "string" ? parseFloat(v) : v, z.number()),
  visitType: z.string().max(50),
  // numeric(10,2) not null
  dealerTotalPotential: z.preprocess((v) => v === "" || v === null || typeof v === "undefined" ? void 0 : Number(v), z.number()),
  dealerBestPotential: z.preprocess((v) => v === "" || v === null || typeof v === "undefined" ? void 0 : Number(v), z.number()),
  // text array not null
  brandSelling: z.array(z.string()).min(1),
  contactPerson: z.string().max(255).optional().nullable(),
  contactPersonPhoneNo: z.string().max(20).optional().nullable(),
  // numeric not null
  todayOrderMt: z.preprocess((v) => v === "" || v === null || typeof v === "undefined" ? void 0 : Number(v), z.number()),
  todayCollectionRupees: z.preprocess((v) => v === "" || v === null || typeof v === "undefined" ? void 0 : Number(v), z.number()),
  overdueAmount: z.preprocess((v) => v === "" || v === null || typeof v === "undefined" ? null : Number(v), z.number().nullable()),
  // DB: varchar(500) not null
  feedbacks: z.string().max(500).nonempty(),
  solutionBySalesperson: z.string().max(500).optional().nullable(),
  anyRemarks: z.string().max(500).optional().nullable(),
  // timestamps: not null / nullable
  checkInTime: z.preprocess((arg) => arg ? new Date(String(arg)) : void 0, z.date()),
  checkOutTime: z.preprocess((arg) => arg === "" || arg === null || typeof arg === "undefined" ? null : new Date(String(arg)), z.date().nullable()),
  inTimeImageUrl: z.string().max(500).optional().nullable(),
  outTimeImageUrl: z.string().max(500).optional().nullable()
  // createdAt/updatedAt are autoFields; not expected in request
}).strict();
function createAutoCRUD30(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (typeof payload.brandSelling === "string") {
        payload.brandSelling = payload.brandSelling.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(payload);
      const generatedId = randomUUID().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        userId: parsed2.userId,
        reportDate: parsed2.reportDate,
        dealerType: parsed2.dealerType,
        dealerName: parsed2.dealerName ?? null,
        subDealerName: parsed2.subDealerName ?? null,
        location: parsed2.location,
        latitude: parsed2.latitude,
        longitude: parsed2.longitude,
        visitType: parsed2.visitType,
        dealerTotalPotential: parsed2.dealerTotalPotential,
        dealerBestPotential: parsed2.dealerBestPotential,
        brandSelling: parsed2.brandSelling,
        contactPerson: parsed2.contactPerson ?? null,
        contactPersonPhoneNo: parsed2.contactPersonPhoneNo ?? null,
        todayOrderMt: parsed2.todayOrderMt,
        todayCollectionRupees: parsed2.todayCollectionRupees,
        overdueAmount: parsed2.overdueAmount ?? null,
        feedbacks: parsed2.feedbacks,
        solutionBySalesperson: parsed2.solutionBySalesperson ?? null,
        anyRemarks: parsed2.anyRemarks ?? null,
        checkInTime: parsed2.checkInTime,
        checkOutTime: parsed2.checkOutTime ?? null,
        inTimeImageUrl: parsed2.inTimeImageUrl ?? null,
        outTimeImageUrl: parsed2.outTimeImageUrl ?? null,
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyVisitReportsPostRoutes(app2) {
  createAutoCRUD30(app2, {
    endpoint: "daily-visit-reports",
    table: dailyVisitReports,
    schema: dailyVisitReportSchema,
    tableName: "Daily Visit Report",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Daily Visit Reports POST endpoints (DB-schema exact) setup complete");
}

// src/routes/formSubmissionRoutes/tvr.ts
import { z as z2 } from "zod";
import { randomUUID as randomUUID2 } from "crypto";
var technicalVisitReportSchema = z2.object({
  userId: z2.number().int().positive(),
  // Accept string or date; preprocess converts to Date
  reportDate: z2.preprocess((arg) => arg ? new Date(String(arg)) : void 0, z2.date()),
  visitType: z2.string().max(50),
  siteNameConcernedPerson: z2.string().max(255),
  phoneNo: z2.string().max(20),
  emailId: z2.string().max(255).optional().nullable().or(z2.literal("")),
  clientsRemarks: z2.string().max(500),
  salespersonRemarks: z2.string().max(500),
  // Accept string or date; preprocess converts to Date
  checkInTime: z2.preprocess((arg) => arg ? new Date(String(arg)) : void 0, z2.date()),
  checkOutTime: z2.preprocess((arg) => arg === "" || arg === null || typeof arg === "undefined" ? null : new Date(String(arg)), z2.date().nullable()),
  inTimeImageUrl: z2.string().max(500).optional().nullable().or(z2.literal("")),
  outTimeImageUrl: z2.string().max(500).optional().nullable().or(z2.literal("")),
  siteVisitBrandInUse: z2.array(z2.string()).min(1),
  siteVisitStage: z2.string().optional().nullable().or(z2.literal("")),
  conversionFromBrand: z2.string().optional().nullable().or(z2.literal("")),
  // Accept number or string or empty literal or null; always transform to string | null
  conversionQuantityValue: z2.union([z2.number(), z2.string(), z2.literal(""), z2.null()]).transform((val) => {
    if (val === null) return null;
    if (val === "") return null;
    return String(val).trim() === "" ? null : String(val);
  }),
  conversionQuantityUnit: z2.string().max(20).optional().nullable().or(z2.literal("")),
  associatedPartyName: z2.string().optional().nullable().or(z2.literal("")),
  influencerType: z2.array(z2.string()).min(1),
  serviceType: z2.string().optional().nullable().or(z2.literal("")),
  qualityComplaint: z2.string().optional().nullable().or(z2.literal("")),
  promotionalActivity: z2.string().optional().nullable().or(z2.literal("")),
  channelPartnerVisit: z2.string().optional().nullable().or(z2.literal(""))
}).transform((data) => ({
  ...data,
  emailId: data.emailId === "" ? null : data.emailId,
  checkOutTime: data.checkOutTime === "" ? null : data.checkOutTime,
  inTimeImageUrl: data.inTimeImageUrl === "" ? null : data.inTimeImageUrl,
  outTimeImageUrl: data.outTimeImageUrl === "" ? null : data.outTimeImageUrl,
  siteVisitStage: data.siteVisitStage === "" ? null : data.siteVisitStage,
  conversionFromBrand: data.conversionFromBrand === "" ? null : data.conversionFromBrand,
  conversionQuantityValue: data.conversionQuantityValue === "" ? null : data.conversionQuantityValue,
  conversionQuantityUnit: data.conversionQuantityUnit === "" ? null : data.conversionQuantityUnit,
  associatedPartyName: data.associatedPartyName === "" ? null : data.associatedPartyName,
  serviceType: data.serviceType === "" ? null : data.serviceType,
  qualityComplaint: data.qualityComplaint === "" ? null : data.qualityComplaint,
  promotionalActivity: data.promotionalActivity === "" ? null : data.promotionalActivity,
  channelPartnerVisit: data.channelPartnerVisit === "" ? null : data.channelPartnerVisit
}));
function createAutoCRUD31(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (typeof payload.siteVisitBrandInUse === "string") {
        payload.siteVisitBrandInUse = payload.siteVisitBrandInUse.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (typeof payload.influencerType === "string") {
        payload.influencerType = payload.influencerType.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = technicalVisitReportSchema.parse(payload);
      const generatedId = randomUUID2().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        reportDate: parsed2.reportDate instanceof Date ? parsed2.reportDate : new Date(parsed2.reportDate),
        checkInTime: parsed2.checkInTime instanceof Date ? parsed2.checkInTime : new Date(parsed2.checkInTime),
        checkOutTime: parsed2.checkOutTime ? parsed2.checkOutTime instanceof Date ? parsed2.checkOutTime : new Date(parsed2.checkOutTime) : null,
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupTechnicalVisitReportsPostRoutes(app2) {
  createAutoCRUD31(app2, {
    endpoint: "technical-visit-reports",
    table: technicalVisitReports,
    schema: technicalVisitReportSchema,
    tableName: "Technical Visit Report",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Technical Visit Reports POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/pjp.ts
import { z as z3 } from "zod";
import { randomUUID as randomUUID3 } from "crypto";
var permanentJourneyPlanSchema = z3.object({
  userId: z3.number().int().positive(),
  createdById: z3.number().int().positive(),
  planDate: z3.string().or(z3.date()),
  areaToBeVisited: z3.string().max(500),
  description: z3.string().max(500).optional().nullable().or(z3.literal("")),
  status: z3.string().max(50)
}).transform((data) => ({
  ...data,
  description: data.description === "" ? null : data.description
}));
function createAutoCRUD32(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID3();
      const insertData = {
        id: generatedId,
        ...parsed2,
        planDate: new Date(parsed2.planDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupPermanentJourneyPlansPostRoutes(app2) {
  createAutoCRUD32(app2, {
    endpoint: "pjp",
    table: permanentJourneyPlans,
    schema: insertPermanentJourneyPlanSchema,
    tableName: "Permanent Journey Plan",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Permanent Journey Plans POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/addDealer.ts
import { z as z4 } from "zod";
import { eq as eq32 } from "drizzle-orm";
function createAutoCRUD33(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const autoValues = Object.fromEntries(
        Object.entries(autoFields).map(([k, fn]) => [k, fn()])
      );
      const finalData = schema.parse({
        ...req.body,
        ...autoValues
      });
      const raw = req.body;
      const lat = Number(
        raw.latitude ?? raw.lat ?? raw.locationLat ?? raw.locationLatitude ?? raw.location?.latitude
      );
      const lon = Number(
        raw.longitude ?? raw.lng ?? raw.lon ?? raw.locationLng ?? raw.locationLongitude ?? raw.location?.longitude
      );
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({
          success: false,
          error: "Dealer latitude and longitude are required (not stored in DB, used for geofence)"
        });
      }
      const [dealer] = await db.insert(table).values(finalData).returning();
      const tag = "dealer";
      const externalId = `dealer:${dealer.id}`;
      const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;
      const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
      const radius = Math.min(1e4, Math.max(10, Number(raw.radius ?? 25)));
      const form = new URLSearchParams();
      form.set("description", description);
      form.set("type", "circle");
      form.set("coordinates", JSON.stringify([lon, lat]));
      form.set("radius", String(radius));
      const metadata = {
        dealerId: dealer.id,
        userId: dealer.userId,
        region: dealer.region,
        area: dealer.area,
        phoneNo: dealer.phoneNo
      };
      Object.keys(metadata).forEach((k) => metadata[k] == null && delete metadata[k]);
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
        await db.delete(table).where(eq32(table.id, dealer.id));
        return res.status(400).json({
          success: false,
          error: upJson?.meta?.message || upJson?.message || "Failed to upsert dealer geofence in Radar"
        });
      }
      try {
        if (table.radarGeofenceId || table.radarTag || table.radarExternalId) {
          const patch = {};
          if (table.radarGeofenceId) patch.radarGeofenceId = upJson.geofence._id;
          if (table.radarTag) patch.radarTag = upJson.geofence.tag;
          if (table.radarExternalId) patch.radarExternalId = upJson.geofence.externalId;
          if (Object.keys(patch).length) {
            await db.update(table).set(patch).where(eq32(table.id, dealer.id));
          }
        }
      } catch {
      }
      return res.json({
        success: true,
        data: dealer,
        message: `${tableName} created and geofence upserted`,
        geofenceRef: {
          id: upJson.geofence._id,
          tag: upJson.geofence.tag,
          externalId: upJson.geofence.externalId,
          radiusMeters: upJson.geofence.geometryRadius ?? radius
        }
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z4.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealersPostRoutes(app2) {
  createAutoCRUD33(app2, {
    endpoint: "dealers",
    table: dealers,
    schema: insertDealerSchema,
    tableName: "Dealer",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Dealers POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/salesManleave.ts
import { z as z5 } from "zod";
import { randomUUID as randomUUID4 } from "crypto";
function createAutoCRUD34(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID4();
      const insertData = {
        id: generatedId,
        ...parsed2,
        startDate: new Date(parsed2.startDate),
        endDate: new Date(parsed2.endDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z5.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsPostRoutes(app2) {
  createAutoCRUD34(app2, {
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

// src/routes/formSubmissionRoutes/clientReport.ts
import { z as z6 } from "zod";
import { randomUUID as randomUUID5 } from "crypto";
function createAutoCRUD35(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (typeof payload.brandSelling === "string") {
        payload.brandSelling = payload.brandSelling.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(payload);
      const generatedId = randomUUID5().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        checkOutTime: new Date(parsed2.checkOutTime),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupClientReportsPostRoutes(app2) {
  createAutoCRUD35(app2, {
    endpoint: "client-reports",
    table: clientReports,
    schema: insertClientReportSchema,
    tableName: "Client Report",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Client Reports POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/competitionReport.ts
import { z as z7 } from "zod";
import { randomUUID as randomUUID6 } from "crypto";
function createAutoCRUD36(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
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
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z7.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCompetitionReportsPostRoutes(app2) {
  createAutoCRUD36(app2, {
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
function createAutoCRUD37(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
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
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
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
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDailyTasksPostRoutes(app2) {
  createAutoCRUD37(app2, {
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
function createAutoCRUD38(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
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
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z9.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDealerReportsAndScoresPostRoutes(app2) {
  createAutoCRUD38(app2, {
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

// src/routes/formSubmissionRoutes/salesreport.ts
import { z as z10 } from "zod";
function createAutoCRUD39(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const insertData = {
        ...parsed2,
        date: new Date(parsed2.date),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z10.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received,
            expected: err.expected
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesReportPostRoutes(app2) {
  createAutoCRUD39(app2, {
    endpoint: "sales-reports",
    table: salesReport,
    schema: insertSalesReportSchema,
    tableName: "Sales Report"
  });
  console.log("\u2705 Sales Report POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/collectionReport.ts
import { z as z11 } from "zod";
import { randomUUID as randomUUID9 } from "crypto";
function createAutoCRUD40(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID9().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        collectedOnDate: new Date(parsed2.collectedOnDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z11.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupCollectionReportsPostRoutes(app2) {
  createAutoCRUD40(app2, {
    endpoint: "collection-reports",
    table: collectionReports,
    schema: insertCollectionReportSchema,
    tableName: "Collection Report",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Collection Reports POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/ddp.ts
import { z as z12 } from "zod";
function createAutoCRUD41(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const insertData = {
        ...parsed2,
        creationDate: new Date(parsed2.creationDate),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z12.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDdpPostRoutes(app2) {
  createAutoCRUD41(app2, {
    endpoint: "ddp",
    table: ddp,
    schema: insertDdpSchema,
    tableName: "Dealer Development Process"
  });
  console.log("\u2705 DDP POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/ratings.ts
import { z as z13 } from "zod";
function createAutoCRUD42(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
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
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z13.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received
          }))
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsPostRoutes(app2) {
  createAutoCRUD42(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating"
  });
  console.log("\u2705 Ratings POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/brand.ts
import { z as z14 } from "zod";
function createAutoCRUD43(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const autoValues = Object.fromEntries(
        Object.entries(autoFields).map(([k, fn]) => [k, fn()])
      );
      const validatedData = schema.parse({
        ...req.body,
        ...autoValues
      });
      const [newRecord] = await db.insert(table).values(validatedData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z14.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupBrandsPostRoutes(app2) {
  createAutoCRUD43(app2, {
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
import { z as z15 } from "zod";
import { randomUUID as randomUUID10 } from "crypto";
function createAutoCRUD44(app2, config) {
  const { endpoint, table, schema, tableName, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID10();
      const insertData = {
        id: generatedId,
        ...parsed2,
        estimatedDelivery: new Date(parsed2.estimatedDelivery),
        ...executedAutoFields
      };
      const [newRecord] = await db.insert(table).values(insertData).returning();
      res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z15.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            received: err.received,
            expected: err.expected
          })) : []
        });
      }
      res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesOrdersPostRoutes(app2) {
  createAutoCRUD44(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order",
    autoFields: {
      createdAt: () => /* @__PURE__ */ new Date(),
      updatedAt: () => /* @__PURE__ */ new Date()
    }
  });
  console.log("\u2705 Sales Orders POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/brandMapping.ts
import { z as z16 } from "zod";
function createAutoCRUD45(app2, config) {
  const { endpoint, table, schema, tableName } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const validated = schema.parse(req.body);
      const capacityStr = Number(validated.capacityMT).toFixed(2);
      const [newRecord] = await db.insert(table).values({
        dealerId: validated.dealerId,
        brandId: validated.brandId,
        capacityMT: capacityStr
      }).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: newRecord
      });
    } catch (err) {
      console.error(`Create ${tableName} error:`, {
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
      if (err instanceof z16.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: err.errors });
      }
      const msg = String(err?.message ?? "").toLowerCase();
      if (err?.code === "23505" || msg.includes("duplicate") || msg.includes("dealer_brand_mapping_dealer_id_brand_id_unique") || msg.includes("dealer_brand_mapping_dealer_id_brand_id_key")) {
        return res.status(409).json({ success: false, error: "This dealer is already mapped to this brand" });
      }
      if (err?.code === "23503" || msg.includes("foreign key") || msg.includes("violates foreign key constraint")) {
        return res.status(400).json({ success: false, error: "Foreign key violation \u2014 dealer or brand does not exist", details: err?.detail ?? err?.message });
      }
      return res.status(500).json({ success: false, error: `Failed to create ${tableName}`, details: err?.message ?? "Unknown error" });
    }
  });
}
function setupDealerBrandMappingPostRoutes(app2) {
  createAutoCRUD45(app2, {
    endpoint: "dealer-brand-mapping",
    table: dealerBrandMapping,
    schema: insertDealerBrandMappingSchema,
    tableName: "Dealer Brand Mapping"
  });
  console.log("\u2705 Dealer Brand Mapping POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/attendanceIn.ts
import { eq as eq33, and as and31 } from "drizzle-orm";
import { z as z17 } from "zod";
var attendanceInSchema = z17.object({
  userId: z17.number(),
  attendanceDate: z17.string().date().or(z17.string()),
  // accept Date or ISO string
  locationName: z17.string().min(1),
  inTimeImageCaptured: z17.boolean().optional(),
  inTimeImageUrl: z17.string().optional().nullable(),
  inTimeLatitude: z17.number(),
  inTimeLongitude: z17.number(),
  inTimeAccuracy: z17.number().optional().nullable(),
  inTimeSpeed: z17.number().optional().nullable(),
  inTimeHeading: z17.number().optional().nullable(),
  inTimeAltitude: z17.number().optional().nullable()
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
        and31(
          eq33(salesmanAttendance.userId, userId),
          eq33(salesmanAttendance.attendanceDate, dateObj)
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
      if (error instanceof z17.ZodError) {
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
import { eq as eq34, and as and32, isNull } from "drizzle-orm";
import { z as z18 } from "zod";
var attendanceOutSchema = z18.object({
  userId: z18.number(),
  attendanceDate: z18.string().or(z18.date()),
  // allow ISO string or Date
  outTimeImageCaptured: z18.boolean().optional(),
  outTimeImageUrl: z18.string().optional().nullable(),
  outTimeLatitude: z18.number().optional().nullable(),
  outTimeLongitude: z18.number().optional().nullable(),
  outTimeAccuracy: z18.number().optional().nullable(),
  outTimeSpeed: z18.number().optional().nullable(),
  outTimeHeading: z18.number().optional().nullable(),
  outTimeAltitude: z18.number().optional().nullable()
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
        and32(
          eq34(salesmanAttendance.userId, userId),
          eq34(salesmanAttendance.attendanceDate, dateObj),
          isNull(salesmanAttendance.outTimeTimestamp)
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
      const [updatedAttendance] = await db.update(salesmanAttendance).set(updateData).where(eq34(salesmanAttendance.id, existingAttendance.id)).returning();
      res.json({
        success: true,
        message: "Check-out successful",
        data: updatedAttendance
      });
    } catch (error) {
      console.error("Attendance check-out error:", error);
      if (error instanceof z18.ZodError) {
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

// src/routes/updateRoutes/dealers.ts
import { eq as eq35 } from "drizzle-orm";
import { z as z19 } from "zod";
var dealerUpdateSchema = insertDealerSchema.partial();
function setupDealersPatchRoutes(app2) {
  app2.patch("/api/dealers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = dealerUpdateSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update were provided."
        });
      }
      const [existingDealer] = await db.select().from(dealers).where(eq35(dealers.id, id)).limit(1);
      if (!existingDealer) {
        return res.status(404).json({
          success: false,
          error: `Dealer with ID '${id}' not found.`
        });
      }
      const [updatedDealer] = await db.update(dealers).set({
        ...validatedData,
        updatedAt: /* @__PURE__ */ new Date()
        // Automatically update the timestamp
      }).where(eq35(dealers.id, id)).returning();
      res.json({
        success: true,
        message: "Dealer updated successfully",
        data: updatedDealer
      });
    } catch (error) {
      if (error instanceof z19.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update Dealer error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update dealer",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 Dealers PATCH endpoints setup complete");
}

// src/routes/updateRoutes/pjp.ts
import { eq as eq36 } from "drizzle-orm";
import { z as z20 } from "zod";
var pjpUpdateSchema = insertPermanentJourneyPlanSchema.partial();
function setupPjpPatchRoutes(app2) {
  app2.patch("/api/pjp/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = pjpUpdateSchema.parse(req.body);
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update were provided."
        });
      }
      const [existingPjp] = await db.select().from(permanentJourneyPlans).where(eq36(permanentJourneyPlans.id, id)).limit(1);
      if (!existingPjp) {
        return res.status(404).json({
          success: false,
          error: `Permanent Journey Plan with ID '${id}' not found.`
        });
      }
      const [updatedPjp] = await db.update(permanentJourneyPlans).set({
        ...validatedData,
        updatedAt: /* @__PURE__ */ new Date()
        // Automatically update the timestamp
      }).where(eq36(permanentJourneyPlans.id, id)).returning();
      res.json({
        success: true,
        message: "Permanent Journey Plan updated successfully",
        data: updatedPjp
      });
    } catch (error) {
      if (error instanceof z20.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Update PJP error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update Permanent Journey Plan",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  console.log("\u2705 PJP PATCH endpoints setup complete");
}

// src/routes/updateRoutes/dailytask.ts
import { eq as eq37 } from "drizzle-orm";
import { z as z21 } from "zod";
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
      const [existingTask] = await db.select().from(dailyTasks).where(eq37(dailyTasks.id, id)).limit(1);
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
      }).where(eq37(dailyTasks.id, id)).returning();
      res.json({
        success: true,
        message: "Daily Task updated successfully",
        data: updatedTask
      });
    } catch (error) {
      if (error instanceof z21.ZodError) {
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
import { eq as eq38 } from "drizzle-orm";
import { z as z22 } from "zod";
var mappingUpdateSchema = insertDealerBrandMappingSchema.pick({ capacityMT: true });
function setupDealerBrandMappingPatchRoutes(app2) {
  app2.patch("/api/dealer-brand-mapping/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = mappingUpdateSchema.parse(req.body);
      const [existingMapping] = await db.select().from(dealerBrandMapping).where(eq38(dealerBrandMapping.id, id)).limit(1);
      if (!existingMapping) {
        return res.status(404).json({
          success: false,
          error: `Dealer Brand Mapping with ID '${id}' not found.`
        });
      }
      const [updatedMapping] = await db.update(dealerBrandMapping).set({
        capacityMT: validatedData.capacityMT
      }).where(eq38(dealerBrandMapping.id, id)).returning();
      res.json({
        success: true,
        message: "Dealer Brand Mapping updated successfully",
        data: updatedMapping
      });
    } catch (error) {
      if (error instanceof z22.ZodError) {
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
import { eq as eq39 } from "drizzle-orm";
import { z as z23 } from "zod";
var brandUpdateSchema = insertBrandSchema.pick({ name: true });
function setupBrandsPatchRoutes(app2) {
  app2.patch("/api/brands/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid brand ID." });
      }
      const validatedData = brandUpdateSchema.parse(req.body);
      const [existingBrand] = await db.select().from(brands).where(eq39(brands.id, id)).limit(1);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          error: `Brand with ID '${id}' not found.`
        });
      }
      const [updatedBrand] = await db.update(brands).set({
        name: validatedData.name
      }).where(eq39(brands.id, id)).returning();
      res.json({
        success: true,
        message: "Brand updated successfully",
        data: updatedBrand
      });
    } catch (error) {
      if (error instanceof z23.ZodError) {
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
import { eq as eq40 } from "drizzle-orm";
import { z as z24 } from "zod";
var ratingUpdateSchema = insertRatingSchema.pick({ rating: true });
function setupRatingsPatchRoutes(app2) {
  app2.patch("/api/ratings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid rating ID." });
      }
      const validatedData = ratingUpdateSchema.parse(req.body);
      const [existingRating] = await db.select().from(ratings).where(eq40(ratings.id, id)).limit(1);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: `Rating with ID '${id}' not found.`
        });
      }
      const [updatedRating] = await db.update(ratings).set({
        rating: validatedData.rating
      }).where(eq40(ratings.id, id)).returning();
      res.json({
        success: true,
        message: "Rating updated successfully",
        data: updatedRating
      });
    } catch (error) {
      if (error instanceof z24.ZodError) {
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
import { eq as eq41 } from "drizzle-orm";
import { z as z25 } from "zod";
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
      const [existingRecord] = await db.select().from(dealerReportsAndScores).where(eq41(dealerReportsAndScores.dealerId, dealerId)).limit(1);
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
      }).where(eq41(dealerReportsAndScores.dealerId, dealerId)).returning();
      res.json({
        success: true,
        message: "Dealer scores updated successfully",
        data: updatedRecord
      });
    } catch (error) {
      if (error instanceof z25.ZodError) {
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

// src/routes/geoTrackingRoutes/geoTracking.ts
import { eq as eq42, desc as desc31 } from "drizzle-orm";
import { z as z26 } from "zod";
import crypto2 from "crypto";
var geoTrackingUpdateSchema = insertGeoTrackingSchema.partial();
function setupGeoTrackingRoutes(app2) {
  app2.get("/api/geotracking/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID." });
      }
      const records = await db.select().from(geoTracking).where(eq42(geoTracking.userId, userId)).orderBy(desc31(geoTracking.recordedAt));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get Geo-tracking by User ID error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch tracking data." });
    }
  });
  app2.get("/api/geotracking/journey/:journeyId", async (req, res) => {
    try {
      const { journeyId } = req.params;
      const records = await db.select().from(geoTracking).where(eq42(geoTracking.journeyId, journeyId)).orderBy(desc31(geoTracking.recordedAt));
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
      const [latest] = await db.select().from(geoTracking).where(eq42(geoTracking.userId, userId)).orderBy(desc31(geoTracking.recordedAt)).limit(1);
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
        id: crypto2.randomUUID(),
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
      const [existingRecord] = await db.select().from(geoTracking).where(eq42(geoTracking.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ success: false, error: `Tracking record with ID '${id}' not found.` });
      }
      const [updatedRecord] = await db.update(geoTracking).set({ ...validatedData, updatedAt: /* @__PURE__ */ new Date() }).where(eq42(geoTracking.id, id)).returning();
      res.json({ success: true, message: "Tracking record updated successfully", data: updatedRecord });
    } catch (error) {
      if (error instanceof z26.ZodError) {
        return res.status(400).json({ success: false, error: "Validation failed", details: error.issues });
      }
      console.error("Update Geo-tracking error:", error);
      res.status(500).json({ success: false, error: "Failed to update tracking record." });
    }
  });
  console.log("\u2705 Geo-Tracking GET, POST, and PATCH endpoints setup complete");
}

// index.ts
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
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
setupBrandsAndMappingRoutes(app);
setupDealersRoutes(app);
setupDailyTasksRoutes(app);
setupPJPRoutes(app);
setupClientReportsRoutes(app);
setupCollectionReportsRoutes(app);
setupCompetitionReportsRoutes(app);
setupDailyVisitReportsRoutes(app);
setupTechnicalVisitReportsRoutes(app);
setupDdpRoutes(app);
setupDealerReportsAndScoresRoutes(app);
setupRatingsRoutes(app);
setupSalesmanLeaveApplicationsRoutes(app);
setupSalesReportRoutes(app);
setupSalesOrdersRoutes(app);
setupSalesmanAttendanceRoutes(app);
setupTechnicalVisitReportsPostRoutes(app);
setupPermanentJourneyPlansPostRoutes(app);
setupDealersPostRoutes(app);
setupSalesmanLeaveApplicationsPostRoutes(app);
setupClientReportsPostRoutes(app);
setupCompetitionReportsPostRoutes(app);
setupDailyTasksPostRoutes(app);
setupDealerReportsAndScoresPostRoutes(app);
setupSalesReportPostRoutes(app);
setupCollectionReportsPostRoutes(app);
setupDdpPostRoutes(app);
setupRatingsPostRoutes(app);
setupBrandsPostRoutes(app);
setupSalesOrdersPostRoutes(app);
setupDealerBrandMappingPostRoutes(app);
setupDailyVisitReportsPostRoutes(app);
setupAttendanceInPostRoutes(app);
setupAttendanceOutPostRoutes(app);
setupDealersDeleteRoutes(app);
setupPermanentJourneyPlansDeleteRoutes(app);
setupTechnicalVisitReportsDeleteRoutes(app);
setupDailyVisitReportsDeleteRoutes(app);
setupDailyTasksDeleteRoutes(app);
setupSalesReportDeleteRoutes(app);
setupSalesmanLeaveApplicationsDeleteRoutes(app);
setupCompetitionReportsDeleteRoutes(app);
setupCollectionReportsDeleteRoutes(app);
setupBrandsDeleteRoutes(app);
setupRatingsDeleteRoutes(app);
setupSalesOrdersDeleteRoutes(app);
setupDealerReportsAndScoresDeleteRoutes(app);
setupDealersPatchRoutes(app);
setupDealerScoresPatchRoutes(app);
setupRatingsPatchRoutes(app);
setupDailyTaskPatchRoutes(app);
setupDealerBrandMappingPatchRoutes(app);
setupBrandsPatchRoutes(app);
setupPjpPatchRoutes(app);
setupGeoTrackingRoutes(app);
setupR2Upload(app);
console.log("\u2705 All routes registered successfully.");
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
