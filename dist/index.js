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
  giftAllocationLogs: () => giftAllocationLogs,
  giftInventory: () => giftInventory,
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
  insertGiftAllocationLogSchema: () => insertGiftAllocationLogSchema,
  insertGiftInventorySchema: () => insertGiftInventorySchema,
  insertMasterConnectedTableSchema: () => insertMasterConnectedTableSchema,
  insertPermanentJourneyPlanSchema: () => insertPermanentJourneyPlanSchema,
  insertRatingSchema: () => insertRatingSchema,
  insertSalesOrderSchema: () => insertSalesOrderSchema,
  insertSalesReportSchema: () => insertSalesReportSchema,
  insertSalesmanAttendanceSchema: () => insertSalesmanAttendanceSchema,
  insertSalesmanLeaveApplicationSchema: () => insertSalesmanLeaveApplicationSchema,
  insertTechnicalVisitReportSchema: () => insertTechnicalVisitReportSchema,
  insertTsoMeetingSchema: () => insertTsoMeetingSchema,
  insertUserSchema: () => insertUserSchema,
  masterConnectedTable: () => masterConnectedTable,
  permanentJourneyPlans: () => permanentJourneyPlans,
  ratings: () => ratings,
  salesOrders: () => salesOrders,
  salesReport: () => salesReport,
  salesmanAttendance: () => salesmanAttendance,
  salesmanLeaveApplications: () => salesmanLeaveApplications,
  technicalVisitReports: () => technicalVisitReports,
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
  index
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
  // Hierarchy
  // Drizzle needs this slightly loose typing for self-ref
  reportsToId: integer("reports_to_id").references(() => users.id, { onDelete: "set null" }),
  // --- ADDED FOR PRISMA PARITY ---
  noOfPJP: integer("no_of_pjp")
}, (t) => [
  uniqueIndex("users_companyid_email_unique").on(t.companyId, t.email),
  index("idx_user_company_id").on(t.companyId),
  index("idx_workos_user_id").on(t.workosUserId)
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
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
}, (t) => [
  index("idx_tso_meetings_created_by_user_id").on(t.createdByUserId)
]);
var permanentJourneyPlans = pgTable("permanent_journey_plans", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  // --- ✅ THE FIX ---
  // Replaced visitDealerName with a direct, reliable link to the dealers table.
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // --- END FIX ---
  planDate: date("plan_date").notNull(),
  areaToBeVisited: varchar("area_to_be_visited", { length: 500 }).notNull(),
  description: varchar("description", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull(),
  // --- visitDealerName was REMOVED ---
  // visitDealerName: varchar("visit_dealer_name", { length: 255 }), // <-- REMOVED
  verificationStatus: varchar("verification_status", { length: 50 }),
  additionalVisitRemarks: varchar("additional_visit_remarks", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_permanent_journey_plans_user_id").on(t.userId),
  index("idx_permanent_journey_plans_created_by_id").on(t.createdById),
  index("idx_pjp_dealer_id").on(t.dealerId)
  // <-- NEW INDEX ADDED
]);
var dailyVisitReports = pgTable("daily_visit_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // --- ✅ THE FINAL FIX ---
  // The main dealer this visit is associated with.
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // The specific sub-dealer that was visited (if any).
  subDealerId: varchar("sub_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // --- END FIX ---
  reportDate: date("report_date").notNull(),
  dealerType: varchar("dealer_type", { length: 50 }).notNull(),
  // "Dealer" | "Sub Dealer"
  // dealerName: varchar("dealer_name", { length: 255 }), // <-- REMOVED
  // subDealerName: varchar("sub_dealer_name", { length: 255 }), // <-- REMOVED
  location: varchar("location", { length: 500 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  // ... (all your other fields remain the same) ...
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
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_daily_visit_reports_user_id").on(t.userId),
  index("idx_daily_visit_reports_pjp_id").on(t.pjpId),
  index("idx_dvr_dealer_id").on(t.dealerId),
  // <-- NEW INDEX
  index("idx_dvr_sub_dealer_id").on(t.subDealerId)
  // <-- NEW INDEX
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
  // New fields for parity
  siteVisitType: varchar("site_visit_type", { length: 50 }),
  dhalaiVerificationCode: varchar("dhalai_verification_code", { length: 50 }),
  isVerificationStatus: varchar("is_verification_status", { length: 50 }),
  meetingId: varchar("meeting_id", { length: 255 }).references(() => tsoMeetings.id),
  // This now correctly references tsoMeetings
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_technical_visit_reports_user_id").on(t.userId),
  index("idx_technical_visit_reports_meeting_id").on(t.meetingId),
  index("idx_technical_visit_reports_pjp_id").on(t.pjpId)
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
  // --- ✅ NEW FIELDS ADDED ---
  nameOfFirm: varchar("nameOfFirm", { length: 500 }),
  underSalesPromoterName: varchar("underSalesPromoterName", { length: 200 }),
  // --- END NEW FIELDS ---
  gstinNo: varchar("gstin_no", { length: 20 }),
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
  // "Pending" | "Approved" | "Rejected"
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
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
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
  capacityMT: numeric("capacity_mt", { precision: 12, scale: 2 }).notNull(),
  // --- ADDED FOR PRISMA PARITY ---
  bestCapacityMT: numeric("best_capacity_mt", { precision: 12, scale: 2 }),
  brandGrowthCapacityPercent: numeric("brand_growth_capacity_percent", { precision: 5, scale: 2 }),
  userId: integer("user_id").references(() => users.id)
  // -----------------------------
}, (t) => [
  uniqueIndex("dealer_brand_mapping_dealer_id_brand_id_unique").on(t.dealerId, t.brandId)
]);
var giftInventory = pgTable("gift_inventory", {
  id: serial("id").primaryKey(),
  itemName: varchar("item_name", { length: 255 }).notNull().unique(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAvailableQuantity: integer("total_available_quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow()
});
var giftAllocationLogs = pgTable("gift_allocation_logs", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  giftId: integer("gift_id").notNull().references(() => giftInventory.id),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  // Allocation | Transfer | Distribution | Deduction
  quantity: integer("quantity").notNull(),
  sourceUserId: integer("source_user_id").references(() => users.id, { onDelete: "set null" }),
  destinationUserId: integer("destination_user_id").references(() => users.id, { onDelete: "set null" }),
  relatedReportId: varchar("related_report_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_gift_logs_gift_id").on(t.giftId),
  index("idx_gift_logs_user_id").on(t.userId),
  index("idx_gift_logs_source_user_id").on(t.sourceUserId),
  index("idx_gift_logs_destination_user_id").on(t.destinationUserId)
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
  // --- ✅ THE FIX ---
  // Added status field for the Admin approval workflow
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
  // e.g., "Pending", "Approved", "Rejected"
  // --- END FIX ---
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull()
}, (t) => [
  index("idx_sales_orders_dvr_id").on(t.dvrId),
  index("idx_sales_orders_pjp_id").on(t.pjpId),
  index("idx_sales_orders_order_date").on(t.orderDate),
  index("idx_sales_orders_dealer_id").on(t.dealerId),
  // Added index for dealer filtering
  index("idx_sales_orders_status").on(t.status)
  // <-- NEW INDEX ADDED
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
var insertTsoMeetingSchema = createInsertSchema(tsoMeetings);
var insertGiftInventorySchema = createInsertSchema(giftInventory);
var insertGiftAllocationLogSchema = createInsertSchema(giftAllocationLogs);
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
        role: users.role
      }).from(users).where(or(eq(users.salesmanLoginId, loginId), eq(users.email, loginId))).limit(1);
      if (!row) return res.status(401).json({ error: "Invalid credentials" });
      if (row.status !== "active") return res.status(401).json({ error: "Account is not active" });
      if (!row.hashedPassword || row.hashedPassword !== password) {
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
        reportsToId: users.reportsToId
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
import { eq as eq2, and, desc, like, or as or2 } from "drizzle-orm";
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
  // --- ADDED MISSING FIELDS ---
  workosUserId: users.workosUserId,
  inviteToken: users.inviteToken,
  noOfPJP: users.noOfPJP
};
function createAutoCRUD(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", role, region, area, status, companyId, reportsToId, search } = req.query;
      let conditions = [];
      if (search) {
        const searchPattern = `%${String(search).toLowerCase()}%`;
        conditions.push(
          or2(
            like(table4.email, searchPattern),
            like(table4.firstName, searchPattern),
            like(table4.lastName, searchPattern)
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
      const { limit = "50", role, region, area, status } = req.query;
      let conditions = [eq2(table4.companyId, companyId)];
      if (role) conditions.push(eq2(table4.role, role));
      if (region) conditions.push(eq2(table4.region, region));
      if (area) conditions.push(eq2(table4.area, area));
      if (status) conditions.push(eq2(table4.status, status));
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

// src/routes/dataFetchingRoutes/clientReports.ts
import { eq as eq5, and as and4, desc as desc4 } from "drizzle-orm";
function createAutoCRUD3(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", userId, dealerType, typeBestNonBest, location, ...filters } = req.query;
      let whereCondition = void 0;
      if (userId) {
        whereCondition = eq5(table4.userId, parseInt(userId));
      }
      if (dealerType) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table4.dealerType, dealerType)) : eq5(table4.dealerType, dealerType);
      }
      if (typeBestNonBest) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table4.typeBestNonBest, typeBestNonBest)) : eq5(table4.typeBestNonBest, typeBestNonBest);
      }
      if (location) {
        whereCondition = whereCondition ? and4(whereCondition, eq5(table4.location, location)) : eq5(table4.location, location);
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
      const records = await query.orderBy(desc4(table4.createdAt)).limit(parseInt(limit));
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
      const { limit = "50", dealerType, typeBestNonBest } = req.query;
      let whereCondition = eq5(table4.userId, parseInt(userId));
      if (dealerType) {
        whereCondition = and4(whereCondition, eq5(table4.dealerType, dealerType));
      }
      if (typeBestNonBest) {
        whereCondition = and4(whereCondition, eq5(table4.typeBestNonBest, typeBestNonBest));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc4(table4.createdAt)).limit(parseInt(limit));
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
  app2.get(`/api/${endpoint}/dealer-type/:dealerType`, async (req, res) => {
    try {
      const { dealerType } = req.params;
      const { limit = "50", userId, typeBestNonBest } = req.query;
      let whereCondition = eq5(table4.dealerType, dealerType);
      if (userId) {
        whereCondition = and4(whereCondition, eq5(table4.userId, parseInt(userId)));
      }
      if (typeBestNonBest) {
        whereCondition = and4(whereCondition, eq5(table4.typeBestNonBest, typeBestNonBest));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc4(table4.createdAt)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Dealer Type error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}s`,
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
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", dealerId, dvrId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and5(
          gte(table4[dateField2], startDate),
          lte(table4[dateField2], endDate)
        );
      }
      if (dealerId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.dealerId, dealerId)) : eq6(table4.dealerId, dealerId);
      }
      if (dvrId) {
        whereCondition = whereCondition ? and5(whereCondition, eq6(table4.dvrId, dvrId)) : eq6(table4.dvrId, dvrId);
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
  app2.get(`/api/${endpoint}/dealer/:dealerId`, async (req, res) => {
    try {
      const { dealerId } = req.params;
      const { startDate, endDate, limit = "50" } = req.query;
      let whereCondition = eq6(table4.dealerId, dealerId);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and5(
          whereCondition,
          gte(table4[dateField2], startDate),
          lte(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc5(orderField)).limit(parseInt(limit));
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
  app2.get(`/api/${endpoint}/dvr/:dvrId`, async (req, res) => {
    try {
      const { dvrId } = req.params;
      const [record] = await db.select().from(table4).where(eq6(table4.dvrId, dvrId)).limit(1);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found for DVR ID: ${dvrId}`
        });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} by DVR error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch ${tableName4}`,
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
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, brandName, schemesYesNo, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and6(
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and6(whereCondition, eq7(table4.userId, parseInt(userId))) : eq7(table4.userId, parseInt(userId));
      }
      if (brandName) {
        whereCondition = whereCondition ? and6(whereCondition, eq7(table4.brandName, brandName)) : eq7(table4.brandName, brandName);
      }
      if (schemesYesNo) {
        whereCondition = whereCondition ? and6(whereCondition, eq7(table4.schemesYesNo, schemesYesNo)) : eq7(table4.schemesYesNo, schemesYesNo);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and6(whereCondition, eq7(table4[key], parseInt(value))) : eq7(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and6(whereCondition, eq7(table4[key], value)) : eq7(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc6(orderField)).limit(parseInt(limit));
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
      let whereCondition = eq7(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and6(
          whereCondition,
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (brandName) {
        whereCondition = and6(whereCondition, eq7(table4.brandName, brandName));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc6(orderField)).limit(parseInt(limit));
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
      const [record] = await db.select().from(table4).where(eq7(table4.id, id)).limit(1);
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
      let whereCondition = eq7(table4.brandName, brandName);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and6(
          whereCondition,
          gte2(table4[dateField2], startDate),
          lte2(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and6(whereCondition, eq7(table4.userId, parseInt(userId)));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc6(orderField)).limit(parseInt(limit));
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
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", status, userId, assignedByUserId, visitType, relatedDealerId, pjpId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and7(
          gte3(table4[dateField2], startDate),
          lte3(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table4.status, status)) : eq8(table4.status, status);
      }
      if (userId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table4.userId, parseInt(userId))) : eq8(table4.userId, parseInt(userId));
      }
      if (assignedByUserId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table4.assignedByUserId, parseInt(assignedByUserId))) : eq8(table4.assignedByUserId, parseInt(assignedByUserId));
      }
      if (visitType) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table4.visitType, visitType)) : eq8(table4.visitType, visitType);
      }
      if (relatedDealerId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table4.relatedDealerId, relatedDealerId)) : eq8(table4.relatedDealerId, relatedDealerId);
      }
      if (pjpId) {
        whereCondition = whereCondition ? and7(whereCondition, eq8(table4.pjpId, pjpId)) : eq8(table4.pjpId, pjpId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          whereCondition = whereCondition ? and7(whereCondition, eq8(table4[key], value)) : eq8(table4[key], value);
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc7(orderField)).limit(parseInt(limit));
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
      let whereCondition = eq8(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and7(
          whereCondition,
          gte3(table4[dateField2], startDate),
          lte3(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and7(whereCondition, eq8(table4.status, status));
      }
      if (visitType) {
        whereCondition = and7(whereCondition, eq8(table4.visitType, visitType));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc7(orderField)).limit(parseInt(limit));
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
      const [record] = await db.select().from(table4).where(eq8(table4.id, id)).limit(1);
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
      let whereCondition = eq8(table4.assignedByUserId, parseInt(assignedByUserId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and7(
          whereCondition,
          gte3(table4[dateField2], startDate),
          lte3(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and7(whereCondition, eq8(table4.status, status));
      }
      if (userId) {
        whereCondition = and7(whereCondition, eq8(table4.userId, parseInt(userId)));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc7(orderField)).limit(parseInt(limit));
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
      let whereCondition = eq8(table4.status, status);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and7(
          whereCondition,
          gte3(table4[dateField2], startDate),
          lte3(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and7(whereCondition, eq8(table4.userId, parseInt(userId)));
      }
      if (assignedByUserId) {
        whereCondition = and7(whereCondition, eq8(table4.assignedByUserId, parseInt(assignedByUserId)));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc7(orderField)).limit(parseInt(limit));
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
import { eq as eq9, and as and8, desc as desc8, asc, ilike, sql as sql2 } from "drizzle-orm";
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
function createAutoCRUD7(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.region) conds.push(eq9(table4.region, String(q.region)));
    if (q.area) conds.push(eq9(table4.area, String(q.area)));
    if (q.type) conds.push(eq9(table4.type, String(q.type)));
    if (q.userId) {
      const uid = numberish(q.userId);
      if (uid !== void 0) conds.push(eq9(table4.userId, uid));
    }
    if (q.verificationStatus) conds.push(eq9(table4.verificationStatus, String(q.verificationStatus)));
    if (q.pinCode) conds.push(eq9(table4.pinCode, String(q.pinCode)));
    if (q.businessType) conds.push(eq9(table4.businessType, String(q.businessType)));
    if (q.nameOfFirm) {
      conds.push(ilike(table4.nameOfFirm, `%${String(q.nameOfFirm)}%`));
    }
    if (q.underSalesPromoterName) {
      conds.push(ilike(table4.underSalesPromoterName, `%${String(q.underSalesPromoterName)}%`));
    }
    const onlyParents = boolish(q.onlyParents);
    const onlySubs = boolish(q.onlySubs);
    const parentDealerId = q.parentDealerId;
    if (parentDealerId) {
      conds.push(eq9(table4.parentDealerId, parentDealerId));
    } else if (onlyParents) {
      conds.push(sql2`${table4.parentDealerId} IS NULL`);
    } else if (onlySubs) {
      conds.push(sql2`${table4.parentDealerId} IS NOT NULL`);
    }
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql2`(${ilike(table4.name, s)} 
          OR ${ilike(table4.phoneNo, s)} 
          OR ${ilike(table4.address, s)} 
          OR ${ilike(table4.emailId, s)}
          // --- ✅ NEW SEARCH FIELDS ADDED ---
          OR ${ilike(table4.nameOfFirm, s)}
          OR ${ilike(table4.underSalesPromoterName, s)}
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
    return finalConds.length === 1 ? finalConds[0] : and8(...finalConds);
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "name":
        return direction === "asc" ? asc(table4.name) : desc8(table4.name);
      case "region":
        return direction === "asc" ? asc(table4.region) : desc8(table4.region);
      case "area":
        return direction === "asc" ? asc(table4.area) : desc8(table4.area);
      case "type":
        return direction === "asc" ? asc(table4.type) : desc8(table4.type);
      case "verificationStatus":
      case "verification_status":
        return direction === "asc" ? asc(table4.verificationStatus) : desc8(table4.verificationStatus);
      // --- ✅ NEW SORT OPTION ---
      case "salesGrowthPercentage":
        return direction === "asc" ? asc(table4.salesGrowthPercentage) : desc8(table4.salesGrowthPercentage);
      // --- END NEW SORT OPTION ---
      case "createdAt":
        return direction === "asc" ? asc(table4.createdAt) : desc8(table4.createdAt);
      default:
        return desc8(table4.createdAt);
    }
  };
  const listHandler = async (req, res, baseWhere) => {
    try {
      const { limit = "50", page = "1", sortBy, sortDir, ...filters } = req.query;
      const lmt = Math.max(1, Math.min(500, parseInt(String(limit), 10) || 50));
      const pg = Math.max(1, parseInt(String(page), 10) || 1);
      const offset = (pg - 1) * lmt;
      const extra = buildWhere3(filters);
      const whereCondition = baseWhere ? extra ? and8(baseWhere, extra) : baseWhere : extra;
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
    const base = eq9(table4.userId, uid);
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [record] = await db.select().from(table4).where(eq9(table4.id, id)).limit(1);
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
    const base = eq9(table4.region, String(req.params.region));
    return listHandler(req, res, base);
  });
  app2.get(`/api/${endpoint}/area/:area`, (req, res) => {
    const base = eq9(table4.area, String(req.params.area));
    return listHandler(req, res, base);
  });
}
function setupDealersRoutes(app2) {
  createAutoCRUD7(app2, {
    endpoint: "dealers",
    table: dealers,
    schema: insertDealerSchema,
    tableName: "Dealer"
  });
  console.log("\u2705 Dealers GET endpoints with brandSelling & no default verification filter ready");
}

// src/routes/dataFetchingRoutes/pjp.ts
import { and as and9, asc as asc2, desc as desc9, eq as eq10, gte as gte4, ilike as ilike2, lte as lte4, sql as sql3 } from "drizzle-orm";
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
      conds.push(and9(
        gte4(dateColumn, new Date(String(startDate))),
        lte4(dateColumn, new Date(String(endDate)))
      ));
    }
    if (q.status) conds.push(eq10(table4.status, String(q.status)));
    if (q.verificationStatus) {
      conds.push(eq10(table4.verificationStatus, String(q.verificationStatus)));
    }
    if (q.dealerId) {
      conds.push(eq10(table4.dealerId, String(q.dealerId)));
    }
    const completed = boolish2(q.completed);
    if (completed === true) conds.push(eq10(table4.status, "completed"));
    const userId = numberish2(q.userId);
    if (userId !== void 0) conds.push(eq10(table4.userId, userId));
    const createdById = numberish2(q.createdById);
    if (createdById !== void 0) conds.push(eq10(table4.createdById, createdById));
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      const searchConditions = [ilike2(table4.areaToBeVisited, s)];
      if (table4.description) searchConditions.push(ilike2(table4.description, s));
      if (table4.additionalVisitRemarks) searchConditions.push(ilike2(table4.additionalVisitRemarks, s));
      conds.push(sql3`(${sql3.join(searchConditions, sql3` OR `)})`);
    }
    const finalConds = conds.filter(Boolean);
    return finalConds.length ? finalConds.length === 1 ? finalConds[0] : and9(...finalConds) : void 0;
  };
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const key = sortByRaw && SORT_KEYS[sortByRaw] ? SORT_KEYS[sortByRaw] : "planDate";
    const dir = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    const column = table4[key];
    return dir === "asc" ? asc2(column) : desc9(column);
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
      const base = eq10(table4.userId, parseInt(userId, 10));
      const extra = buildWhere3(rest);
      const whereCond = extra ? and9(base, extra) : base;
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
      const base = eq10(table4.createdById, parseInt(createdById, 10));
      const extra = buildWhere3(rest);
      const whereCond = extra ? and9(base, extra) : base;
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
      const base = eq10(table4.status, status);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and9(base, extra) : base;
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
      const [record] = await db.select().from(table4).where(eq10(table4.id, id)).limit(1);
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

