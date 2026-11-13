CREATE TYPE "public"."payout_status" AS ENUM('pending', 'paid', 'cancelled');
--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'succeeded', 'failed', 'denied');
--> statement-breakpoint
ALTER TABLE "class_appointments" ADD COLUMN IF NOT EXISTS "calendar_event_id" text;
--> statement-breakpoint
ALTER TABLE "lesson_materials" ADD COLUMN IF NOT EXISTS "storage_path" text;
--> statement-breakpoint
ALTER TABLE "lesson_materials" ADD COLUMN IF NOT EXISTS "mime_type" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teacher_payouts" (
  "id" text PRIMARY KEY NOT NULL,
  "teacher_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "appointment_id" text REFERENCES "class_appointments"("id") ON DELETE set null,
  "amount_cents" integer NOT NULL,
  "status" "payout_status" DEFAULT 'pending' NOT NULL,
  "paid_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_refunds" (
  "id" text PRIMARY KEY NOT NULL,
  "payment_id" text NOT NULL REFERENCES "payments"("id") ON DELETE cascade,
  "amount_cents" integer NOT NULL,
  "status" "refund_status" DEFAULT 'pending' NOT NULL,
  "reason" text NOT NULL,
  "requested_by_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "reviewed_by_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "provider_refund_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_policy_acceptances" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "policy_key" text NOT NULL,
  "policy_version" text NOT NULL,
  "accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_policy_acceptances_user_policy_idx" ON "user_policy_acceptances" ("user_id", "policy_key", "policy_version");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_payouts_teacher_status_idx" ON "teacher_payouts" ("teacher_user_id", "status");
