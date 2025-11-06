ALTER TABLE "permanent_journey_plans" ADD COLUMN "bulk_op_id" varchar(50);--> statement-breakpoint
ALTER TABLE "permanent_journey_plans" ADD COLUMN "idempotency_key" varchar(120);--> statement-breakpoint
CREATE INDEX "idx_pjp_bulk_op_id" ON "permanent_journey_plans" USING btree ("bulk_op_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_pjp_user_dealer_plan_date" ON "permanent_journey_plans" USING btree ("user_id","dealer_id","plan_date");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_pjp_idempotency_key_not_null" ON "permanent_journey_plans" USING btree ("idempotency_key") WHERE "permanent_journey_plans"."idempotency_key" IS NOT NULL;