// src/routes/dataFetchingRoutes/ddp.ts
import { eq as eq11, and as and10, desc as desc10, gte as gte5, lte as lte5 } from "drizzle-orm";
function createAutoCRUD8(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, dealerId, status, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          gte5(table4[dateField2], startDate),
          lte5(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table4.userId, parseInt(userId))) : eq11(table4.userId, parseInt(userId));
      }
      if (dealerId) {
        whereCondition = whereCondition ? and10(whereCondition, eq11(table4.dealerId, dealerId)) : eq11(table4.dealerId, dealerId);
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
      const orderField = table4[dateField2] || table4.id;
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
      const { startDate, endDate, limit = "50", status, dealerId } = req.query;
      let whereCondition = eq11(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          whereCondition,
          gte5(table4[dateField2], startDate),
          lte5(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and10(whereCondition, eq11(table4.status, status));
      }
      if (dealerId) {
        whereCondition = and10(whereCondition, eq11(table4.dealerId, dealerId));
      }
      const orderField = table4[dateField2] || table4.id;
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
      const [record] = await db.select().from(table4).where(eq11(table4.id, parseInt(id))).limit(1);
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
      const { startDate, endDate, limit = "50", status, userId } = req.query;
      let whereCondition = eq11(table4.dealerId, dealerId);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          whereCondition,
          gte5(table4[dateField2], startDate),
          lte5(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and10(whereCondition, eq11(table4.status, status));
      }
      if (userId) {
        whereCondition = and10(whereCondition, eq11(table4.userId, parseInt(userId)));
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc10(orderField)).limit(parseInt(limit));
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
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, dealerId } = req.query;
      let whereCondition = eq11(table4.status, status);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and10(
          whereCondition,
          gte5(table4[dateField2], startDate),
          lte5(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and10(whereCondition, eq11(table4.userId, parseInt(userId)));
      }
      if (dealerId) {
        whereCondition = and10(whereCondition, eq11(table4.dealerId, dealerId));
      }
      const orderField = table4[dateField2] || table4.id;
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
function setupDdpRoutes(app2) {
  createAutoCRUD8(app2, {
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
function createAutoCRUD9(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", dealerId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and11(
          gte6(table4[dateField2], startDate),
          lte6(table4[dateField2], endDate)
        );
      }
      if (dealerId) {
        whereCondition = whereCondition ? and11(whereCondition, eq12(table4.dealerId, dealerId)) : eq12(table4.dealerId, dealerId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          whereCondition = whereCondition ? and11(whereCondition, eq12(table4[key], value)) : eq12(table4[key], value);
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await query.orderBy(desc11(orderField)).limit(parseInt(limit));
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
      const [record] = await db.select().from(table4).where(eq12(table4.id, id)).limit(1);
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
      let whereCondition = eq12(table4.dealerId, dealerId);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and11(
          whereCondition,
          gte6(table4[dateField2], startDate),
          lte6(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc11(orderField)).limit(parseInt(limit));
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
      let whereCondition = and11(
        gte6(table4[scoreType], parseFloat(minScore)),
        lte6(table4[scoreType], parseFloat(maxScore))
      );
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and11(
          whereCondition,
          gte6(table4[dateField2], startDate),
          lte6(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc11(orderField)).limit(parseInt(limit));
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
  createAutoCRUD9(app2, {
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
function createAutoCRUD10(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { limit = "50", userId, area, region, rating, ...filters } = req.query;
      let whereCondition = void 0;
      if (userId) {
        whereCondition = eq13(table4.userId, parseInt(userId));
      }
      if (area) {
        whereCondition = whereCondition ? and12(whereCondition, eq13(table4.area, area)) : eq13(table4.area, area);
      }
      if (region) {
        whereCondition = whereCondition ? and12(whereCondition, eq13(table4.region, region)) : eq13(table4.region, region);
      }
      if (rating) {
        whereCondition = whereCondition ? and12(whereCondition, eq13(table4.rating, parseInt(rating))) : eq13(table4.rating, parseInt(rating));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId" || key === "rating") {
            whereCondition = whereCondition ? and12(whereCondition, eq13(table4[key], parseInt(value))) : eq13(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and12(whereCondition, eq13(table4[key], value)) : eq13(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const records = await query.orderBy(desc12(table4.rating)).limit(parseInt(limit));
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
      let whereCondition = eq13(table4.userId, parseInt(userId));
      if (area) {
        whereCondition = and12(whereCondition, eq13(table4.area, area));
      }
      if (region) {
        whereCondition = and12(whereCondition, eq13(table4.region, region));
      }
      if (rating) {
        whereCondition = and12(whereCondition, eq13(table4.rating, parseInt(rating)));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc12(table4.rating)).limit(parseInt(limit));
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
      const [record] = await db.select().from(table4).where(eq13(table4.id, parseInt(id))).limit(1);
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
      let whereCondition = eq13(table4.area, area);
      if (userId) {
        whereCondition = and12(whereCondition, eq13(table4.userId, parseInt(userId)));
      }
      if (region) {
        whereCondition = and12(whereCondition, eq13(table4.region, region));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc12(table4.rating)).limit(parseInt(limit));
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
      let whereCondition = eq13(table4.region, region);
      if (userId) {
        whereCondition = and12(whereCondition, eq13(table4.userId, parseInt(userId)));
      }
      if (area) {
        whereCondition = and12(whereCondition, eq13(table4.area, area));
      }
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc12(table4.rating)).limit(parseInt(limit));
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
  createAutoCRUD10(app2, {
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
function createAutoCRUD11(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, leaveType, status, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and13(
          gte8(table4[dateField2], startDate),
          lte8(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table4.userId, parseInt(userId))) : eq14(table4.userId, parseInt(userId));
      }
      if (leaveType) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table4.leaveType, leaveType)) : eq14(table4.leaveType, leaveType);
      }
      if (status) {
        whereCondition = whereCondition ? and13(whereCondition, eq14(table4.status, status)) : eq14(table4.status, status);
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
      const { startDate, endDate, limit = "50", status, leaveType } = req.query;
      let whereCondition = eq14(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and13(
          whereCondition,
          gte8(table4[dateField2], startDate),
          lte8(table4[dateField2], endDate)
        );
      }
      if (status) {
        whereCondition = and13(whereCondition, eq14(table4.status, status));
      }
      if (leaveType) {
        whereCondition = and13(whereCondition, eq14(table4.leaveType, leaveType));
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
  app2.get(`/api/${endpoint}/status/:status`, async (req, res) => {
    try {
      const { status } = req.params;
      const { startDate, endDate, limit = "50", userId, leaveType } = req.query;
      let whereCondition = eq14(table4.status, status);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and13(
          whereCondition,
          gte8(table4[dateField2], startDate),
          lte8(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = and13(whereCondition, eq14(table4.userId, parseInt(userId)));
      }
      if (leaveType) {
        whereCondition = and13(whereCondition, eq14(table4.leaveType, leaveType));
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc13(orderField)).limit(parseInt(limit));
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
  createAutoCRUD11(app2, {
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
function createAutoCRUD12(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", salesPersonId, dealerId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and14(
          gte9(table4[dateField2], startDate),
          lte9(table4[dateField2], endDate)
        );
      }
      if (salesPersonId) {
        whereCondition = whereCondition ? and14(whereCondition, eq15(table4.salesPersonId, parseInt(salesPersonId))) : eq15(table4.salesPersonId, parseInt(salesPersonId));
      }
      if (dealerId) {
        whereCondition = whereCondition ? and14(whereCondition, eq15(table4.dealerId, dealerId)) : eq15(table4.dealerId, dealerId);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "salesPersonId") {
            whereCondition = whereCondition ? and14(whereCondition, eq15(table4[key], parseInt(value))) : eq15(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and14(whereCondition, eq15(table4[key], value)) : eq15(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await query.orderBy(desc14(orderField)).limit(parseInt(limit));
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
  app2.get(`/api/${endpoint}/salesperson/:salesPersonId`, async (req, res) => {
    try {
      const { salesPersonId } = req.params;
      const { startDate, endDate, limit = "50", dealerId } = req.query;
      let whereCondition = eq15(table4.salesPersonId, parseInt(salesPersonId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and14(
          whereCondition,
          gte9(table4[dateField2], startDate),
          lte9(table4[dateField2], endDate)
        );
      }
      if (dealerId) {
        whereCondition = and14(whereCondition, eq15(table4.dealerId, dealerId));
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc14(orderField)).limit(parseInt(limit));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error(`Get ${tableName4}s by Sales Person error:`, error);
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
      const [record] = await db.select().from(table4).where(eq15(table4.id, parseInt(id))).limit(1);
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
      const { startDate, endDate, limit = "50", salesPersonId } = req.query;
      let whereCondition = eq15(table4.dealerId, dealerId);
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and14(
          whereCondition,
          gte9(table4[dateField2], startDate),
          lte9(table4[dateField2], endDate)
        );
      }
      if (salesPersonId) {
        whereCondition = and14(whereCondition, eq15(table4.salesPersonId, parseInt(salesPersonId)));
      }
      const orderField = table4[dateField2] || table4.id;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc14(orderField)).limit(parseInt(limit));
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
}
function setupSalesReportRoutes(app2) {
  createAutoCRUD12(app2, {
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
import { eq as eq16, and as and15, gte as gte10, lte as lte10, desc as desc15, asc as asc3, ilike as ilike3, sql as sql4 } from "drizzle-orm";
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
function createAutoCRUD13(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  const buildSort3 = (sortByRaw, sortDirRaw) => {
    const dir = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortByRaw) {
      case "orderDate":
        return dir === "asc" ? asc3(table4.orderDate) : desc15(table4.orderDate);
      case "deliveryDate":
        return dir === "asc" ? asc3(table4.deliveryDate) : desc15(table4.deliveryDate);
      case "paymentAmount":
        return dir === "asc" ? asc3(table4.paymentAmount) : desc15(table4.paymentAmount);
      case "receivedPayment":
        return dir === "asc" ? asc3(table4.receivedPayment) : desc15(table4.receivedPayment);
      case "pendingPayment":
        return dir === "asc" ? asc3(table4.pendingPayment) : desc15(table4.pendingPayment);
      case "itemPrice":
        return dir === "asc" ? asc3(table4.itemPrice) : desc15(table4.itemPrice);
      case "orderQty":
        return dir === "asc" ? asc3(table4.orderQty) : desc15(table4.orderQty);
      // --- ✅ FIX ---
      case "status":
        return dir === "asc" ? asc3(table4.status) : desc15(table4.status);
      // --- END FIX ---
      case "createdAt":
        return dir === "asc" ? asc3(table4.createdAt) : desc15(table4.createdAt);
      default:
        return desc15(table4.createdAt);
    }
  };
  const buildWhere3 = (q) => {
    const conds = [];
    const uid = integerish(q.userId);
    if (uid !== void 0) conds.push(eq16(table4.userId, uid));
    if (q.dealerId) conds.push(eq16(table4.dealerId, String(q.dealerId)));
    if (q.dvrId) conds.push(eq16(table4.dvrId, String(q.dvrId)));
    if (q.pjpId) conds.push(eq16(table4.pjpId, String(q.pjpId)));
    if (q.orderUnit) conds.push(eq16(table4.orderUnit, String(q.orderUnit)));
    if (q.itemType) conds.push(eq16(table4.itemType, String(q.itemType)));
    if (q.itemGrade) conds.push(eq16(table4.itemGrade, String(q.itemGrade)));
    if (q.paymentMode) conds.push(eq16(table4.paymentMode, String(q.paymentMode)));
    if (q.status) {
      conds.push(eq16(table4.status, String(q.status)));
    }
    const col = pickDateColumn(table4, q.dateField);
    const dateFrom = q.dateFrom ? String(q.dateFrom) : void 0;
    const dateTo = q.dateTo ? String(q.dateTo) : void 0;
    if (dateFrom) conds.push(gte10(col, new Date(dateFrom)));
    if (dateTo) conds.push(lte10(col, new Date(dateTo)));
    const minQty = numberish3(q.minQty), maxQty = numberish3(q.maxQty);
    if (minQty !== void 0) conds.push(gte10(table4.orderQty, minQty));
    if (maxQty !== void 0) conds.push(lte10(table4.orderQty, maxQty));
    const minPay = numberish3(q.minPayment), maxPay = numberish3(q.maxPayment);
    if (minPay !== void 0) conds.push(gte10(table4.paymentAmount, minPay));
    if (maxPay !== void 0) conds.push(lte10(table4.paymentAmount, maxPay));
    const minRecv = numberish3(q.minReceived), maxRecv = numberish3(q.maxReceived);
    if (minRecv !== void 0) conds.push(gte10(table4.receivedPayment, minRecv));
    if (maxRecv !== void 0) conds.push(lte10(table4.receivedPayment, maxRecv));
    const minPending = numberish3(q.minPending), maxPending = numberish3(q.maxPending);
    if (minPending !== void 0) conds.push(gte10(table4.pendingPayment, minPending));
    if (maxPending !== void 0) conds.push(lte10(table4.pendingPayment, maxPending));
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql4`(${ilike3(table4.orderPartyName, s)}
          OR ${ilike3(table4.partyAddress, s)}
          OR ${ilike3(table4.deliveryAddress, s)})`
      );
    }
    const finalConds = conds.filter(Boolean);
    if (finalConds.length === 0) return void 0;
    return finalConds.length === 1 ? finalConds[0] : and15(...finalConds);
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
      const base = eq16(table4.userId, uid);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and15(base, extra) : base;
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
      const base = eq16(table4.dealerId, dealerId);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and15(base, extra) : base;
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
      const [record] = await db.select().from(table4).where(eq16(table4.id, id)).limit(1);
      if (!record) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      res.json({ success: true, data: record });
    } catch (error) {
      console.error(`Get ${tableName4} error:`, error);
      res.status(500).json({ success: false, error: `Failed to fetch ${tableName4}` });
    }
  });
}
function setupSalesOrdersRoutes(app2) {
  createAutoCRUD13(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order"
  });
  console.log("\u2705 Sales Orders GET endpoints (with status) ready");
}

// src/routes/dataFetchingRoutes/dvr.ts
import { and as and16, asc as asc4, desc as desc16, eq as eq17, ilike as ilike4, sql as sql5, gte as gte11, lte as lte11 } from "drizzle-orm";
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
function createAutoCRUD14(app2, config) {
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
    return direction === "asc" ? asc4(column) : desc16(column);
  };
  const buildWhere3 = (q) => {
    const conds = [];
    if (q.dealerId) {
      conds.push(eq17(table4.dealerId, String(q.dealerId)));
    }
    if (q.subDealerId) {
      conds.push(eq17(table4.subDealerId, String(q.subDealerId)));
    }
    const startDate = q.startDate;
    const endDate = q.endDate;
    if (startDate && endDate) {
      conds.push(and16(
        gte11(table4[dateField2], startDate),
        lte11(table4[dateField2], endDate)
      ));
    }
    const uid = numberish4(q.userId);
    if (uid !== void 0) conds.push(eq17(table4.userId, uid));
    if (q.dealerType) conds.push(eq17(table4.dealerType, String(q.dealerType)));
    if (q.visitType) conds.push(eq17(table4.visitType, String(q.visitType)));
    if (q.pjpId) conds.push(eq17(table4.pjpId, String(q.pjpId)));
    if (q.search) {
      const s = `%${String(q.search).trim()}%`;
      conds.push(
        sql5`(${ilike4(table4.location, s)} 
           OR ${ilike4(table4.contactPerson, s)}
           OR ${ilike4(table4.feedbacks, s)})`
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
    return finalConds.length === 1 ? finalConds[0] : and16(...finalConds);
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
      const base = eq17(table4.userId, parseInt(userId, 10));
      const extra = buildWhere3(rest);
      const whereCond = extra ? and16(base, extra) : base;
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
      const [record] = await db.select().from(table4).where(eq17(table4.id, id)).limit(1);
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
      const base = eq17(table4.visitType, visitType);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and16(base, extra) : base;
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
      const base = eq17(table4.pjpId, pjpId);
      const extra = buildWhere3(rest);
      const whereCond = extra ? and16(base, extra) : base;
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
  createAutoCRUD14(app2, {
    endpoint: "daily-visit-reports",
    table: dailyVisitReports,
    tableName: "Daily Visit Report",
    dateField: "reportDate"
  });
  console.log("\u2705 DVR GET endpoints (using dealerId) ready");
}

// src/routes/dataFetchingRoutes/salesmanAttendance.ts
import { eq as eq18, and as and17, desc as desc17, gte as gte12, lte as lte12 } from "drizzle-orm";
function createAutoCRUD15(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.get(`/api/${endpoint}`, async (req, res) => {
    try {
      const { startDate, endDate, limit = "50", userId, ...filters } = req.query;
      let whereCondition = void 0;
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and17(
          gte12(table4[dateField2], startDate),
          lte12(table4[dateField2], endDate)
        );
      }
      if (userId) {
        whereCondition = whereCondition ? and17(whereCondition, eq18(table4.userId, parseInt(userId))) : eq18(table4.userId, parseInt(userId));
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && table4[key]) {
          if (key === "userId") {
            whereCondition = whereCondition ? and17(whereCondition, eq18(table4[key], parseInt(value))) : eq18(table4[key], parseInt(value));
          } else {
            whereCondition = whereCondition ? and17(whereCondition, eq18(table4[key], value)) : eq18(table4[key], value);
          }
        }
      });
      let query = db.select().from(table4);
      if (whereCondition) {
        query = query.where(whereCondition);
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await query.orderBy(desc17(orderField)).limit(parseInt(limit));
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
      let whereCondition = eq18(table4.userId, parseInt(userId));
      if (startDate && endDate && dateField2 && table4[dateField2]) {
        whereCondition = and17(
          whereCondition,
          gte12(table4[dateField2], startDate),
          lte12(table4[dateField2], endDate)
        );
      }
      const orderField = table4[dateField2] || table4.createdAt;
      const records = await db.select().from(table4).where(whereCondition).orderBy(desc17(orderField)).limit(parseInt(limit));
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
      const [record] = await db.select().from(table4).where(eq18(table4.id, id)).limit(1);
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
        and17(
          eq18(table4.userId, parseInt(userId)),
          eq18(table4.attendanceDate, today)
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
  createAutoCRUD15(app2, {
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
import { eq as eq19, and as and18, desc as desc18, gte as gte13, lte as lte13, asc as asc5 } from "drizzle-orm";
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
    conds.push(and18(
      gte13(table[dateField], String(startDate)),
      lte13(table[dateField], String(endDate))
    ));
  }
  if (q.visitType) {
    conds.push(eq19(table.visitType, String(q.visitType)));
  }
  if (q.serviceType) {
    conds.push(eq19(table.serviceType, String(q.serviceType)));
  }
  if (q.pjpId) {
    conds.push(eq19(table.pjpId, String(q.pjpId)));
  }
  if (q.meetingId) {
    conds.push(eq19(table.meetingId, String(q.meetingId)));
  }
  if (q.isVerificationStatus) {
    conds.push(eq19(table.isVerificationStatus, String(q.isVerificationStatus)));
  }
  if (q.siteVisitType) {
    conds.push(eq19(table.siteVisitType, String(q.siteVisitType)));
  }
  const uid = numberish5(q.userId);
  if (uid !== void 0) {
    conds.push(eq19(table.userId, uid));
  }
  const finalConds = conds.filter(Boolean);
  if (finalConds.length === 0) return void 0;
  return and18(...finalConds);
}
function buildSort(sortByRaw, sortDirRaw) {
  const sortKey = sortByRaw === "createdAt" ? "createdAt" : dateField;
  const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
  if (sortKey === "reportDate" || sortKey === "createdAt") {
    return direction === "asc" ? asc5(table[sortKey]) : desc18(table[sortKey]);
  }
  return desc18(table[dateField]);
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
      const userCond = eq19(table.userId, uid);
      const whereCondition = filters ? and18(userCond, filters) : userCond;
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
      const [record] = await db.select().from(table).where(eq19(table.id, id)).limit(1);
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
      const visitCond = eq19(table.visitType, visitType);
      const whereCondition = filters ? and18(visitCond, filters) : visitCond;
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
      const pjpCond = eq19(table.pjpId, pjpId);
      const whereCondition = filters ? and18(pjpCond, filters) : pjpCond;
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
import { eq as eq20, and as and19, desc as desc19, gte as gte14, lte as lte14, asc as asc6 } from "drizzle-orm";
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
    conds.push(and19(
      gte14(table2.date, String(startDate)),
      lte14(table2.date, String(endDate))
    ));
  }
  if (type) {
    conds.push(eq20(table2.type, String(type)));
  }
  const uid = numberish6(q.createdByUserId);
  if (uid !== void 0) {
    conds.push(eq20(table2.createdByUserId, uid));
  }
  const finalConds = conds.filter(Boolean);
  if (finalConds.length === 0) return void 0;
  return and19(...finalConds);
}
function buildSort2(sortByRaw, sortDirRaw) {
  const sortKey = sortByRaw === "createdAt" ? "createdAt" : "date";
  const direction = (sortDirRaw || "").toLowerCase() === "asc" ? "asc" : "desc";
  return direction === "asc" ? asc6(table2[sortKey]) : desc19(table2[sortKey]);
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
      const [record] = await db.select().from(table2).where(eq20(table2.id, id)).limit(1);
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
      const userCond = eq20(table2.createdByUserId, uid);
      const whereCondition = filters ? and19(userCond, filters) : userCond;
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

// src/routes/deleteRoutes/dealers.ts
import { eq as eq21, and as and20, gte as gte15, lte as lte15, inArray } from "drizzle-orm";
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
      const [existing] = await db.select().from(table4).where(eq21(table4.id, id)).limit(1);
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
      await db.delete(table4).where(eq21(table4.id, id));
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
      const rows = await db.select().from(table4).where(eq21(table4.userId, Number(userId)));
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
      const rows = await db.select().from(table4).where(eq21(table4.parentDealerId, parentDealerId));
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
      const rows = await db.select().from(table4).where(eq21(table4.nameOfFirm, nameOfFirm));
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
      const rows = await db.select().from(table4).where(eq21(table4.underSalesPromoterName, promoterName));
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
      const whereCondition = and20(
        gte15(table4[dateField2], new Date(startDate)),
        lte15(table4[dateField2], new Date(endDate))
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
import { eq as eq22, and as and21, gte as gte16, lte as lte16, inArray as inArray2, sql as sql6 } from "drizzle-orm";
async function mctExists(tx) {
  const result = await tx.execute(sql6`
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
      const [exists] = await db.select({ id: table4.id }).from(table4).where(eq22(table4.id, id)).limit(1);
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
      const rows = await db.select({ id: table4.id }).from(table4).where(eq22(table4.userId, userId));
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
      const rows = await db.select({ id: table4.id }).from(table4).where(eq22(table4.createdById, createdById));
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
      const rows = await db.select({ id: table4.id }).from(table4).where(eq22(table4.status, status));
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
      const rows = await db.select({ id: table4.id }).from(table4).where(and21(
        gte16(table4[dateField2], String(startDate)),
        lte16(table4[dateField2], String(endDate))
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
import { eq as eq23, and as and22, gte as gte17, lte as lte17 } from "drizzle-orm";
function createAutoCRUD18(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq23(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq23(table4.id, id));
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
      const recordsToDelete = await db.select().from(table4).where(eq23(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq23(table4.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table4).where(eq23(table4.visitType, visitType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with visit type ${visitType}`
        });
      }
      await db.delete(table4).where(eq23(table4.visitType, visitType));
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
      const whereCondition = and22(
        gte17(table4[dateField2], startDate),
        lte17(table4[dateField2], endDate)
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
import { and as and23, eq as eq24, gte as gte18, lte as lte18, sql as sql7 } from "drizzle-orm";
var mustConfirm = (q) => q.confirm === "true" || q.confirm === true;
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
      const [existing] = await db.select().from(table4).where(eq24(table4.id, id)).limit(1);
      if (!existing) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      await db.delete(table4).where(eq24(table4.id, id));
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
      const ids = await db.select({ id: table4.id }).from(table4).where(eq24(table4.userId, uid));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s for user ${userId}` });
      await db.delete(table4).where(eq24(table4.userId, uid));
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
      const ids = await db.select({ id: table4.id }).from(table4).where(eq24(table4.dealerType, dealerType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s with dealer type ${dealerType}` });
      await db.delete(table4).where(eq24(table4.dealerType, dealerType));
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
      const ids = await db.select({ id: table4.id }).from(table4).where(eq24(table4.visitType, visitType));
      if (ids.length === 0) return res.status(404).json({ success: false, error: `No ${tableName4}s with visit type ${visitType}` });
      await db.delete(table4).where(eq24(table4.visitType, visitType));
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
      const uid = numberish7(req.query.userId);
      const wherePjp = uid !== void 0 ? and23(eq24(table4.pjpId, pjpId), eq24(table4.userId, uid)) : eq24(table4.pjpId, pjpId);
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
      const anyBrand = boolish4(req.query.anyBrand);
      const brandCond = anyBrand ? sql7`${table4.brandSelling} && ${arrLiteral}::text[]` : sql7`${table4.brandSelling} @> ${arrLiteral}::text[]`;
      const uid = numberish7(req.query.userId);
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const whereConds = [brandCond];
      if (uid !== void 0) whereConds.push(eq24(table4.userId, uid));
      if (startDate && endDate) {
        const col = table4[dateField2];
        if (dateField2 === "createdAt" || dateField2 === "updatedAt") {
          whereConds.push(gte18(col, new Date(startDate)), lte18(col, new Date(endDate)));
        } else {
          whereConds.push(gte18(col, startDate), lte18(col, endDate));
        }
      }
      const finalWhere = and23(...whereConds.filter(Boolean));
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
      const whereCondition = dateField2 === "createdAt" || dateField2 === "updatedAt" ? and23(gte18(col, new Date(String(startDate))), lte18(col, new Date(String(endDate)))) : and23(gte18(col, String(startDate)), lte18(col, String(endDate)));
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
import { eq as eq25, and as and24, gte as gte19, lte as lte19 } from "drizzle-orm";
function createAutoCRUD20(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq25(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq25(table4.id, id));
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
      const recordsToDelete = await db.select().from(table4).where(eq25(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq25(table4.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table4).where(eq25(table4.assignedByUserId, parseInt(assignedByUserId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found assigned by user ${assignedByUserId}`
        });
      }
      await db.delete(table4).where(eq25(table4.assignedByUserId, parseInt(assignedByUserId)));
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
      const recordsToDelete = await db.select().from(table4).where(eq25(table4.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with status ${status}`
        });
      }
      await db.delete(table4).where(eq25(table4.status, status));
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
      const recordsToDelete = await db.select().from(table4).where(eq25(table4.relatedDealerId, relatedDealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for dealer ${relatedDealerId}`
        });
      }
      await db.delete(table4).where(eq25(table4.relatedDealerId, relatedDealerId));
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
      const whereCondition = and24(
        gte19(table4[dateField2], startDate),
        lte19(table4[dateField2], endDate)
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

// src/routes/deleteRoutes/salesreport.ts
import { eq as eq26, and as and25, gte as gte20, lte as lte20 } from "drizzle-orm";
function createAutoCRUD21(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq26(table4.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq26(table4.id, parseInt(id)));
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
      const recordsToDelete = await db.select().from(table4).where(eq26(table4.salesPersonId, parseInt(salesPersonId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for sales person ${salesPersonId}`
        });
      }
      await db.delete(table4).where(eq26(table4.salesPersonId, parseInt(salesPersonId)));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for sales person ${salesPersonId}`,
        deletedCount: recordsToDelete.length
      });
    } catch (error) {
      console.error(`Delete ${tableName4}s by Sales Person error:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to delete ${tableName4}s`,
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
      const recordsToDelete = await db.select().from(table4).where(eq26(table4.dealerId, dealerId));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for dealer ${dealerId}`
        });
      }
      await db.delete(table4).where(eq26(table4.dealerId, dealerId));
      res.json({
        success: true,
        message: `${recordsToDelete.length} ${tableName4}(s) deleted successfully for dealer ${dealerId}`,
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
      const whereCondition = and25(
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
function setupSalesReportDeleteRoutes(app2) {
  createAutoCRUD21(app2, {
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
import { eq as eq27, and as and26, gte as gte21, lte as lte21 } from "drizzle-orm";
function createAutoCRUD22(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq27(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq27(table4.id, id));
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
      const recordsToDelete = await db.select().from(table4).where(eq27(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq27(table4.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table4).where(eq27(table4.status, status));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with status ${status}`
        });
      }
      await db.delete(table4).where(eq27(table4.status, status));
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
      const recordsToDelete = await db.select().from(table4).where(eq27(table4.leaveType, leaveType));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with leave type ${leaveType}`
        });
      }
      await db.delete(table4).where(eq27(table4.leaveType, leaveType));
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
      const whereCondition = and26(
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
  createAutoCRUD22(app2, {
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
import { eq as eq28, and as and27, gte as gte22, lte as lte22 } from "drizzle-orm";
function createAutoCRUD23(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq28(table4.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq28(table4.id, id));
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
      const recordsToDelete = await db.select().from(table4).where(eq28(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq28(table4.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table4).where(eq28(table4.brandName, brandName));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for brand ${brandName}`
        });
      }
      await db.delete(table4).where(eq28(table4.brandName, brandName));
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
      const whereCondition = and27(
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
  createAutoCRUD23(app2, {
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
import { eq as eq29 } from "drizzle-orm";
function createAutoCRUD24(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq29(table4.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq29(table4.id, parseInt(id)));
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
      const [existingRecord] = await db.select().from(table4).where(eq29(table4.name, name)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} with name '${name}' not found`
        });
      }
      await db.delete(table4).where(eq29(table4.name, name));
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
  createAutoCRUD24(app2, {
    endpoint: "brands",
    table: brands,
    schema: insertBrandSchema,
    tableName: "Brand",
    autoFields: {}
  });
  console.log("\u2705 Brands DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/ratings.ts
import { eq as eq30 } from "drizzle-orm";
function createAutoCRUD25(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {}, dateField: dateField2 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existingRecord] = await db.select().from(table4).where(eq30(table4.id, parseInt(id))).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `${tableName4} not found`
        });
      }
      await db.delete(table4).where(eq30(table4.id, parseInt(id)));
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
      const recordsToDelete = await db.select().from(table4).where(eq30(table4.userId, parseInt(userId)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for user ${userId}`
        });
      }
      await db.delete(table4).where(eq30(table4.userId, parseInt(userId)));
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
      const recordsToDelete = await db.select().from(table4).where(eq30(table4.area, area));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for area ${area}`
        });
      }
      await db.delete(table4).where(eq30(table4.area, area));
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
      const recordsToDelete = await db.select().from(table4).where(eq30(table4.region, region));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found for region ${region}`
        });
      }
      await db.delete(table4).where(eq30(table4.region, region));
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
      const recordsToDelete = await db.select().from(table4).where(eq30(table4.rating, parseInt(rating)));
      if (recordsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4}s found with rating ${rating}`
        });
      }
      await db.delete(table4).where(eq30(table4.rating, parseInt(rating)));
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
  createAutoCRUD25(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating",
    autoFields: {}
  });
  console.log("\u2705 Ratings DELETE endpoints setup complete");
}

// src/routes/deleteRoutes/salesOrder.ts
import { eq as eq31, and as and30, gte as gte25, lte as lte25 } from "drizzle-orm";
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
function createAutoCRUD26(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(table4).where(eq31(table4.id, id)).limit(1);
      if (!existing) return res.status(404).json({ success: false, error: `${tableName4} not found` });
      await db.delete(table4).where(eq31(table4.id, id));
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
      const rows = await db.select().from(table4).where(eq31(table4.userId, parseInt(userId, 10)));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for user ${userId}` });
      await db.delete(table4).where(eq31(table4.userId, parseInt(userId, 10)));
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
      const rows = await db.select().from(table4).where(eq31(table4.dealerId, dealerId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for dealer ${dealerId}` });
      await db.delete(table4).where(eq31(table4.dealerId, dealerId));
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
      const rows = await db.select().from(table4).where(eq31(table4.dvrId, dvrId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for DVR ${dvrId}` });
      await db.delete(table4).where(eq31(table4.dvrId, dvrId));
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
      const rows = await db.select().from(table4).where(eq31(table4.pjpId, pjpId));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s for PJP ${pjpId}` });
      await db.delete(table4).where(eq31(table4.pjpId, pjpId));
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
      const rows = await db.select().from(table4).where(eq31(table4.status, status));
      if (!rows.length) return res.status(404).json({ success: false, error: `No ${tableName4}s with status ${status}` });
      await db.delete(table4).where(eq31(table4.status, status));
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
      const whereCond = and30(
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
  createAutoCRUD26(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    schema: insertSalesOrderSchema,
    tableName: "Sales Order"
  });
  console.log("\u2705 Sales Orders DELETE endpoints (with status) ready");
}

// src/routes/deleteRoutes/dealerReportsAndScores.ts
import { eq as eq32, and as and31, gte as gte26, lte as lte26 } from "drizzle-orm";
function createAutoCRUD27(app2, config) {
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
      const [existingRecord] = await db.select().from(table4).where(eq32(table4.dealerId, dealerId)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: `No ${tableName4} found for dealer ${dealerId}`
        });
      }
      await db.delete(table4).where(eq32(table4.dealerId, dealerId));
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
      const whereCondition = and31(
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
      const whereCondition = and31(
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
  createAutoCRUD27(app2, {
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
import { eq as eq33 } from "drizzle-orm";
var table3 = tsoMeetings;
var tableName3 = "TSO Meeting";
function setupTsoMeetingsDeleteRoutes(app2) {
  const endpoint = "tso-meetings";
  app2.delete(`/api/${endpoint}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select({ id: table3.id }).from(table3).where(eq33(table3.id, id)).limit(1);
      if (!existing) {
        return res.status(404).json({ success: false, error: `${tableName3} not found` });
      }
      await db.delete(table3).where(eq33(table3.id, id));
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
      const rows = await db.select({ id: table3.id }).from(table3).where(eq33(table3.createdByUserId, userId));
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: `No ${tableName3}s found for user ${userId}` });
      }
      const ids = rows.map((r) => r.id);
      await db.delete(table3).where(eq33(table3.createdByUserId, userId));
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

// src/routes/formSubmissionRoutes/dvr.ts
import { z } from "zod";
import { randomUUID } from "crypto";
var toDateOnly = (d) => d.toISOString().slice(0, 10);
var toStringArray = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s.includes(",") ? s.split(",").map((t) => t.trim()).filter(Boolean) : [s];
  }
  return [];
};
var strOrNull = z.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z.string().nullable().optional());
var numOrNull = z.preprocess((val) => val === "" || val === null || val === void 0 ? null : val, z.coerce.number().nullable().optional());
var dvrInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  dealerId: strOrNull,
  subDealerId: strOrNull,
  reportDate: z.coerce.date(),
  dealerType: z.string().max(50),
  location: z.string().max(500),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  visitType: z.string().max(50),
  // <-- This was in the schema
  dealerTotalPotential: z.coerce.number(),
  dealerBestPotential: z.coerce.number(),
  brandSelling: z.preprocess(toStringArray, z.array(z.string()).min(1)),
  contactPerson: strOrNull,
  contactPersonPhoneNo: strOrNull,
  todayOrderMt: z.coerce.number(),
  todayCollectionRupees: z.coerce.number(),
  overdueAmount: numOrNull,
  feedbacks: z.string().max(500).min(1),
  solutionBySalesperson: strOrNull,
  anyRemarks: strOrNull,
  checkInTime: z.coerce.date(),
  checkOutTime: z.coerce.date().nullable().optional(),
  inTimeImageUrl: strOrNull,
  outTimeImageUrl: strOrNull,
  pjpId: strOrNull
}).strict();
function setupDailyVisitReportsPostRoutes(app2) {
  app2.post("/api/daily-visit-reports", async (req, res) => {
    try {
      const input = dvrInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID(),
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
        error: "Failed to create DVR",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 DVR POST endpoints (using dealerId) setup complete");
}

// src/routes/formSubmissionRoutes/tvr.ts
import { z as z2 } from "zod";
import { randomUUID as randomUUID2 } from "crypto";
var toDateOnly2 = (d) => d.toISOString().slice(0, 10);
var toStringArray2 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s.includes(",") ? s.split(",").map((t) => t.trim()).filter(Boolean) : [s];
  }
  return [];
};
var nullableString = z2.string().transform((s) => s.trim() === "" ? null : s).optional().nullable();
var tvrInputSchema = z2.object({
  userId: z2.coerce.number().int().positive(),
  reportDate: z2.coerce.date(),
  visitType: z2.string().max(50),
  siteNameConcernedPerson: z2.string().max(255),
  phoneNo: z2.string().max(20),
  emailId: nullableString,
  clientsRemarks: z2.string().max(500),
  salespersonRemarks: z2.string().max(500),
  checkInTime: z2.coerce.date(),
  checkOutTime: z2.coerce.date().nullable().optional(),
  inTimeImageUrl: nullableString,
  outTimeImageUrl: nullableString,
  // Array fields
  siteVisitBrandInUse: z2.preprocess(toStringArray2, z2.array(z2.string()).min(1, "siteVisitBrandInUse requires at least one brand")),
  influencerType: z2.preprocess(toStringArray2, z2.array(z2.string()).min(1, "influencerType requires at least one type")),
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
  conversionQuantityValue: z2.coerce.number().nullable().optional(),
  // --- NEW FIELDS (from schema) ---
  siteVisitType: nullableString,
  dhalaiVerificationCode: nullableString,
  isVerificationStatus: nullableString,
  meetingId: nullableString,
  pjpId: nullableString
}).strict();
function createAutoCRUD28(app2, config) {
  const { endpoint, table: table4, tableName: tableName4 } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const input = tvrInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID2(),
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
        pjpId: input.pjpId ?? null
      };
      const [record] = await db.insert(table4).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: `${tableName4} created successfully`,
        data: record
      });
    } catch (error) {
      console.error(`Create ${tableName4} error:`, error);
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
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName4}`,
        details: error?.message ?? "Unknown error"
      });
    }
  });
}
function setupTechnicalVisitReportsPostRoutes(app2) {
  createAutoCRUD28(app2, {
    endpoint: "technical-visit-reports",
    table: technicalVisitReports,
    tableName: "Technical Visit Report"
  });
  console.log("\u2705 Technical Visit Reports POST endpoints setup complete (Schema-Accurate)");
}

// src/routes/formSubmissionRoutes/pjp.ts
import { z as z3 } from "zod";
import { randomUUID as randomUUID3 } from "crypto";
var toDateOnly3 = (d) => d.toISOString().slice(0, 10);
var strOrNull2 = z3.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z3.string().nullable().optional());
var pjpInputSchema = z3.object({
  userId: z3.coerce.number().int().positive(),
  createdById: z3.coerce.number().int().positive(),
  // --- ✅ FIX ---
  dealerId: strOrNull2,
  // Replaced visitDealerName
  // --- END FIX ---
  planDate: z3.coerce.date(),
  areaToBeVisited: z3.string().max(500).min(1),
  description: strOrNull2,
  status: z3.string().max(50).min(1).default("PENDING"),
  verificationStatus: strOrNull2,
  additionalVisitRemarks: strOrNull2
}).strict();
function setupPermanentJourneyPlansPostRoutes(app2) {
  app2.post("/api/pjp", async (req, res) => {
    try {
      const input = pjpInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID3(),
        userId: input.userId,
        createdById: input.createdById,
        // --- ✅ FIX ---
        dealerId: input.dealerId ?? null,
        // Use the new dealerId
        // --- END FIX ---
        planDate: toDateOnly3(input.planDate),
        areaToBeVisited: input.areaToBeVisited,
        description: input.description ?? null,
        status: input.status,
        verificationStatus: input.verificationStatus ?? null,
        additionalVisitRemarks: input.additionalVisitRemarks ?? null
      };
      const [record] = await db.insert(permanentJourneyPlans).values(insertData).returning();
      return res.status(201).json({
        success: true,
        message: "Permanent Journey Plan created successfully",
        data: record
      });
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues
        });
      }
      console.error("Create PJP error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create PJP",
        details: error?.message ?? "Unknown error"
      });
    }
  });
  console.log("\u2705 PJP POST endpoints (using dealerId) setup complete");
}

// src/routes/formSubmissionRoutes/addDealer.ts
import { z as z4 } from "zod";
import { eq as eq34 } from "drizzle-orm";
import { randomUUID as randomUUID4 } from "crypto";
var toStringArray3 = (v) => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    return t.includes(",") ? t.split(",").map((s) => s.trim()).filter(Boolean) : [t];
  }
  return [];
};
var strOrNull3 = z4.preprocess((val) => {
  if (val === "") return null;
  if (typeof val === "string") {
    const t = val.trim();
    return t === "" ? null : t;
  }
  return val;
}, z4.string().nullable().optional());
var dateOrNull = z4.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  try {
    return new Date(String(val));
  } catch {
    return null;
  }
}, z4.date().nullable().optional());
var numOrNull2 = z4.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z4.number().nullable().optional());
var intOrNull = z4.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z4.number().int().nullable().optional());
var toDateOnlyString = (d) => {
  if (!d) return null;
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};
var dealerInputSchema = z4.object({
  userId: intOrNull,
  type: z4.string().min(1),
  parentDealerId: strOrNull3,
  // "" -> null (fixes FK violation)
  name: z4.string().min(1),
  region: z4.string().min(1),
  area: z4.string().min(1),
  phoneNo: z4.string().min(1),
  address: z4.string().min(1),
  pinCode: strOrNull3,
  latitude: numOrNull2,
  // accepts number or "22.57"
  longitude: numOrNull2,
  dateOfBirth: dateOrNull,
  anniversaryDate: dateOrNull,
  totalPotential: z4.coerce.number(),
  // Required
  bestPotential: z4.coerce.number(),
  // Required
  brandSelling: z4.preprocess(toStringArray3, z4.array(z4.string()).min(1, "brandSelling is required")),
  // Required
  feedbacks: z4.string().min(1),
  remarks: strOrNull3,
  // --- ADDED FOR PRISMA PARITY ---
  dealerDevelopmentStatus: strOrNull3,
  dealerDevelopmentObstacle: strOrNull3,
  salesGrowthPercentage: numOrNull2,
  noOfPJP: intOrNull,
  // -----------------------------
  verificationStatus: z4.enum(["PENDING", "VERIFIED"]).default("PENDING").optional(),
  // IDs & contacts
  whatsappNo: strOrNull3,
  emailId: z4.preprocess((val) => val === "" ? null : val, z4.string().email().nullable().optional()),
  businessType: strOrNull3,
  // --- ✅ NEW FIELDS ADDED ---
  nameOfFirm: strOrNull3,
  underSalesPromoterName: strOrNull3,
  // --- END NEW FIELDS ---
  gstinNo: strOrNull3,
  panNo: strOrNull3,
  tradeLicNo: strOrNull3,
  aadharNo: strOrNull3,
  // Godown
  godownSizeSqFt: intOrNull,
  godownCapacityMTBags: strOrNull3,
  godownAddressLine: strOrNull3,
  godownLandMark: strOrNull3,
  godownDistrict: strOrNull3,
  godownArea: strOrNull3,
  godownRegion: strOrNull3,
  godownPinCode: strOrNull3,
  // Residential
  residentialAddressLine: strOrNull3,
  residentialLandMark: strOrNull3,
  residentialDistrict: strOrNull3,
  residentialArea: strOrNull3,
  residentialRegion: strOrNull3,
  residentialPinCode: strOrNull3,
  // Bank
  bankAccountName: strOrNull3,
  bankName: strOrNull3,
  bankBranchAddress: strOrNull3,
  bankAccountNumber: strOrNull3,
  bankIfscCode: strOrNull3,
  // Sales & promoter
  brandName: strOrNull3,
  monthlySaleMT: numOrNull2,
  noOfDealers: intOrNull,
  areaCovered: strOrNull3,
  projectedMonthlySalesBestCementMT: numOrNull2,
  noOfEmployeesInSales: intOrNull,
  // Declaration
  declarationName: strOrNull3,
  declarationPlace: strOrNull3,
  declarationDate: dateOrNull,
  // Document URLs
  tradeLicencePicUrl: strOrNull3,
  shopPicUrl: strOrNull3,
  dealerPicUrl: strOrNull3,
  blankChequePicUrl: strOrNull3,
  partnershipDeedPicUrl: strOrNull3,
  // Geofence (not part of DB, just for Radar)
  radius: z4.preprocess((v) => v === "" ? void 0 : v, z4.coerce.number().min(10).max(1e4).optional())
}).strict();
function createAutoCRUD29(app2, config) {
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
      const dealerId = randomUUID4();
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
        await db.delete(table4).where(eq34(table4.id, dealer.id));
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
function setupDealersPostRoutes(app2) {
  createAutoCRUD29(app2, {
    endpoint: "dealers",
    table: dealers,
    tableName: "Dealer"
  });
  console.log("\u2705 Dealers POST endpoint with Radar geofence ready (empty-string\u2192null safe)");
}

// src/routes/formSubmissionRoutes/salesManleave.ts
import { z as z5 } from "zod";
import { randomUUID as randomUUID5 } from "crypto";
function createAutoCRUD30(app2, config) {
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
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupSalesmanLeaveApplicationsPostRoutes(app2) {
  createAutoCRUD30(app2, {
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
import { randomUUID as randomUUID6 } from "crypto";
function createAutoCRUD31(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
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
      const generatedId = randomUUID6().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        checkOutTime: new Date(parsed2.checkOutTime),
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
function setupClientReportsPostRoutes(app2) {
  createAutoCRUD31(app2, {
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
import { randomUUID as randomUUID7 } from "crypto";
function createAutoCRUD32(app2, config) {
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
  createAutoCRUD32(app2, {
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
import { randomUUID as randomUUID8 } from "crypto";
function createAutoCRUD33(app2, config) {
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
  createAutoCRUD33(app2, {
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
import { randomUUID as randomUUID9 } from "crypto";
function createAutoCRUD34(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
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
            received: err.received
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
  createAutoCRUD34(app2, {
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
function createAutoCRUD35(app2, config) {
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
        date: new Date(parsed2.date),
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
            received: err.received,
            expected: err.expected
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
function setupSalesReportPostRoutes(app2) {
  createAutoCRUD35(app2, {
    endpoint: "sales-reports",
    table: salesReport,
    schema: insertSalesReportSchema,
    tableName: "Sales Report"
  });
  console.log("\u2705 Sales Report POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/collectionReport.ts
import { z as z11 } from "zod";
import { randomUUID as randomUUID10 } from "crypto";
function createAutoCRUD36(app2, config) {
  const { endpoint, table: table4, schema, tableName: tableName4, autoFields = {} } = config;
  app2.post(`/api/${endpoint}`, async (req, res) => {
    try {
      const executedAutoFields = {};
      for (const [key, fn] of Object.entries(autoFields)) {
        executedAutoFields[key] = fn();
      }
      const parsed2 = schema.parse(req.body);
      const generatedId = randomUUID10().replace(/-/g, "").substring(0, 25);
      const insertData = {
        id: generatedId,
        ...parsed2,
        collectedOnDate: new Date(parsed2.collectedOnDate),
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
function setupCollectionReportsPostRoutes(app2) {
  createAutoCRUD36(app2, {
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
function createAutoCRUD37(app2, config) {
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
        creationDate: new Date(parsed2.creationDate),
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
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupDdpPostRoutes(app2) {
  createAutoCRUD37(app2, {
    endpoint: "ddp",
    table: ddp,
    schema: insertDdpSchema,
    tableName: "Dealer Development Process"
  });
  console.log("\u2705 DDP POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/ratings.ts
import { z as z13 } from "zod";
function createAutoCRUD38(app2, config) {
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
        error: `Failed to create ${tableName4}`,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
function setupRatingsPostRoutes(app2) {
  createAutoCRUD38(app2, {
    endpoint: "ratings",
    table: ratings,
    schema: insertRatingSchema,
    tableName: "Rating"
  });
  console.log("\u2705 Ratings POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/brand.ts
import { z as z14 } from "zod";
function createAutoCRUD39(app2, config) {
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
      if (error instanceof z14.ZodError) {
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
  createAutoCRUD39(app2, {
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
import { randomUUID as randomUUID11 } from "crypto";
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
var salesOrderInputSchema = z15.object({
  // Relations
  userId: z15.coerce.number().int().optional().nullable(),
  dealerId: z15.string().max(255).optional().nullable().or(z15.literal("")),
  dvrId: z15.string().max(255).optional().nullable().or(z15.literal("")),
  pjpId: z15.string().max(255).optional().nullable().or(z15.literal("")),
  // Business
  orderDate: z15.union([z15.string(), z15.date()]),
  orderPartyName: z15.string().min(1, "orderPartyName is required"),
  // ... (all other fields) ...
  partyPhoneNo: z15.string().optional().nullable().or(z15.literal("")),
  partyArea: z15.string().optional().nullable().or(z15.literal("")),
  partyRegion: z15.string().optional().nullable().or(z15.literal("")),
  partyAddress: z15.string().optional().nullable().or(z15.literal("")),
  deliveryDate: z15.union([z15.string(), z15.date()]).optional().nullable(),
  deliveryArea: z15.string().optional().nullable().or(z15.literal("")),
  deliveryRegion: z15.string().optional().nullable().or(z15.literal("")),
  deliveryAddress: z15.string().optional().nullable().or(z15.literal("")),
  deliveryLocPincode: z15.string().optional().nullable().or(z15.literal("")),
  paymentMode: z15.string().optional().nullable().or(z15.literal("")),
  paymentTerms: z15.string().optional().nullable().or(z15.literal("")),
  paymentAmount: z15.union([z15.string(), z15.number()]).optional().nullable(),
  receivedPayment: z15.union([z15.string(), z15.number()]).optional().nullable(),
  receivedPaymentDate: z15.union([z15.string(), z15.date()]).optional().nullable(),
  pendingPayment: z15.union([z15.string(), z15.number()]).optional().nullable(),
  orderQty: z15.union([z15.string(), z15.number()]).optional().nullable(),
  orderUnit: z15.string().max(20).optional().nullable().or(z15.literal("")),
  itemPrice: z15.union([z15.string(), z15.number()]).optional().nullable(),
  discountPercentage: z15.union([z15.string(), z15.number()]).optional().nullable(),
  itemPriceAfterDiscount: z15.union([z15.string(), z15.number()]).optional().nullable(),
  itemType: z15.string().max(20).optional().nullable().or(z15.literal("")),
  itemGrade: z15.string().max(10).optional().nullable().or(z15.literal("")),
  // --- ✅ FIX ---
  status: z15.string().max(50).optional().default("Pending")
  // Added status
  // --- END FIX ---
});
function createAutoCRUD40(app2, config) {
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
        id: randomUUID11(),
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
      if (error instanceof z15.ZodError) {
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
  createAutoCRUD40(app2, {
    endpoint: "sales-orders",
    table: salesOrders,
    tableName: "Sales Order"
  });
  console.log("\u2705 Sales Orders POST endpoint (with status) ready");
}

// src/routes/formSubmissionRoutes/brandMapping.ts
import { z as z16 } from "zod";
function createAutoCRUD41(app2, config) {
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
      return res.status(500).json({ success: false, error: `Failed to create ${tableName4}`, details: err?.message ?? "Unknown error" });
    }
  });
}
function setupDealerBrandMappingPostRoutes(app2) {
  createAutoCRUD41(app2, {
    endpoint: "dealer-brand-mapping",
    table: dealerBrandMapping,
    schema: insertDealerBrandMappingSchema,
    tableName: "Dealer Brand Mapping"
  });
  console.log("\u2705 Dealer Brand Mapping POST endpoints setup complete");
}

// src/routes/formSubmissionRoutes/attendanceIn.ts
import { eq as eq35, and as and32 } from "drizzle-orm";
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
        and32(
          eq35(salesmanAttendance.userId, userId),
          eq35(salesmanAttendance.attendanceDate, dateObj)
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
import { eq as eq36, and as and33, isNull } from "drizzle-orm";
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
        and33(
          eq36(salesmanAttendance.userId, userId),
          eq36(salesmanAttendance.attendanceDate, dateObj),
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
      const [updatedAttendance] = await db.update(salesmanAttendance).set(updateData).where(eq36(salesmanAttendance.id, existingAttendance.id)).returning();
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

// src/routes/formSubmissionRoutes/tsoMeetings.ts
import { z as z19 } from "zod";
import { randomUUID as randomUUID12 } from "crypto";
var toDateOnly4 = (d) => d.toISOString().slice(0, 10);
var nullableNumber = z19.coerce.number().positive().optional().nullable();
var meetingInputSchema = z19.object({
  createdByUserId: z19.coerce.number().int().positive(),
  type: z19.string().max(100).min(1, "Type is required"),
  date: z19.coerce.date(),
  location: z19.string().max(500).min(1, "Location is required"),
  budgetAllocated: nullableNumber,
  participantsCount: z19.coerce.number().int().positive().optional().nullable()
}).strict();
function setupTsoMeetingsPostRoutes(app2) {
  app2.post("/api/tso-meetings", async (req, res) => {
    try {
      const input = meetingInputSchema.parse(req.body);
      const insertData = {
        id: randomUUID12(),
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
      if (error instanceof z19.ZodError) {
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

// src/routes/updateRoutes/dealers.ts
import { eq as eq37 } from "drizzle-orm";
import { z as z20 } from "zod";
var strOrNull4 = z20.preprocess((val) => {
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
    return new Date(String(val));
  } catch {
    return null;
  }
}, z20.date().nullable().optional());
var numOrNull3 = z20.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}, z20.number().nullable().optional());
var intOrNull2 = z20.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}, z20.number().int().nullable().optional());
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
var dealerBaseSchema = z20.object({
  userId: intOrNull2,
  type: z20.string().min(1),
  parentDealerId: strOrNull4,
  name: z20.string().min(1),
  region: z20.string().min(1),
  area: z20.string().min(1),
  phoneNo: z20.string().min(1),
  address: z20.string().min(1),
  pinCode: strOrNull4,
  latitude: numOrNull3,
  longitude: numOrNull3,
  dateOfBirth: dateOrNull2,
  anniversaryDate: dateOrNull2,
  totalPotential: z20.coerce.number(),
  bestPotential: z20.coerce.number(),
  brandSelling: z20.preprocess(toStringArray4, z20.array(z20.string()).min(1)),
  feedbacks: z20.string().min(1),
  remarks: strOrNull4,
  dealerDevelopmentStatus: strOrNull4,
  dealerDevelopmentObstacle: strOrNull4,
  salesGrowthPercentage: numOrNull3,
  noOfPJP: intOrNull2,
  verificationStatus: z20.enum(["PENDING", "VERIFIED"]).optional(),
  whatsappNo: strOrNull4,
  emailId: z20.preprocess((val) => val === "" ? null : val, z20.string().email().nullable().optional()),
  businessType: strOrNull4,
  // --- ✅ NEW FIELDS ADDED ---
  nameOfFirm: strOrNull4,
  underSalesPromoterName: strOrNull4,
  // --- END NEW FIELDS ---
  gstinNo: strOrNull4,
  panNo: strOrNull4,
  tradeLicNo: strOrNull4,
  aadharNo: strOrNull4,
  godownSizeSqFt: intOrNull2,
  godownCapacityMTBags: strOrNull4,
  godownAddressLine: strOrNull4,
  godownLandMark: strOrNull4,
  godownDistrict: strOrNull4,
  godownArea: strOrNull4,
  godownRegion: strOrNull4,
  godownPinCode: strOrNull4,
  residentialAddressLine: strOrNull4,
  residentialLandMark: strOrNull4,
  residentialDistrict: strOrNull4,
  residentialArea: strOrNull4,
  residentialRegion: strOrNull4,
  residentialPinCode: strOrNull4,
  bankAccountName: strOrNull4,
  bankName: strOrNull4,
  bankBranchAddress: strOrNull4,
  bankAccountNumber: strOrNull4,
  bankIfscCode: strOrNull4,
  brandName: strOrNull4,
  monthlySaleMT: numOrNull3,
  noOfDealers: intOrNull2,
  areaCovered: strOrNull4,
  projectedMonthlySalesBestCementMT: numOrNull3,
  noOfEmployeesInSales: intOrNull2,
  declarationName: strOrNull4,
  declarationPlace: strOrNull4,
  declarationDate: dateOrNull2,
  tradeLicencePicUrl: strOrNull4,
  shopPicUrl: strOrNull4,
  dealerPicUrl: strOrNull4,
  blankChequePicUrl: strOrNull4,
  partnershipDeedPicUrl: strOrNull4
});
var dealerUpdateSchema = dealerBaseSchema.partial().extend({
  // Geofence radius
  radius: z20.preprocess((v) => v === "" ? void 0 : v, z20.coerce.number().min(10).max(1e4).optional())
}).strict();
async function upsertRadarGeofence(dealer, radius) {
  if (!process.env.RADAR_SECRET_KEY) {
    throw new Error("RADAR_SECRET_KEY is not configured");
  }
  if (!dealer.latitude || !dealer.longitude) {
    throw new Error("Dealer latitude/longitude missing for geofence update");
  }
  const tag = "dealer";
  const externalId = `dealer:${dealer.id}`;
  const radarUrl = `https://api.radar.io/v1/geofences/${encodeURIComponent(tag)}/${encodeURIComponent(externalId)}`;
  const description = String(dealer.name ?? `Dealer ${dealer.id}`).slice(0, 120);
  const finalRadius = radius ?? 25;
  const form = new URLSearchParams();
  form.set("description", description);
  form.set("type", "circle");
  form.set("coordinates", JSON.stringify([dealer.longitude, dealer.latitude]));
  form.set("radius", String(finalRadius));
  const metadata = {
    dealerId: dealer.id,
    userId: dealer.userId,
    region: dealer.region,
    area: dealer.area,
    phoneNo: dealer.phoneNo,
    verificationStatus: dealer.verificationStatus,
    // --- ✅ NEW FIELDS ADDED ---
    nameOfFirm: dealer.nameOfFirm,
    promoterName: dealer.underSalesPromoterName
    // --- END NEW FIELDS ---
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
      const [existingDealer] = await db.select().from(dealers).where(eq37(dealers.id, id)).limit(1);
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
      if (input.latitude !== void 0) patch.latitude = String(input.latitude);
      if (input.longitude !== void 0) patch.longitude = String(input.longitude);
      if (input.dateOfBirth !== void 0) patch.dateOfBirth = toDateOnlyString2(input.dateOfBirth);
      if (input.anniversaryDate !== void 0) patch.anniversaryDate = toDateOnlyString2(input.anniversaryDate);
      if (input.totalPotential !== void 0) patch.totalPotential = String(input.totalPotential);
      if (input.bestPotential !== void 0) patch.bestPotential = String(input.bestPotential);
      if (input.brandSelling !== void 0) patch.brandSelling = input.brandSelling;
      if (input.feedbacks !== void 0) patch.feedbacks = input.feedbacks;
      if (input.remarks !== void 0) patch.remarks = input.remarks;
      if (input.dealerDevelopmentStatus !== void 0) patch.dealerDevelopmentStatus = input.dealerDevelopmentStatus;
      if (input.dealerDevelopmentObstacle !== void 0) patch.dealerDevelopmentObstacle = input.dealerDevelopmentObstacle;
      if (input.salesGrowthPercentage !== void 0) patch.salesGrowthPercentage = input.salesGrowthPercentage ? String(input.salesGrowthPercentage) : null;
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
      if (input.monthlySaleMT !== void 0) patch.monthlySaleMT = input.monthlySaleMT ? String(input.monthlySaleMT) : null;
      if (input.noOfDealers !== void 0) patch.noOfDealers = input.noOfDealers;
      if (input.areaCovered !== void 0) patch.areaCovered = input.areaCovered;
      if (input.projectedMonthlySalesBestCementMT !== void 0) patch.projectedMonthlySalesBestCementMT = input.projectedMonthlySalesBestCementMT ? String(input.projectedMonthlySalesBestCementMT) : null;
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
        const updatedDealerForRadar = {
          ...existingDealer,
          ...patch,
          // Apply string-converted values
          // Ensure lat/lng are correct for Radar (it needs numbers, but patch has strings)
          latitude: input.latitude ?? Number(existingDealer.latitude),
          longitude: input.longitude ?? Number(existingDealer.longitude)
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
      const [updatedDealer] = await db.update(dealers).set(patch).where(eq37(dealers.id, id)).returning();
      res.json({
        success: true,
        message: "Dealer updated successfully",
        data: updatedDealer,
        geofenceRef: geofenceRef ? {
          id: geofenceRef._id,
          tag: geofenceRef.tag,
          externalId: geofenceRef.externalId
        } : "not_updated"
      });
    } catch (error) {
      if (error instanceof z20.ZodError) {
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
import { eq as eq38 } from "drizzle-orm";
import { z as z21 } from "zod";
var toDateOnly5 = (d) => d.toISOString().slice(0, 10);
var strOrNull5 = z21.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z21.string().nullable().optional());
var pjpPatchSchema = z21.object({
  userId: z21.coerce.number().int().positive().optional(),
  createdById: z21.coerce.number().int().positive().optional(),
  // --- ✅ FIX ---
  dealerId: strOrNull5,
  // Replaced visitDealerName
  // --- END FIX ---
  planDate: z21.coerce.date().optional(),
  areaToBeVisited: z21.string().max(500).optional(),
  description: z21.string().max(500).optional().nullable(),
  // Allow regular null
  status: z21.string().max(50).optional(),
  verificationStatus: z21.string().max(50).optional().nullable(),
  additionalVisitRemarks: z21.string().max(500).optional().nullable()
}).strict();
function setupPjpPatchRoutes(app2) {
  app2.patch("/api/pjp/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = pjpPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select({ id: permanentJourneyPlans.id }).from(permanentJourneyPlans).where(eq38(permanentJourneyPlans.id, id)).limit(1);
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
      const [updated] = await db.update(permanentJourneyPlans).set(patch).where(eq38(permanentJourneyPlans.id, id)).returning();
      return res.json({
        success: true,
        message: "Permanent Journey Plan updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z21.ZodError) {
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
import { eq as eq39 } from "drizzle-orm";
import { z as z22 } from "zod";
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
      const [existingTask] = await db.select().from(dailyTasks).where(eq39(dailyTasks.id, id)).limit(1);
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
      }).where(eq39(dailyTasks.id, id)).returning();
      res.json({
        success: true,
        message: "Daily Task updated successfully",
        data: updatedTask
      });
    } catch (error) {
      if (error instanceof z22.ZodError) {
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
import { eq as eq40 } from "drizzle-orm";
import { z as z23 } from "zod";
var mappingUpdateSchema = insertDealerBrandMappingSchema.pick({ capacityMT: true });
function setupDealerBrandMappingPatchRoutes(app2) {
  app2.patch("/api/dealer-brand-mapping/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = mappingUpdateSchema.parse(req.body);
      const [existingMapping] = await db.select().from(dealerBrandMapping).where(eq40(dealerBrandMapping.id, id)).limit(1);
      if (!existingMapping) {
        return res.status(404).json({
          success: false,
          error: `Dealer Brand Mapping with ID '${id}' not found.`
        });
      }
      const [updatedMapping] = await db.update(dealerBrandMapping).set({
        capacityMT: validatedData.capacityMT
      }).where(eq40(dealerBrandMapping.id, id)).returning();
      res.json({
        success: true,
        message: "Dealer Brand Mapping updated successfully",
        data: updatedMapping
      });
    } catch (error) {
      if (error instanceof z23.ZodError) {
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
import { eq as eq41 } from "drizzle-orm";
import { z as z24 } from "zod";
var brandUpdateSchema = insertBrandSchema.pick({ name: true });
function setupBrandsPatchRoutes(app2) {
  app2.patch("/api/brands/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid brand ID." });
      }
      const validatedData = brandUpdateSchema.parse(req.body);
      const [existingBrand] = await db.select().from(brands).where(eq41(brands.id, id)).limit(1);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          error: `Brand with ID '${id}' not found.`
        });
      }
      const [updatedBrand] = await db.update(brands).set({
        name: validatedData.name
      }).where(eq41(brands.id, id)).returning();
      res.json({
        success: true,
        message: "Brand updated successfully",
        data: updatedBrand
      });
    } catch (error) {
      if (error instanceof z24.ZodError) {
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
import { eq as eq42 } from "drizzle-orm";
import { z as z25 } from "zod";
var ratingUpdateSchema = insertRatingSchema.pick({ rating: true });
function setupRatingsPatchRoutes(app2) {
  app2.patch("/api/ratings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid rating ID." });
      }
      const validatedData = ratingUpdateSchema.parse(req.body);
      const [existingRating] = await db.select().from(ratings).where(eq42(ratings.id, id)).limit(1);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: `Rating with ID '${id}' not found.`
        });
      }
      const [updatedRating] = await db.update(ratings).set({
        rating: validatedData.rating
      }).where(eq42(ratings.id, id)).returning();
      res.json({
        success: true,
        message: "Rating updated successfully",
        data: updatedRating
      });
    } catch (error) {
      if (error instanceof z25.ZodError) {
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
import { eq as eq43 } from "drizzle-orm";
import { z as z26 } from "zod";
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
      const [existingRecord] = await db.select().from(dealerReportsAndScores).where(eq43(dealerReportsAndScores.dealerId, dealerId)).limit(1);
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
      }).where(eq43(dealerReportsAndScores.dealerId, dealerId)).returning();
      res.json({
        success: true,
        message: "Dealer scores updated successfully",
        data: updatedRecord
      });
    } catch (error) {
      if (error instanceof z26.ZodError) {
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
import { eq as eq44 } from "drizzle-orm";
import { z as z27 } from "zod";
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
var strOrNull6 = z27.preprocess((val) => {
  if (val === "" || val === null || val === void 0) return null;
  return String(val).trim();
}, z27.string().nullable().optional());
var numOrNull4 = z27.preprocess((val) => val === "" || val === null || val === void 0 ? null : val, z27.coerce.number().nullable().optional());
var dvrPatchSchema = z27.object({
  // --- ✅ FIX ---
  dealerId: strOrNull6,
  subDealerId: strOrNull6,
  // --- END FIX ---
  userId: z27.coerce.number().int().positive().optional(),
  reportDate: z27.coerce.date().optional(),
  dealerType: z27.string().max(50).optional(),
  // dealerName: nullableString, // <-- REMOVED
  // subDealerName: nullableString, // <-- REMOVED
  location: z27.string().max(500).optional(),
  latitude: z27.coerce.number().optional(),
  longitude: z27.coerce.number().optional(),
  visitType: z27.string().max(50).optional(),
  dealerTotalPotential: z27.coerce.number().optional(),
  dealerBestPotential: z27.coerce.number().optional(),
  brandSelling: z27.preprocess(toStringArray5, z27.array(z27.string()).min(1)).optional(),
  contactPerson: strOrNull6,
  contactPersonPhoneNo: strOrNull6,
  todayOrderMt: z27.coerce.number().optional(),
  todayCollectionRupees: z27.coerce.number().optional(),
  overdueAmount: numOrNull4,
  feedbacks: z27.string().max(500).min(1).optional(),
  solutionBySalesperson: strOrNull6,
  anyRemarks: strOrNull6,
  checkInTime: z27.coerce.date().optional(),
  checkOutTime: z27.coerce.date().nullable().optional(),
  inTimeImageUrl: strOrNull6,
  outTimeImageUrl: strOrNull6,
  pjpId: z27.string().max(255).nullable().optional()
}).strict();
function setupDailyVisitReportsPatchRoutes(app2) {
  app2.patch("/api/daily-visit-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = dvrPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select({ id: dailyVisitReports.id }).from(dailyVisitReports).where(eq44(dailyVisitReports.id, id)).limit(1);
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
      if (input.inTimeImageUrl !== void 0) patch.inTimeImageUrl = input.inTimeImageUrl;
      if (input.outTimeImageUrl !== void 0) patch.outTimeImageUrl = input.outTimeImageUrl;
      if (input.pjpId !== void 0) patch.pjpId = input.pjpId;
      const [updated] = await db.update(dailyVisitReports).set(patch).where(eq44(dailyVisitReports.id, id)).returning();
      return res.json({
        success: true,
        message: "Daily Visit Report updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z27.ZodError) {
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
import { eq as eq45 } from "drizzle-orm";
import { z as z28 } from "zod";
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
var nullableString2 = z28.string().transform((s) => s.trim() === "" ? null : s).optional().nullable();
var tvrPatchSchema = z28.object({
  userId: z28.coerce.number().int().positive().optional(),
  reportDate: z28.coerce.date().optional(),
  visitType: z28.string().max(50).optional(),
  siteNameConcernedPerson: z28.string().max(255).optional(),
  phoneNo: z28.string().max(20).optional(),
  emailId: nullableString2,
  clientsRemarks: z28.string().max(500).optional(),
  salespersonRemarks: z28.string().max(500).optional(),
  checkInTime: z28.coerce.date().optional(),
  checkOutTime: z28.coerce.date().nullable().optional(),
  inTimeImageUrl: nullableString2,
  outTimeImageUrl: nullableString2,
  // Array fields
  siteVisitBrandInUse: z28.preprocess(toStringArray6, z28.array(z28.string()).min(1)).optional(),
  influencerType: z28.preprocess(toStringArray6, z28.array(z28.string()).min(1)).optional(),
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
  conversionQuantityValue: z28.coerce.number().nullable().optional(),
  // New fields
  siteVisitType: nullableString2,
  dhalaiVerificationCode: nullableString2,
  isVerificationStatus: nullableString2,
  meetingId: nullableString2,
  pjpId: nullableString2
}).strict();
function setupTechnicalVisitReportsPatchRoutes(app2) {
  app2.patch("/api/technical-visit-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = tvrPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update were provided." });
      }
      const [existing] = await db.select({ id: technicalVisitReports.id }).from(technicalVisitReports).where(eq45(technicalVisitReports.id, id)).limit(1);
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
      patch.updatedAt = /* @__PURE__ */ new Date();
      const [updated] = await db.update(technicalVisitReports).set(patch).where(eq45(technicalVisitReports.id, id)).returning();
      return res.json({
        success: true,
        message: "Technical Visit Report updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z28.ZodError) {
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
import { eq as eq46 } from "drizzle-orm";
import { z as z29 } from "zod";
var toDateOnly8 = (d) => d.toISOString().slice(0, 10);
var nullableNumber2 = z29.coerce.number().positive().optional().nullable();
var meetingPatchSchema = z29.object({
  createdByUserId: z29.coerce.number().int().positive().optional(),
  type: z29.string().max(100).min(1).optional(),
  date: z29.coerce.date().optional(),
  location: z29.string().max(500).min(1).optional(),
  budgetAllocated: nullableNumber2,
  participantsCount: z29.coerce.number().int().positive().optional().nullable()
}).strict();
function setupTsoMeetingsPatchRoutes(app2) {
  app2.patch("/api/tso-meetings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const input = meetingPatchSchema.parse(req.body);
      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }
      const [existing] = await db.select({ id: tsoMeetings.id }).from(tsoMeetings).where(eq46(tsoMeetings.id, id)).limit(1);
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
      const [updated] = await db.update(tsoMeetings).set(patch).where(eq46(tsoMeetings.id, id)).returning();
      return res.json({
        success: true,
        message: "TSO Meeting updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z29.ZodError) {
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
import { z as z30 } from "zod";
import { eq as eq47 } from "drizzle-orm";
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
var salesOrderPatchSchema = z30.object({
  userId: z30.coerce.number().int().optional().nullable(),
  dealerId: z30.string().max(255).optional().nullable().or(z30.literal("")),
  dvrId: z30.string().max(255).optional().nullable().or(z30.literal("")),
  pjpId: z30.string().max(255).optional().nullable().or(z30.literal("")),
  orderDate: z30.union([z30.string(), z30.date()]).optional(),
  orderPartyName: z30.string().min(1).optional(),
  // ... (all other fields) ...
  partyPhoneNo: z30.string().optional().nullable().or(z30.literal("")),
  partyArea: z30.string().optional().nullable().or(z30.literal("")),
  partyRegion: z30.string().optional().nullable().or(z30.literal("")),
  partyAddress: z30.string().optional().nullable().or(z30.literal("")),
  deliveryDate: z30.union([z30.string(), z30.date()]).optional().nullable(),
  deliveryArea: z30.string().optional().nullable().or(z30.literal("")),
  deliveryRegion: z30.string().optional().nullable().or(z30.literal("")),
  deliveryAddress: z30.string().optional().nullable().or(z30.literal("")),
  deliveryLocPincode: z30.string().optional().nullable().or(z30.literal("")),
  paymentMode: z30.string().optional().nullable().or(z30.literal("")),
  paymentTerms: z30.string().optional().nullable().or(z30.literal("")),
  paymentAmount: z30.union([z30.string(), z30.number()]).optional().nullable(),
  receivedPayment: z30.union([z30.string(), z30.number()]).optional().nullable(),
  receivedPaymentDate: z30.union([z30.string(), z30.date()]).optional().nullable(),
  pendingPayment: z30.union([z30.string(), z30.number()]).optional().nullable(),
  orderQty: z30.union([z30.string(), z30.number()]).optional().nullable(),
  orderUnit: z30.string().max(20).optional().nullable().or(z30.literal("")),
  itemPrice: z30.union([z30.string(), z30.number()]).optional().nullable(),
  discountPercentage: z30.union([z30.string(), z30.number()]).optional().nullable(),
  itemPriceAfterDiscount: z30.union([z30.string(), z30.number()]).optional().nullable(),
  itemType: z30.string().max(20).optional().nullable().or(z30.literal("")),
  itemGrade: z30.string().max(10).optional().nullable().or(z30.literal("")),
  // --- ✅ FIX ---
  status: z30.string().max(50).optional()
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
      const [existing] = await db.select().from(salesOrders).where(eq47(salesOrders.id, id)).limit(1);
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
      const [updated] = await db.update(salesOrders).set(patch).where(eq47(salesOrders.id, id)).returning();
      return res.json({
        success: true,
        message: "Sales Order updated successfully",
        data: updated
      });
    } catch (error) {
      if (error instanceof z30.ZodError) {
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

// src/routes/geoTrackingRoutes/geoTracking.ts
import { eq as eq48, desc as desc28 } from "drizzle-orm";
import { z as z31 } from "zod";
import crypto2 from "crypto";
var geoTrackingUpdateSchema = insertGeoTrackingSchema.partial();
function setupGeoTrackingRoutes(app2) {
  app2.get("/api/geotracking/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID." });
      }
      const records = await db.select().from(geoTracking).where(eq48(geoTracking.userId, userId)).orderBy(desc28(geoTracking.recordedAt));
      res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get Geo-tracking by User ID error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch tracking data." });
    }
  });
  app2.get("/api/geotracking/journey/:journeyId", async (req, res) => {
    try {
      const { journeyId } = req.params;
      const records = await db.select().from(geoTracking).where(eq48(geoTracking.journeyId, journeyId)).orderBy(desc28(geoTracking.recordedAt));
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
      const [latest] = await db.select().from(geoTracking).where(eq48(geoTracking.userId, userId)).orderBy(desc28(geoTracking.recordedAt)).limit(1);
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
      const [existingRecord] = await db.select().from(geoTracking).where(eq48(geoTracking.id, id)).limit(1);
      if (!existingRecord) {
        return res.status(404).json({ success: false, error: `Tracking record with ID '${id}' not found.` });
      }
      const [updatedRecord] = await db.update(geoTracking).set({ ...validatedData, updatedAt: /* @__PURE__ */ new Date() }).where(eq48(geoTracking.id, id)).returning();
      res.json({ success: true, message: "Tracking record updated successfully", data: updatedRecord });
    } catch (error) {
      if (error instanceof z31.ZodError) {
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
  constructor(config) {
    this.bot = null;
    this.io = null;
    this.socketsSet = /* @__PURE__ */ new Set();
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
setupBrandsAndMappingRoutes(app);
setupDealersRoutes(app);
setupDailyTasksRoutes(app);
setupPJPRoutes(app);
setupClientReportsRoutes(app);
setupCollectionReportsRoutes(app);
setupCompetitionReportsRoutes(app);
setupDailyVisitReportsRoutes(app);
setupTechnicalVisitReportsRoutes(app);
setupTsoMeetingsGetRoutes(app);
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
setupTsoMeetingsPostRoutes(app);
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
