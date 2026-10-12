CREATE TABLE "achievements" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"title" varchar(300) NOT NULL,
	"value" text,
	"description" text,
	"url" text,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_entries" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"institution" varchar(300) NOT NULL,
	"qualification" text NOT NULL,
	"status" text NOT NULL,
	"dates" text,
	"description" text,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_profile" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"greeting" text NOT NULL,
	"role" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"resume_url" text NOT NULL,
	"illustration" text NOT NULL,
	"about_body" text NOT NULL,
	"about_seeking" text NOT NULL,
	"contact_message" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_profile_singleton_id_check" CHECK ("portfolio_profile"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"category" varchar(200) NOT NULL,
	"demo" boolean,
	"description" text NOT NULL,
	"contribution" text,
	"image" text NOT NULL,
	"live_url" text NOT NULL,
	"source_url" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_interests" (
	"profile_id" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"interest" text NOT NULL,
	CONSTRAINT "profile_interests_pk" PRIMARY KEY("profile_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "profile_languages" (
	"profile_id" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"proficiency" varchar(200) NOT NULL,
	CONSTRAINT "profile_languages_pk" PRIMARY KEY("profile_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" varchar(100) NOT NULL,
	"sort_order" integer NOT NULL,
	"technology" varchar(200) NOT NULL,
	CONSTRAINT "project_technologies_pk" PRIMARY KEY("project_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "skill_groups" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_items" (
	"group_id" varchar(100) NOT NULL,
	"sort_order" integer NOT NULL,
	"item" varchar(200) NOT NULL,
	CONSTRAINT "skill_items_pk" PRIMARY KEY("group_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"label" varchar(120) NOT NULL,
	"url" text NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
INSERT INTO "portfolio_profile" (
	"id", "name", "greeting", "role", "tagline", "description", "location", "email", "phone",
	"resume_url", "illustration", "about_body", "about_seeking", "contact_message"
)
SELECT
	1,
	COALESCE(content.profile->>'name', ''),
	COALESCE(content.profile->>'greeting', ''),
	COALESCE(content.profile->>'role', ''),
	COALESCE(content.profile->>'tagline', ''),
	COALESCE(content.profile->>'description', ''),
	COALESCE(content.profile->>'location', ''),
	COALESCE(content.profile->>'email', ''),
	COALESCE(content.profile->>'phone', ''),
	COALESCE(content.profile->>'resumeUrl', ''),
	COALESCE(content.profile->>'illustration', ''),
	COALESCE(content.profile #>> '{about,body}', ''),
	COALESCE(content.profile #>> '{about,seeking}', ''),
	COALESCE(content.profile->>'contactMessage', '')
FROM "portfolio_content" AS content
WHERE content.id = 1
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "profile_languages" ("profile_id", "sort_order", "name", "proficiency")
SELECT 1, (entry.ordinality - 1)::integer, COALESCE(entry.value->>'name', ''), COALESCE(entry.value->>'proficiency', '')
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.profile->'languages', '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "profile_interests" ("profile_id", "sort_order", "interest")
SELECT 1, (entry.ordinality - 1)::integer, entry.value #>> '{}'
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.profile #> '{about,interests}', '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "social_links" ("id", "profile_id", "label", "url", "visible", "sort_order")
SELECT entry.value->>'id', 1, COALESCE(entry.value->>'label', ''), COALESCE(entry.value->>'url', ''), COALESCE((entry.value->>'visible')::boolean, true), (entry.ordinality - 1)::integer
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.profile->'socialLinks', '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1 AND entry.value->>'id' IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "portfolio_projects" ("id", "title", "category", "demo", "description", "contribution", "image", "live_url", "source_url", "featured", "sort_order")
SELECT entry.value->>'id', COALESCE(entry.value->>'title', ''), COALESCE(entry.value->>'category', ''),
	(entry.value->>'demo')::boolean, COALESCE(entry.value->>'description', ''), entry.value->>'contribution',
	COALESCE(entry.value->>'image', ''), COALESCE(entry.value->>'liveUrl', ''), COALESCE(entry.value->>'sourceUrl', ''),
	COALESCE((entry.value->>'featured')::boolean, false), (entry.ordinality - 1)::integer
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.projects, '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1 AND entry.value->>'id' IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_technologies" ("project_id", "sort_order", "technology")
SELECT project.value->>'id', (technology.ordinality - 1)::integer, technology.value #>> '{}'
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.projects, '[]'::jsonb)) AS project(value)
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(project.value->'technologies', '[]'::jsonb)) WITH ORDINALITY AS technology(value, ordinality)
WHERE content.id = 1 AND project.value->>'id' IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "skill_groups" ("id", "title", "sort_order")
SELECT entry.value->>'id', COALESCE(entry.value->>'title', ''), (entry.ordinality - 1)::integer
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.skills, '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1 AND entry.value->>'id' IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "skill_items" ("group_id", "sort_order", "item")
SELECT group_entry.value->>'id', (item.ordinality - 1)::integer, item.value #>> '{}'
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.skills, '[]'::jsonb)) AS group_entry(value)
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(group_entry.value->'items', '[]'::jsonb)) WITH ORDINALITY AS item(value, ordinality)
WHERE content.id = 1 AND group_entry.value->>'id' IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "education_entries" ("id", "institution", "qualification", "status", "dates", "description", "sort_order")
SELECT entry.value->>'id', COALESCE(entry.value->>'institution', ''), COALESCE(entry.value->>'qualification', ''),
	COALESCE(entry.value->>'status', ''), entry.value->>'dates', entry.value->>'description', (entry.ordinality - 1)::integer
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.education, '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1 AND entry.value->>'id' IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "achievements" ("id", "title", "value", "description", "url", "sort_order")
SELECT entry.value->>'id', COALESCE(entry.value->>'title', ''), entry.value->>'value', entry.value->>'description', entry.value->>'url', (entry.ordinality - 1)::integer
FROM "portfolio_content" AS content
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(content.achievements, '[]'::jsonb)) WITH ORDINALITY AS entry(value, ordinality)
WHERE content.id = 1 AND entry.value->>'id' IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DROP TABLE "portfolio_content" CASCADE;--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."portfolio_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_languages" ADD CONSTRAINT "profile_languages_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."portfolio_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_items" ADD CONSTRAINT "skill_items_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."skill_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."portfolio_profile"("id") ON DELETE cascade ON UPDATE no action;
