CREATE TABLE IF NOT EXISTS "site_media" (
  "id" text PRIMARY KEY NOT NULL,
  "url" text NOT NULL,
  "storage_key" text NOT NULL,
  "file_name" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "alt_text" text,
  "uploaded_by_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketing_page_drafts" (
  "id" text PRIMARY KEY NOT NULL,
  "page_key" text NOT NULL,
  "locale" text DEFAULT 'en' NOT NULL,
  "blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "marketing_page_drafts_key_locale_idx" ON "marketing_page_drafts" ("page_key", "locale");
--> statement-breakpoint
ALTER TABLE "cms_contents" ADD COLUMN IF NOT EXISTS "body_lexical" jsonb;
