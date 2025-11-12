CREATE TABLE "auth_sessions" (
	"session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mason_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "auth_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "bag_lifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mason_id" uuid NOT NULL,
	"dealer_id" varchar(255),
	"purchase_date" timestamp (6) with time zone NOT NULL,
	"bag_count" integer NOT NULL,
	"points_credited" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mason_id" uuid NOT NULL,
	"aadhaar_number" varchar(20),
	"pan_number" varchar(20),
	"voter_id_number" varchar(20),
	"documents" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"remark" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "points_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mason_id" uuid NOT NULL,
	"source_type" varchar(32) NOT NULL,
	"source_id" uuid,
	"points" integer NOT NULL,
	"memo" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	CONSTRAINT "reward_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reward_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mason_id" uuid NOT NULL,
	"reward_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'placed' NOT NULL,
	"points_debited" integer NOT NULL,
	"delivery_name" varchar(160),
	"delivery_phone" varchar(20),
	"delivery_address" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tso_assignments" (
	"tso_id" integer NOT NULL,
	"mason_id" uuid NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tso_assignments_tso_id_mason_id_pk" PRIMARY KEY("tso_id","mason_id")
);
--> statement-breakpoint
ALTER TABLE "gift_inventory" RENAME TO "rewards";--> statement-breakpoint
ALTER TABLE "mason_pc_side" RENAME COLUMN "verification_status" TO "kyc_status";--> statement-breakpoint
ALTER TABLE "mason_pc_side" RENAME COLUMN "points_gained" TO "points_balance";--> statement-breakpoint
ALTER TABLE "rewards" DROP CONSTRAINT "gift_inventory_item_name_unique";--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" DROP CONSTRAINT "gift_allocation_logs_gift_id_gift_inventory_id_fk";
--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "point_cost" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "meta" jsonb;--> statement-breakpoint
ALTER TABLE "mason_pc_side" ADD COLUMN "firebase_uid" varchar(128);--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bag_lifts" ADD CONSTRAINT "bag_lifts_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bag_lifts" ADD CONSTRAINT "bag_lifts_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bag_lifts" ADD CONSTRAINT "bag_lifts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tso_assignments" ADD CONSTRAINT "tso_assignments_tso_id_users_id_fk" FOREIGN KEY ("tso_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tso_assignments" ADD CONSTRAINT "tso_assignments_mason_id_mason_pc_side_id_fk" FOREIGN KEY ("mason_id") REFERENCES "public"."mason_pc_side"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bag_lifts_mason_id" ON "bag_lifts" USING btree ("mason_id");--> statement-breakpoint
CREATE INDEX "idx_bag_lifts_dealer_id" ON "bag_lifts" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_bag_lifts_status" ON "bag_lifts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_kyc_submissions_mason_id" ON "kyc_submissions" USING btree ("mason_id");--> statement-breakpoint
CREATE UNIQUE INDEX "points_ledger_source_id_unique" ON "points_ledger" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_points_ledger_mason_id" ON "points_ledger" USING btree ("mason_id");--> statement-breakpoint
CREATE INDEX "idx_points_ledger_source_id" ON "points_ledger" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_reward_redemptions_mason_id" ON "reward_redemptions" USING btree ("mason_id");--> statement-breakpoint
CREATE INDEX "idx_reward_redemptions_status" ON "reward_redemptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tso_assignments_tso_id" ON "tso_assignments" USING btree ("tso_id");--> statement-breakpoint
ALTER TABLE "gift_allocation_logs" ADD CONSTRAINT "gift_allocation_logs_gift_id_rewards_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_category_id_reward_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."reward_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rewards_category_id" ON "rewards" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "rewards" DROP COLUMN "unit_price";--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_item_name_unique" UNIQUE("item_name");--> statement-breakpoint
ALTER TABLE "mason_pc_side" ADD CONSTRAINT "mason_pc_side_firebase_uid_unique" UNIQUE("firebase_uid");