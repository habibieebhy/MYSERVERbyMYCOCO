// server/src/db/schema.ts
import {
  pgTable, serial, integer, varchar, text, boolean, timestamp, date, numeric,
  uniqueIndex, index
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
// Assuming you have crypto available, as in your original file
import crypto from "crypto";

/* ========================= companies ========================= */
export const companies = pgTable("companies", {
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
  workosOrganizationId: varchar("workos_organization_id", { length: 255 }).unique(),
}, (t) => [
  index("idx_admin_user_id").on(t.adminUserId),
]);

/* ========================= users ========================= */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  workosUserId: varchar("workos_user_id", { length: 255 }).unique(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "no action", onUpdate: "no action" }),
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
  reportsToId: integer("reports_to_id").references((): any => users.id, { onDelete: "set null" }),

  // --- ADDED FOR PRISMA PARITY ---
  noOfPJP: integer("no_of_pjp"),
  
}, (t) => [
  uniqueIndex("users_companyid_email_unique").on(t.companyId, t.email),
  index("idx_user_company_id").on(t.companyId),
  index("idx_workos_user_id").on(t.workosUserId),
]);

/* ========================= tso_meetings (Moved up) ========================= */
// Moved before technicalVisitReports because it's referenced
export const tsoMeetings = pgTable("tso_meetings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: varchar("type", { length: 100 }).notNull(), // e.g., "Head Mason Meet"
  date: date("date").notNull(),
  location: varchar("location", { length: 500 }).notNull(),
  budgetAllocated: numeric("budget_allocated", { precision: 12, scale: 2 }),
  participantsCount: integer("participants_count"),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow(),
}, (t) => [
  index("idx_tso_meetings_created_by_user_id").on(t.createdByUserId),
]);

/* ========================= permanent_journey_plans (FIXED) ========================= */
export const permanentJourneyPlans = pgTable("permanent_journey_plans", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_permanent_journey_plans_user_id").on(t.userId),
  index("idx_permanent_journey_plans_created_by_id").on(t.createdById),
  index("idx_pjp_dealer_id").on(t.dealerId), // <-- NEW INDEX ADDED
]);

/* ========================= daily_visit_reports (FIXED w/ Sub Dealers) ========================= */
export const dailyVisitReports = pgTable("daily_visit_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // --- ✅ THE FINAL FIX ---
  // The main dealer this visit is associated with.
  dealerId: varchar("dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // The specific sub-dealer that was visited (if any).
  subDealerId: varchar("sub_dealer_id", { length: 255 }).references(() => dealers.id, { onDelete: "set null" }),
  // --- END FIX ---
  
  reportDate: date("report_date").notNull(),
  dealerType: varchar("dealer_type", { length: 50 }).notNull(), // "Dealer" | "Sub Dealer"
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_daily_visit_reports_user_id").on(t.userId),
  index("idx_daily_visit_reports_pjp_id").on(t.pjpId),
  index("idx_dvr_dealer_id").on(t.dealerId), // <-- NEW INDEX
  index("idx_dvr_sub_dealer_id").on(t.subDealerId), // <-- NEW INDEX
]);

/* ========================= technical_visit_reports ========================= */
export const technicalVisitReports = pgTable("technical_visit_reports", {
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
  meetingId: varchar("meeting_id", { length: 255 }).references(() => tsoMeetings.id), // This now correctly references tsoMeetings
  pjpId: varchar("pjp_id", { length: 255 }).references(() => permanentJourneyPlans.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_technical_visit_reports_user_id").on(t.userId),
  index("idx_technical_visit_reports_meeting_id").on(t.meetingId),
  index("idx_technical_visit_reports_pjp_id").on(t.pjpId),
]);

/* ========================= dealers (extended to match Prisma) ========================= */
export const dealers = pgTable("dealers", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  parentDealerId: varchar("parent_dealer_id", { length: 255 }).references((): any => dealers.id, { onDelete: "set null" }),
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
  nameOfFirm: varchar("nameOfFirm", {length: 500}),
  underSalesPromoterName: varchar("underSalesPromoterName", {length: 200}),
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_dealers_user_id").on(t.userId),
  index("idx_dealers_parent_dealer_id").on(t.parentDealerId),
]);

/* ========================= salesman_attendance ========================= */
export const salesmanAttendance = pgTable("salesman_attendance", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_salesman_attendance_user_id").on(t.userId),
]);

