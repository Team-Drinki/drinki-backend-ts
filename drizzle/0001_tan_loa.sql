ALTER TABLE "tasting_notes" ALTER COLUMN "alcohol_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasting_notes" ADD COLUMN "custom_alcohol_name" text;--> statement-breakpoint
ALTER TABLE "tasting_notes" ADD COLUMN "custom_alcohol_category" text;--> statement-breakpoint
ALTER TABLE "tasting_notes" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_user_target_type_unique" ON "reactions" USING btree ("user_id","target_id","target_type","reaction_type");