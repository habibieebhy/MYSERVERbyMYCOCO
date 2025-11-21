CREATE TABLE "mason_slab_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mason_id" uuid NOT NULL,
	"scheme_slab_id" uuid NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"points_awarded" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheme_slabs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"min_bags_best" integer,
	"min_bags_others" integer,
	"points_earned" integer NOT NULL,
	"slab_description" varchar(255),
	"reward_id" integer,
	"scheme_id" uuid NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technical_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"concerned_person" varchar(255) NOT NULL,
	"phone_no" varchar(20) NOT NULL,
	"address" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"site_type" varchar(50),
	"area" varchar(100),
	"region" varchar(100),
	"key_person_name" varchar(255),
	"key_person_phone_num" varchar(20),
	"stage_of_construction" varchar(100),
	"construction_start_date" date,
	"construction_end_date" date,
	"converted_site" boolean DEFAULT false,
	"first_visit_date" date,
	"last_visit_date" date,
	"need_follow_up" boolean DEFAULT false,
	"related_dealer_id" varchar(255),
	"related_mason_pc_id" uuid,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "dealers" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "geo_tracking" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "mason_on_scheme" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "mason_pc_side" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "permanent_journey_plans" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "tso_meetings" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "mason_slab_achievements" ADD CONSTRAINT "mason_slab_achievements_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mason_slab_achievements" ADD CONSTRAINT "mason_slab_achievements_scheme_slab_id_scheme_slabs_id_fk" FOREIGN KEY ("scheme_slab_id") REFERENCES "public"."scheme_slabs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheme_slabs" ADD CONSTRAINT "scheme_slabs_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheme_slabs" ADD CONSTRAINT "scheme_slabs_scheme_id_schemes_offers_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."schemes_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_sites" ADD CONSTRAINT "technical_sites_related_dealer_id_dealers_id_fk" FOREIGN KEY ("related_dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_sites" ADD CONSTRAINT "technical_sites_related_mason_pc_id_mason_pc_side_id_fk" FOREIGN KEY ("related_mason_pc_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_msa_mason_id" ON "mason_slab_achievements" USING btree ("mason_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_mason_slab_claim" ON "mason_slab_achievements" USING btree ("mason_id","scheme_slab_id");--> statement-breakpoint
CREATE INDEX "idx_scheme_slabs_scheme_id" ON "scheme_slabs" USING btree ("scheme_id");--> statement-breakpoint
CREATE INDEX "idx_technical_sites_dealer_id" ON "technical_sites" USING btree ("related_dealer_id");--> statement-breakpoint
CREATE INDEX "idx_technical_sites_mason_id" ON "technical_sites" USING btree ("related_mason_pc_id");--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealers" ADD CONSTRAINT "dealers_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_tracking" ADD CONSTRAINT "geo_tracking_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mason_on_scheme" ADD CONSTRAINT "mason_on_scheme_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mason_pc_side" ADD CONSTRAINT "mason_pc_side_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permanent_journey_plans" ADD CONSTRAINT "permanent_journey_plans_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_visit_reports" ADD CONSTRAINT "technical_visit_reports_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tso_meetings" ADD CONSTRAINT "tso_meetings_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_site_id_technical_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."technical_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_site_id" ON "daily_tasks" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_dealers_site_id" ON "dealers" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_geo_tracking_site_id" ON "geo_tracking" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_mason_on_scheme_site_id" ON "mason_on_scheme" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_mason_pc_side_site_id" ON "mason_pc_side" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_pjp_site_id" ON "permanent_journey_plans" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_tvr_site_id" ON "technical_visit_reports" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_tso_meetings_site_id" ON "tso_meetings" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_user_site_id" ON "users" USING btree ("site_id");