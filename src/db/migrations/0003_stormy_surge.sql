CREATE TABLE "mason_on_scheme" (
	"mason_id" uuid NOT NULL,
	"scheme_id" uuid NOT NULL,
	"enrolled_at" timestamp (6) with time zone DEFAULT now(),
	"status" varchar(255),
	CONSTRAINT "mason_on_scheme_mason_id_scheme_id_pk" PRIMARY KEY("mason_id","scheme_id")
);
--> statement-breakpoint
CREATE TABLE "mason_pc_side" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone_number" text NOT NULL,
	"kyc_doc_name" varchar(100),
	"kyc_doc_id_num" varchar(150),
	"verification_status" varchar(50),
	"bags_lifted" integer,
	"points_gained" integer,
	"is_referred" boolean,
	"referred_by_user" text,
	"referred_to_user" text,
	"dealer_id" varchar(255),
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "masons_on_meetings" (
	"mason_id" uuid NOT NULL,
	"meeting_id" varchar(255) NOT NULL,
	"attended_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "masons_on_meetings_mason_id_meeting_id_pk" PRIMARY KEY("mason_id","meeting_id")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"otp_code" varchar(10) NOT NULL,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"mason_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schemes_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"start_date" timestamp (6) with time zone,
	"end_date" timestamp (6) with time zone
);
--> statement-breakpoint
ALTER TABLE "client_reports" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "collection_reports" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "dealer_development_process" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "master_connected_table" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sales_report" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "client_reports" CASCADE;--> statement-breakpoint
DROP TABLE "collection_reports" CASCADE;--> statement-breakpoint
DROP TABLE "dealer_development_process" CASCADE;--> statement-breakpoint
DROP TABLE "master_connected_table" CASCADE;--> statement-breakpoint
DROP TABLE "sales_report" CASCADE;--> statement-breakpoint
ALTER TABLE "daily_visit_reports" ADD COLUMN "time_spent_in_loc" varchar(255);--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD COLUMN "technical_visit_report_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD COLUMN "dealer_visit_report_id" varchar(255);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "time_spent_in_loc" varchar(255);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "purpose_of_visit" varchar(500);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "site_photo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "first_visit_time" timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "last_visit_time" timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "first_visit_day" varchar(255);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "last_visit_day" varchar(255);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "site_visits_count" integer;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "other_visits_count" integer;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "total_visits_count" integer;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "region" varchar(100);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "area" varchar(100);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "latitude" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "longitude" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "mason_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_technical_role" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tech_login_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tech_hash_password" text;--> statement-breakpoint
ALTER TABLE "mason_on_scheme" ADD CONSTRAINT "mason_on_scheme_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mason_on_scheme" ADD CONSTRAINT "mason_on_scheme_scheme_id_schemes_offers_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."schemes_offers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mason_pc_side" ADD CONSTRAINT "mason_pc_side_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mason_pc_side" ADD CONSTRAINT "mason_pc_side_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "masons_on_meetings" ADD CONSTRAINT "masons_on_meetings_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "masons_on_meetings" ADD CONSTRAINT "masons_on_meetings_meeting_id_tso_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."tso_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mason_pc_side_dealer_id" ON "mason_pc_side" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_mason_pc_side_user_id" ON "mason_pc_side" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_masons_on_meetings_meeting_id" ON "masons_on_meetings" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "idx_otp_verifications_mason_id" ON "otp_verifications" USING btree ("mason_id");--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_technical_visit_report_id_technical_visit_reports_id_fk" FOREIGN KEY ("technical_visit_report_id") REFERENCES "public"."technical_visit_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_dealer_visit_report_id_daily_visit_reports_id_fk" FOREIGN KEY ("dealer_visit_report_id") REFERENCES "public"."daily_visit_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD CONSTRAINT "technical_visit_reports_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_gift_logs_tvr_id" ON "gift_allocation_logs" USING btree ("technical_visit_report_id");--> statement-breakpoint
CREATE INDEX "idx_gift_logs_dvr_id" ON "gift_allocation_logs" USING btree ("dealer_visit_report_id");--> statement-breakpoint
CREATE INDEX "idx_tvr_mason_id" ON "technical_visit_reports" USING btree ("mason_id");--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" DROP COLUMN "related_report_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tech_login_id_unique" UNIQUE("tech_login_id");