/* ========================= salesman_leave_applications ========================= */
export const salesmanLeaveApplications = pgTable("salesman_leave_applications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  leaveType: varchar("leave_type", { length: 100 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // "Pending" | "Approved" | "Rejected"
  adminRemarks: varchar("admin_remarks", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_salesman_leave_applications_user_id").on(t.userId),
]);

/* ========================= client_reports (legacy util) ========================= */
export const clientReports = pgTable("client_reports", {
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
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

/* ========================= competition_reports ========================= */
export const competitionReports = pgTable("competition_reports", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("competition_reports_user_idx").on(t.userId),
]);

/* ========================= geo_tracking ========================= */
export const geoTracking = pgTable("geo_tracking", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_geo_user_time").on(t.userId, t.recordedAt),
  index("idx_geo_journey_time").on(t.journeyId, t.recordedAt),
  index("idx_geo_active").on(t.isActive),
  index("idx_geo_tracking_user_id").on(t.userId),
  index("idx_geo_tracking_recorded_at").on(t.recordedAt),
]);

/* ========================= daily_tasks ========================= */
export const dailyTasks = pgTable("daily_tasks", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_daily_tasks_user_id").on(t.userId),
  index("idx_daily_tasks_assigned_by_user_id").on(t.assignedByUserId),
  index("idx_daily_tasks_task_date").on(t.taskDate),
  index("idx_daily_tasks_pjp_id").on(t.pjpId),
  index("idx_daily_tasks_related_dealer_id").on(t.relatedDealerId),
  index("idx_daily_tasks_date_user").on(t.taskDate, t.userId),
  index("idx_daily_tasks_status").on(t.status),
]);

/* ========================= dealer_reports_and_scores ========================= */
export const dealerReportsAndScores = pgTable("dealer_reports_and_scores", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`substr(replace(cast(gen_random_uuid() as text),'-',''),1,25)`),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().unique().references(() => dealers.id),
  dealerScore: numeric("dealer_score", { precision: 10, scale: 2 }).notNull(),
  trustWorthinessScore: numeric("trust_worthiness_score", { precision: 10, scale: 2 }).notNull(),
  creditWorthinessScore: numeric("credit_worthiness_score", { precision: 10, scale: 2 }).notNull(),
  orderHistoryScore: numeric("order_history_score", { precision: 10, scale: 2 }).notNull(),
  visitFrequencyScore: numeric("visit_frequency_score", { precision: 10, scale: 2 }).notNull(),
  lastUpdatedDate: timestamp("last_updated_date", { withTimezone: true, precision: 6 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
});

/* ========================= sales_report ========================= */
export const salesReport = pgTable("sales_report", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  monthlyTarget: numeric("monthly_target", { precision: 12, scale: 2 }).notNull(),
  tillDateAchievement: numeric("till_date_achievement", { precision: 12, scale: 2 }).notNull(),
  yesterdayTarget: numeric("yesterday_target", { precision: 12, scale: 2 }),
  yesterdayAchievement: numeric("yesterday_achievement", { precision: 12, scale: 2 }),
  salesPersonId: integer("sales_person_id").notNull().references(() => users.id),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id),
});

/* ========================= collection_reports ========================= */
export const collectionReports = pgTable("collection_reports", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow(),
}, (t) => [
  index("idx_collection_reports_dealer_id").on(t.dealerId),
]);

/* ========================= dealer_development_process ========================= */
export const ddp = pgTable("dealer_development_process", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id),
  creationDate: date("creation_date").notNull(),
  status: text("status").notNull(),
  obstacle: text("obstacle"),
});

/* ========================= ratings ========================= */
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  area: text("area").notNull(),
  region: text("region").notNull(),
  rating: integer("rating").notNull(),
});

/* ========================= brands ========================= */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("brand_name", { length: 255 }).notNull().unique(),
});

/* ========================= dealer_brand_mapping ========================= */
export const dealerBrandMapping = pgTable("dealer_brand_mapping", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`substr(replace(cast(gen_random_uuid() as text),'-',''),1,25)`),
  dealerId: varchar("dealer_id", { length: 255 }).notNull().references(() => dealers.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  capacityMT: numeric("capacity_mt", { precision: 12, scale: 2 }).notNull(),

  // --- ADDED FOR PRISMA PARITY ---
  bestCapacityMT: numeric("best_capacity_mt", { precision: 12, scale: 2 }),
  brandGrowthCapacityPercent: numeric("brand_growth_capacity_percent", { precision: 5, scale: 2 }),
  userId: integer("user_id").references(() => users.id),
  // -----------------------------

}, (t) => [
  uniqueIndex("dealer_brand_mapping_dealer_id_brand_id_unique").on(t.dealerId, t.brandId),
]);

