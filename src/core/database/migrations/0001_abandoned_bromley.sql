ALTER TABLE "repositories" ALTER COLUMN "last_fetch_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "repositories" ALTER COLUMN "last_fetch_date" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "commit_unique" ON "commits" USING btree ("sha");