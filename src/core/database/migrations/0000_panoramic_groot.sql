CREATE TABLE IF NOT EXISTS "author_commit_counts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"commit_count" integer NOT NULL,
	"repository_full_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commits" (
	"id" serial PRIMARY KEY NOT NULL,
	"sha" text NOT NULL,
	"message" text NOT NULL,
	"author" text NOT NULL,
	"date" timestamp NOT NULL,
	"url" text NOT NULL,
	"repository_full_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repositories" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"name" text NOT NULL,
	"owner" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"language" text,
	"forks_count" integer DEFAULT 0,
	"stars_count" integer DEFAULT 0,
	"open_issues_count" integer DEFAULT 0,
	"watchers_count" integer DEFAULT 0,
	"last_fetch_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "repositories_full_name_unique" UNIQUE("full_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "author_commit_counts" ADD CONSTRAINT "author_commit_counts_repository_full_name_repositories_full_name_fk" FOREIGN KEY ("repository_full_name") REFERENCES "public"."repositories"("full_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commits" ADD CONSTRAINT "commits_repository_full_name_repositories_full_name_fk" FOREIGN KEY ("repository_full_name") REFERENCES "public"."repositories"("full_name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "author_repo_unique" ON "author_commit_counts" USING btree ("author","repository_full_name");