/* ========================= gift_inventory (new) ========================= */
export const giftInventory = pgTable("gift_inventory", {
  id: serial("id").primaryKey(),
  itemName: varchar("item_name", { length: 255 }).notNull().unique(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAvailableQuantity: integer("total_available_quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow(),
});

/* ========================= gift_allocation_logs (new) ========================= */
export const giftAllocationLogs = pgTable("gift_allocation_logs", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  giftId: integer("gift_id").notNull().references(() => giftInventory.id),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // Allocation | Transfer | Distribution | Deduction
  quantity: integer("quantity").notNull(),
  sourceUserId: integer("source_user_id").references(() => users.id, { onDelete: "set null" }),
  destinationUserId: integer("destination_user_id").references(() => users.id, { onDelete: "set null" }),
  relatedReportId: varchar("related_report_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_gift_logs_gift_id").on(t.giftId),
  index("idx_gift_logs_user_id").on(t.userId),
  index("idx_gift_logs_source_user_id").on(t.sourceUserId),
  index("idx_gift_logs_destination_user_id").on(t.destinationUserId),
]);

/* ========================= sales_orders (FIXED) ========================= */
export const salesOrders = pgTable("sales_orders", {
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
  orderUnit: varchar("order_unit", { length: 20 }), // "MT" | "BAGS"

  // Pricing & discounts
  itemPrice: numeric("item_price", { precision: 12, scale: 2 }),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }),
  itemPriceAfterDiscount: numeric("item_price_after_discount", { precision: 12, scale: 2 }),

  // Product classification
  itemType: varchar("item_type", { length: 20 }), // "PPC" | "OPC"
  itemGrade: varchar("item_grade", { length: 10 }), // "33" | "43" | "53"
  
  // --- ✅ THE FIX ---
  // Added status field for the Admin approval workflow
  status: varchar("status", { length: 50 }).notNull().default("Pending"), // e.g., "Pending", "Approved", "Rejected"
  // --- END FIX ---

  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
}, (t) => [
  index("idx_sales_orders_dvr_id").on(t.dvrId),
  index("idx_sales_orders_pjp_id").on(t.pjpId),
  index("idx_sales_orders_order_date").on(t.orderDate),
  index("idx_sales_orders_dealer_id").on(t.dealerId), // Added index for dealer filtering
  index("idx_sales_orders_status").on(t.status), // <-- NEW INDEX ADDED
]);
/* ========================= master_connected_table ========================= */
export const masterConnectedTable = pgTable("master_connected_table", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
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
  index("idx_mct_dealer_brand_map_id").on(t.dealerBrandMappingId),
]);

/* ========================= drizzle-zod insert schemas ========================= */
export const insertCompanySchema = createInsertSchema(companies);
export const insertUserSchema = createInsertSchema(users);
export const insertDailyVisitReportSchema = createInsertSchema(dailyVisitReports);
export const insertTechnicalVisitReportSchema = createInsertSchema(technicalVisitReports);
export const insertPermanentJourneyPlanSchema = createInsertSchema(permanentJourneyPlans);
export const insertDealerSchema = createInsertSchema(dealers);
export const insertSalesmanAttendanceSchema = createInsertSchema(salesmanAttendance);
export const insertSalesmanLeaveApplicationSchema = createInsertSchema(salesmanLeaveApplications);
export const insertClientReportSchema = createInsertSchema(clientReports);
export const insertCompetitionReportSchema = createInsertSchema(competitionReports);
export const insertGeoTrackingSchema = createInsertSchema(geoTracking);
export const insertDailyTaskSchema = createInsertSchema(dailyTasks);
export const insertDealerReportsAndScoresSchema = createInsertSchema(dealerReportsAndScores);
export const insertSalesReportSchema = createInsertSchema(salesReport);
export const insertCollectionReportSchema = createInsertSchema(collectionReports);
export const insertDdpSchema = createInsertSchema(ddp);
export const insertRatingSchema = createInsertSchema(ratings);
export const insertSalesOrderSchema = createInsertSchema(salesOrders);
export const insertBrandSchema = createInsertSchema(brands);
export const insertDealerBrandMappingSchema = createInsertSchema(dealerBrandMapping);
export const insertTsoMeetingSchema = createInsertSchema(tsoMeetings);
export const insertGiftInventorySchema = createInsertSchema(giftInventory);
export const insertGiftAllocationLogSchema = createInsertSchema(giftAllocationLogs);
export const insertMasterConnectedTableSchema = createInsertSchema(masterConnectedTable);