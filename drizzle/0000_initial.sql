CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contact_rate_limits" (
	"client_key" varchar(64) PRIMARY KEY NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submission_count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_content" (
	"id" integer PRIMARY KEY NOT NULL,
	"profile" jsonb NOT NULL,
	"projects" jsonb NOT NULL,
	"skills" jsonb NOT NULL,
	"education" jsonb NOT NULL,
	"achievements" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_content_singleton_id_check" CHECK ("portfolio_content"."id" = 1)
);
--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");