CREATE TYPE "public"."cms_content_kind" AS ENUM('blog', 'page');
--> statement-breakpoint
CREATE TYPE "public"."cms_content_status" AS ENUM('draft', 'published');
--> statement-breakpoint
CREATE TYPE "public"."study_workbook_status" AS ENUM('draft', 'published');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_contents" (
  "id" text PRIMARY KEY NOT NULL,
  "kind" "cms_content_kind" NOT NULL,
  "slug" text NOT NULL,
  "locale" text DEFAULT 'en' NOT NULL,
  "title" text NOT NULL,
  "excerpt" text,
  "body_markdown" text DEFAULT '' NOT NULL,
  "cover_image_url" text,
  "read_minutes" integer DEFAULT 5 NOT NULL,
  "status" "cms_content_status" DEFAULT 'draft' NOT NULL,
  "author_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cms_contents_kind_slug_locale_idx" ON "cms_contents" ("kind", "slug", "locale");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_workbooks" (
  "id" text PRIMARY KEY NOT NULL,
  "teacher_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "family_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "student_id" text REFERENCES "students"("id") ON DELETE set null,
  "appointment_id" text REFERENCES "class_appointments"("id") ON DELETE set null,
  "title" text NOT NULL,
  "description" text,
  "blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" "study_workbook_status" DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_progress_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "workbook_id" text NOT NULL REFERENCES "study_workbooks"("id") ON DELETE cascade,
  "family_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "block_id" text NOT NULL,
  "reflection" text,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "study_progress_workbook_family_block_idx" ON "study_progress_logs" ("workbook_id", "family_user_id", "block_id");
