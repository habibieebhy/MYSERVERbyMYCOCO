CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	CONSTRAINT "brands_brand_name_unique" UNIQUE("brand_name")
);
--> statement-breakpoint
CREATE TABLE "client_reports" (
	"id" varchar(255) PRIMARY KEY DEFAULT substr(replace(cast(gen_random_uuid() as text),'-',''),1,25) NOT NULL,
	"dealerType" text NOT NULL,
	"dealer_sub_dealer_name" text NOT NULL,
	"location" text NOT NULL,
	"type_best_non_best" text NOT NULL,
	"dealerTotalPotential" numeric(10, 2) NOT NULL,
	"dealerBestPotential" numeric(10, 2) NOT NULL,
	"brandSelling" text[] NOT NULL,
	"contactPerson" text NOT NULL,
	"contact_person_phone_no" text NOT NULL,
	"today_order_mt" numeric(10, 2) NOT NULL,
	"today_collection_rupees" numeric(10, 2) NOT NULL,
	"feedbacks" text NOT NULL,
	"solutions_as_per_salesperson" text NOT NULL,
	"anyRemarks" text NOT NULL,
	"check_out_time" timestamp (6) with time zone NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_reports" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dvr_id" varchar(255) NOT NULL,
	"dealer_id" varchar(255) NOT NULL,
	"collected_amount" numeric(12, 2) NOT NULL,
	"collected_on_date" date NOT NULL,
	"weekly_target" numeric(12, 2),
	"till_date_achievement" numeric(12, 2),
	"yesterday_target" numeric(12, 2),
	"yesterday_achievement" numeric(12, 2),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	CONSTRAINT "collection_reports_dvr_id_unique" UNIQUE("dvr_id")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"office_address" text NOT NULL,
	"is_head_office" boolean DEFAULT true NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"region" text,
	"area" text,
	"admin_user_id" varchar(255) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	"workos_organization_id" varchar(255),
	CONSTRAINT "companies_admin_user_id_unique" UNIQUE("admin_user_id"),
	CONSTRAINT "companies_workos_organization_id_unique" UNIQUE("workos_organization_id")
);
--> statement-breakpoint
CREATE TABLE "competition_reports" (
	"id" varchar(255) PRIMARY KEY DEFAULT substr(replace(cast(gen_random_uuid() as text),'-',''),1,25) NOT NULL,
	"user_id" integer NOT NULL,
	"report_date" date NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"billing" varchar(100) NOT NULL,
	"nod" varchar(100) NOT NULL,
	"retail" varchar(100) NOT NULL,
	"schemes_yes_no" varchar(10) NOT NULL,
	"avg_scheme_cost" numeric(10, 2) NOT NULL,
	"remarks" varchar(500),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_tasks" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"task_date" date NOT NULL,
	"visit_type" varchar(50) NOT NULL,
	"related_dealer_id" varchar(255),
	"site_name" varchar(255),
	"description" varchar(500),
	"status" varchar(50) DEFAULT 'Assigned' NOT NULL,
	"pjp_id" varchar(255),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_visit_reports" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"dealer_id" varchar(255),
	"sub_dealer_id" varchar(255),
	"report_date" date NOT NULL,
	"dealer_type" varchar(50) NOT NULL,
	"location" varchar(500) NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"visit_type" varchar(50) NOT NULL,
	"dealer_total_potential" numeric(10, 2) NOT NULL,
	"dealer_best_potential" numeric(10, 2) NOT NULL,
	"brand_selling" text[] NOT NULL,
	"contact_person" varchar(255),
	"contact_person_phone_no" varchar(20),
	"today_order_mt" numeric(10, 2) NOT NULL,
	"today_collection_rupees" numeric(10, 2) NOT NULL,
	"overdue_amount" numeric(12, 2),
	"feedbacks" varchar(500) NOT NULL,
	"solution_by_salesperson" varchar(500),
	"any_remarks" varchar(500),
	"check_in_time" timestamp (6) with time zone NOT NULL,
	"check_out_time" timestamp (6) with time zone,
	"in_time_image_url" varchar(500),
	"out_time_image_url" varchar(500),
	"pjp_id" varchar(255),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealer_development_process" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dealer_id" varchar(255) NOT NULL,
	"creation_date" date NOT NULL,
	"status" text NOT NULL,
	"obstacle" text
);
--> statement-breakpoint
CREATE TABLE "dealer_brand_mapping" (
	"id" varchar(255) PRIMARY KEY DEFAULT substr(replace(cast(gen_random_uuid() as text),'-',''),1,25) NOT NULL,
	"dealer_id" varchar(255) NOT NULL,
	"brand_id" integer NOT NULL,
	"capacity_mt" numeric(12, 2) NOT NULL,
	"best_capacity_mt" numeric(12, 2),
	"brand_growth_capacity_percent" numeric(5, 2),
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "dealer_reports_and_scores" (
	"id" varchar(255) PRIMARY KEY DEFAULT substr(replace(cast(gen_random_uuid() as text),'-',''),1,25) NOT NULL,
	"dealer_id" varchar(255) NOT NULL,
	"dealer_score" numeric(10, 2) NOT NULL,
	"trust_worthiness_score" numeric(10, 2) NOT NULL,
	"credit_worthiness_score" numeric(10, 2) NOT NULL,
	"order_history_score" numeric(10, 2) NOT NULL,
	"visit_frequency_score" numeric(10, 2) NOT NULL,
	"last_updated_date" timestamp (6) with time zone NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dealer_reports_and_scores_dealer_id_unique" UNIQUE("dealer_id")
);
--> statement-breakpoint
CREATE TABLE "dealers" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"parent_dealer_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"region" varchar(100) NOT NULL,
	"area" varchar(255) NOT NULL,
	"phone_no" varchar(20) NOT NULL,
	"address" varchar(500) NOT NULL,
	"pinCode" varchar(20),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"dateOfBirth" date,
	"anniversaryDate" date,
	"total_potential" numeric(10, 2) NOT NULL,
	"best_potential" numeric(10, 2) NOT NULL,
	"brand_selling" text[] NOT NULL,
	"feedbacks" varchar(500) NOT NULL,
	"remarks" varchar(500),
	"dealerdevelopmentstatus" varchar(255),
	"dealerdevelopmentobstacle" varchar(255),
	"sales_growth_percentage" numeric(5, 2),
	"no_of_pjp" integer,
	"verification_status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"whatsapp_no" varchar(20),
	"email_id" varchar(255),
	"business_type" varchar(100),
	"nameOfFirm" varchar(500),
	"underSalesPromoterName" varchar(200),
	"gstin_no" varchar(20),
	"pan_no" varchar(20),
	"trade_lic_no" varchar(150),
	"aadhar_no" varchar(20),
	"godown_size_sqft" integer,
	"godown_capacity_mt_bags" varchar(255),
	"godown_address_line" varchar(500),
	"godown_landmark" varchar(255),
	"godown_district" varchar(100),
	"godown_area" varchar(255),
	"godown_region" varchar(100),
	"godown_pincode" varchar(20),
	"residential_address_line" varchar(500),
	"residential_landmark" varchar(255),
	"residential_district" varchar(100),
	"residential_area" varchar(255),
	"residential_region" varchar(100),
	"residential_pincode" varchar(20),
	"bank_account_name" varchar(255),
	"bank_name" varchar(255),
	"bank_branch_address" varchar(500),
	"bank_account_number" varchar(50),
	"bank_ifsc_code" varchar(50),
	"brand_name" varchar(255),
	"monthly_sale_mt" numeric(10, 2),
	"no_of_dealers" integer,
	"area_covered" varchar(255),
	"projected_monthly_sales_best_cement_mt" numeric(10, 2),
	"no_of_employees_in_sales" integer,
	"declaration_name" varchar(255),
	"declaration_place" varchar(100),
	"declaration_date" date,
	"trade_licence_pic_url" varchar(500),
	"shop_pic_url" varchar(500),
	"dealer_pic_url" varchar(500),
	"blank_cheque_pic_url" varchar(500),
	"partnership_deed_pic_url" varchar(500),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dealers_gstin_no_unique" UNIQUE("gstin_no")
);
--> statement-breakpoint
CREATE TABLE "geo_tracking" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"recorded_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"accuracy" numeric(10, 2),
	"speed" numeric(10, 2),
	"heading" numeric(10, 2),
	"altitude" numeric(10, 2),
	"location_type" varchar(50),
	"activity_type" varchar(50),
	"app_state" varchar(50),
	"battery_level" numeric(5, 2),
	"is_charging" boolean,
	"network_status" varchar(50),
	"ip_address" varchar(45),
	"site_name" varchar(255),
	"check_in_time" timestamp (6) with time zone,
	"check_out_time" timestamp (6) with time zone,
	"total_distance_travelled" numeric(10, 3),
	"journey_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"dest_lat" numeric(10, 7),
	"dest_lng" numeric(10, 7),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_allocation_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"gift_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"source_user_id" integer,
	"destination_user_id" integer,
	"related_report_id" varchar(255),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_available_quantity" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	CONSTRAINT "gift_inventory_item_name_unique" UNIQUE("item_name")
);
--> statement-breakpoint
CREATE TABLE "master_connected_table" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" integer,
	"userId" integer,
	"dealerId" varchar(255),
	"dvrId" varchar(255),
	"tvrId" varchar(255),
	"permanentJourneyPlanId" varchar(255),
	"permanentJourneyPlanCreatedById" integer,
	"dailyTaskId" varchar(255),
	"attendanceId" varchar(255),
	"leaveApplicationId" varchar(255),
	"clientReportId" varchar(255),
	"competitionReportId" varchar(255),
	"geoTrackingId" varchar(255),
	"salesOrderId" varchar(255),
	"dealerReportsAndScoresId" varchar(255),
	"salesReportId" integer,
	"collectionReportId" varchar(255),
	"ddpId" integer,
	"ratingId" integer,
	"brandId" integer,
	"dealerBrandMappingId" varchar(255),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permanent_journey_plans" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"created_by_id" integer NOT NULL,
	"dealer_id" varchar(255),
	"plan_date" date NOT NULL,
	"area_to_be_visited" varchar(500) NOT NULL,
	"description" varchar(500),
	"status" varchar(50) NOT NULL,
	"verification_status" varchar(50),
	"additional_visit_remarks" varchar(500),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"area" text NOT NULL,
	"region" text NOT NULL,
	"rating" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer,
	"dealer_id" varchar(255),
	"dvr_id" varchar(255),
	"pjp_id" varchar(255),
	"order_date" date NOT NULL,
	"order_party_name" varchar(255) NOT NULL,
	"party_phone_no" varchar(20),
	"party_area" varchar(255),
	"party_region" varchar(255),
	"party_address" varchar(500),
	"delivery_date" date,
	"delivery_area" varchar(255),
	"delivery_region" varchar(255),
	"delivery_address" varchar(500),
	"delivery_loc_pincode" varchar(10),
	"payment_mode" varchar(50),
	"payment_terms" varchar(500),
	"payment_amount" numeric(12, 2),
	"received_payment" numeric(12, 2),
	"received_payment_date" date,
	"pending_payment" numeric(12, 2),
	"order_qty" numeric(12, 3),
	"order_unit" varchar(20),
	"item_price" numeric(12, 2),
	"discount_percentage" numeric(5, 2),
	"item_price_after_discount" numeric(12, 2),
	"item_type" varchar(20),
	"item_grade" varchar(10),
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_report" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"monthly_target" numeric(12, 2) NOT NULL,
	"till_date_achievement" numeric(12, 2) NOT NULL,
	"yesterday_target" numeric(12, 2),
	"yesterday_achievement" numeric(12, 2),
	"sales_person_id" integer NOT NULL,
	"dealer_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesman_attendance" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"attendance_date" date NOT NULL,
	"location_name" varchar(500) NOT NULL,
	"in_time_timestamp" timestamp (6) with time zone NOT NULL,
	"out_time_timestamp" timestamp (6) with time zone,
	"in_time_image_captured" boolean NOT NULL,
	"out_time_image_captured" boolean NOT NULL,
	"in_time_image_url" varchar(500),
	"out_time_image_url" varchar(500),
	"in_time_latitude" numeric(10, 7) NOT NULL,
	"in_time_longitude" numeric(10, 7) NOT NULL,
	"in_time_accuracy" numeric(10, 2),
	"in_time_speed" numeric(10, 2),
	"in_time_heading" numeric(10, 2),
	"in_time_altitude" numeric(10, 2),
	"out_time_latitude" numeric(10, 7),
	"out_time_longitude" numeric(10, 7),
	"out_time_accuracy" numeric(10, 2),
	"out_time_speed" numeric(10, 2),
	"out_time_heading" numeric(10, 2),
	"out_time_altitude" numeric(10, 2),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesman_leave_applications" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"leave_type" varchar(100) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" varchar(500) NOT NULL,
	"status" varchar(50) NOT NULL,
	"admin_remarks" varchar(500),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technical_visit_reports" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"report_date" date NOT NULL,
	"visit_type" varchar(50) NOT NULL,
	"site_name_concerned_person" varchar(255) NOT NULL,
	"phone_no" varchar(20) NOT NULL,
	"email_id" varchar(255),
	"clients_remarks" varchar(500) NOT NULL,
	"salesperson_remarks" varchar(500) NOT NULL,
	"check_in_time" timestamp (6) with time zone NOT NULL,
	"check_out_time" timestamp (6) with time zone,
	"in_time_image_url" varchar(500),
	"out_time_image_url" varchar(500),
	"site_visit_brand_in_use" text[] NOT NULL,
	"site_visit_stage" text,
	"conversion_from_brand" text,
	"conversion_quantity_value" numeric(10, 2),
	"conversion_quantity_unit" varchar(20),
	"associated_party_name" text,
	"influencer_type" text[] NOT NULL,
	"service_type" text,
	"quality_complaint" text,
	"promotional_activity" text,
	"channel_partner_visit" text,
	"site_visit_type" varchar(50),
	"dhalai_verification_code" varchar(50),
	"is_verification_status" varchar(50),
	"meeting_id" varchar(255),
	"pjp_id" varchar(255),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tso_meetings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"date" date NOT NULL,
	"location" varchar(500) NOT NULL,
	"budget_allocated" numeric(12, 2),
	"participants_count" integer,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"workos_user_id" varchar(255),
	"company_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"role" varchar(255) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now(),
	"phone_number" varchar(50),
	"inviteToken" varchar(255),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"region" varchar(255),
	"area" varchar(255),
	"salesman_login_id" varchar(255),
	"hashed_password" text,
	"reports_to_id" integer,
	"no_of_pjp" integer,
	CONSTRAINT "users_workos_user_id_unique" UNIQUE("workos_user_id"),
	CONSTRAINT "users_inviteToken_unique" UNIQUE("inviteToken"),
	CONSTRAINT "users_salesman_login_id_unique" UNIQUE("salesman_login_id")
);
--> statement-breakpoint
ALTER TABLE "client_reports" ADD CONSTRAINT "client_reports_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_reports" ADD CONSTRAINT "collection_reports_dvr_id_daily_visit_reports_id_fk" FOREIGN KEY ("dvr_id") REFERENCES "public"."daily_visit_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_reports" ADD CONSTRAINT "collection_reports_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_reports" ADD CONSTRAINT "competition_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_related_dealer_id_dealers_id_fk" FOREIGN KEY ("related_dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_pjp_id_permanent_journey_plans_id_fk" FOREIGN KEY ("pjp_id") REFERENCES "public"."permanent_journey_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_visit_reports" ADD CONSTRAINT "daily_visit_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_visit_reports" ADD CONSTRAINT "daily_visit_reports_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_visit_reports" ADD CONSTRAINT "daily_visit_reports_sub_dealer_id_dealers_id_fk" FOREIGN KEY ("sub_dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_visit_reports" ADD CONSTRAINT "daily_visit_reports_pjp_id_permanent_journey_plans_id_fk" FOREIGN KEY ("pjp_id") REFERENCES "public"."permanent_journey_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_development_process" ADD CONSTRAINT "dealer_development_process_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_development_process" ADD CONSTRAINT "dealer_development_process_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_brand_mapping" ADD CONSTRAINT "dealer_brand_mapping_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_brand_mapping" ADD CONSTRAINT "dealer_brand_mapping_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_brand_mapping" ADD CONSTRAINT "dealer_brand_mapping_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_reports_and_scores" ADD CONSTRAINT "dealer_reports_and_scores_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealers" ADD CONSTRAINT "dealers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealers" ADD CONSTRAINT "dealers_parent_dealer_id_dealers_id_fk" FOREIGN KEY ("parent_dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_tracking" ADD CONSTRAINT "geo_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_gift_id_gift_inventory_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_destination_user_id_users_id_fk" FOREIGN KEY ("destination_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permanent_journey_plans" ADD CONSTRAINT "permanent_journey_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permanent_journey_plans" ADD CONSTRAINT "permanent_journey_plans_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permanent_journey_plans" ADD CONSTRAINT "permanent_journey_plans_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_dvr_id_daily_visit_reports_id_fk" FOREIGN KEY ("dvr_id") REFERENCES "public"."daily_visit_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_pjp_id_permanent_journey_plans_id_fk" FOREIGN KEY ("pjp_id") REFERENCES "public"."permanent_journey_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_report" ADD CONSTRAINT "sales_report_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_report" ADD CONSTRAINT "sales_report_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesman_attendance" ADD CONSTRAINT "salesman_attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesman_leave_applications" ADD CONSTRAINT "salesman_leave_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD CONSTRAINT "technical_visit_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD CONSTRAINT "technical_visit_reports_meeting_id_tso_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."tso_meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD CONSTRAINT "technical_visit_reports_pjp_id_permanent_journey_plans_id_fk" FOREIGN KEY ("pjp_id") REFERENCES "public"."permanent_journey_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tso_meetings" ADD CONSTRAINT "tso_meetings_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_reports_to_id_users_id_fk" FOREIGN KEY ("reports_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_collection_reports_dealer_id" ON "collection_reports" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_admin_user_id" ON "companies" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "competition_reports_user_idx" ON "competition_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_user_id" ON "daily_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_assigned_by_user_id" ON "daily_tasks" USING btree ("assigned_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_task_date" ON "daily_tasks" USING btree ("task_date");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_pjp_id" ON "daily_tasks" USING btree ("pjp_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_related_dealer_id" ON "daily_tasks" USING btree ("related_dealer_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_date_user" ON "daily_tasks" USING btree ("task_date","user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_status" ON "daily_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_daily_visit_reports_user_id" ON "daily_visit_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_visit_reports_pjp_id" ON "daily_visit_reports" USING btree ("pjp_id");--> statement-breakpoint
CREATE INDEX "idx_dvr_dealer_id" ON "daily_visit_reports" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_dvr_sub_dealer_id" ON "daily_visit_reports" USING btree ("sub_dealer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dealer_brand_mapping_dealer_id_brand_id_unique" ON "dealer_brand_mapping" USING btree ("dealer_id","brand_id");--> statement-breakpoint
CREATE INDEX "idx_dealers_user_id" ON "dealers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dealers_parent_dealer_id" ON "dealers" USING btree ("parent_dealer_id");--> statement-breakpoint
CREATE INDEX "idx_geo_user_time" ON "geo_tracking" USING btree ("user_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_geo_journey_time" ON "geo_tracking" USING btree ("journey_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_geo_active" ON "geo_tracking" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_geo_tracking_user_id" ON "geo_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_geo_tracking_recorded_at" ON "geo_tracking" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_gift_logs_gift_id" ON "gift_allocation_logs" USING btree ("gift_id");--> statement-breakpoint
CREATE INDEX "idx_gift_logs_user_id" ON "gift_allocation_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_gift_logs_source_user_id" ON "gift_allocation_logs" USING btree ("source_user_id");--> statement-breakpoint
CREATE INDEX "idx_gift_logs_destination_user_id" ON "gift_allocation_logs" USING btree ("destination_user_id");--> statement-breakpoint
CREATE INDEX "idx_mct_company_id" ON "master_connected_table" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "idx_mct_user_id" ON "master_connected_table" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_mct_dealer_id" ON "master_connected_table" USING btree ("dealerId");--> statement-breakpoint
CREATE INDEX "idx_mct_pjp_id" ON "master_connected_table" USING btree ("permanentJourneyPlanId");--> statement-breakpoint
CREATE INDEX "idx_mct_pjp_created_by_id" ON "master_connected_table" USING btree ("permanentJourneyPlanCreatedById");--> statement-breakpoint
CREATE INDEX "idx_mct_dailytask_id" ON "master_connected_table" USING btree ("dailyTaskId");--> statement-breakpoint
CREATE INDEX "idx_mct_dvr_id" ON "master_connected_table" USING btree ("dvrId");--> statement-breakpoint
CREATE INDEX "idx_mct_tvr_id" ON "master_connected_table" USING btree ("tvrId");--> statement-breakpoint
CREATE INDEX "idx_mct_attendance_id" ON "master_connected_table" USING btree ("attendanceId");--> statement-breakpoint
CREATE INDEX "idx_mct_leave_id" ON "master_connected_table" USING btree ("leaveApplicationId");--> statement-breakpoint
CREATE INDEX "idx_mct_client_report_id" ON "master_connected_table" USING btree ("clientReportId");--> statement-breakpoint
CREATE INDEX "idx_mct_comp_report_id" ON "master_connected_table" USING btree ("competitionReportId");--> statement-breakpoint
CREATE INDEX "idx_mct_geotracking_id" ON "master_connected_table" USING btree ("geoTrackingId");--> statement-breakpoint
CREATE INDEX "idx_mct_sales_order_id" ON "master_connected_table" USING btree ("salesOrderId");--> statement-breakpoint
CREATE INDEX "idx_mct_dealer_scores_id" ON "master_connected_table" USING btree ("dealerReportsAndScoresId");--> statement-breakpoint
CREATE INDEX "idx_mct_sales_report_id" ON "master_connected_table" USING btree ("salesReportId");--> statement-breakpoint
CREATE INDEX "idx_mct_collection_report_id" ON "master_connected_table" USING btree ("collectionReportId");--> statement-breakpoint
CREATE INDEX "idx_mct_ddp_id" ON "master_connected_table" USING btree ("ddpId");--> statement-breakpoint
CREATE INDEX "idx_mct_rating_id" ON "master_connected_table" USING btree ("ratingId");--> statement-breakpoint
CREATE INDEX "idx_mct_brand_id" ON "master_connected_table" USING btree ("brandId");--> statement-breakpoint
CREATE INDEX "idx_mct_dealer_brand_map_id" ON "master_connected_table" USING btree ("dealerBrandMappingId");--> statement-breakpoint
CREATE INDEX "idx_permanent_journey_plans_user_id" ON "permanent_journey_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_permanent_journey_plans_created_by_id" ON "permanent_journey_plans" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "idx_pjp_dealer_id" ON "permanent_journey_plans" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_dvr_id" ON "sales_orders" USING btree ("dvr_id");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_pjp_id" ON "sales_orders" USING btree ("pjp_id");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_order_date" ON "sales_orders" USING btree ("order_date");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_dealer_id" ON "sales_orders" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_status" ON "sales_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_salesman_attendance_user_id" ON "salesman_attendance" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_salesman_leave_applications_user_id" ON "salesman_leave_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_technical_visit_reports_user_id" ON "technical_visit_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_technical_visit_reports_meeting_id" ON "technical_visit_reports" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "idx_technical_visit_reports_pjp_id" ON "technical_visit_reports" USING btree ("pjp_id");--> statement-breakpoint
CREATE INDEX "idx_tso_meetings_created_by_user_id" ON "tso_meetings" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_companyid_email_unique" ON "users" USING btree ("company_id","email");--> statement-breakpoint
CREATE INDEX "idx_user_company_id" ON "users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_workos_user_id" ON "users" USING btree ("workos_user_id");