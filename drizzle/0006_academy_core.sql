CREATE TYPE "public"."appointment_change_type" AS ENUM('cancel', 'reschedule');
--> statement-breakpoint
CREATE TYPE "public"."appointment_change_status" AS ENUM('pending', 'approved', 'denied');
--> statement-breakpoint
CREATE TYPE "public"."appointment_change_reason" AS ENUM(
  'schedule_conflict',
  'illness',
  'emergency',
  'travel',
  'teacher_unavailable',
  'system_error',
  'other'
);
--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE IF NOT EXISTS 'rescheduled';
--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE IF NOT EXISTS 'appointment.cancelled';
--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE IF NOT EXISTS 'appointment.reschedule_requested';
--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE IF NOT EXISTS 'appointment.change_reviewed';
--> statement-breakpoint
ALTER TABLE "class_appointments" ADD COLUMN IF NOT EXISTS "meeting_url" text;
--> statement-breakpoint
ALTER TABLE "class_appointments" ADD COLUMN IF NOT EXISTS "rescheduled_from_id" text;
--> statement-breakpoint
ALTER TABLE "class_appointments" ADD COLUMN IF NOT EXISTS "rescheduled_to_id" text;
--> statement-breakpoint
ALTER TABLE "class_appointments" ADD COLUMN IF NOT EXISTS "credit_held" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "family_class_credits" (
  "family_user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "balance" integer DEFAULT 0 NOT NULL,
  "free_reschedules_used" integer DEFAULT 0 NOT NULL,
  "period_started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_ledger" (
  "id" text PRIMARY KEY NOT NULL,
  "family_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "delta" integer NOT NULL,
  "reason" text NOT NULL,
  "payment_id" text REFERENCES "payments"("id") ON DELETE set null,
  "appointment_id" text REFERENCES "class_appointments"("id") ON DELETE set null,
  "change_request_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduling_policies" (
  "id" text PRIMARY KEY NOT NULL,
  "free_cancel_hours" integer DEFAULT 24 NOT NULL,
  "late_cancel_penalty_credits" integer DEFAULT 1 NOT NULL,
  "free_reschedule_hours" integer DEFAULT 24 NOT NULL,
  "late_reschedule_penalty_credits" integer DEFAULT 1 NOT NULL,
  "free_reschedules_per_month" integer DEFAULT 2 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "scheduling_policies" ("id", "free_cancel_hours", "late_cancel_penalty_credits", "free_reschedule_hours", "late_reschedule_penalty_credits", "free_reschedules_per_month")
VALUES ('default', 24, 1, 24, 1, 2)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointment_change_requests" (
  "id" text PRIMARY KEY NOT NULL,
  "appointment_id" text NOT NULL REFERENCES "class_appointments"("id") ON DELETE cascade,
  "request_type" "appointment_change_type" NOT NULL,
  "requested_by_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "requested_by_role" "user_role" NOT NULL,
  "reason_code" "appointment_change_reason" NOT NULL,
  "reason_text" text,
  "proposed_starts_at" timestamp with time zone,
  "proposed_ends_at" timestamp with time zone,
  "penalty_credits" integer DEFAULT 0 NOT NULL,
  "status" "appointment_change_status" DEFAULT 'pending' NOT NULL,
  "reviewed_by_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "review_note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_materials" (
  "id" text PRIMARY KEY NOT NULL,
  "appointment_id" text NOT NULL REFERENCES "class_appointments"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "url" text NOT NULL,
  "uploaded_by_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointment_reminders" (
  "id" text PRIMARY KEY NOT NULL,
  "appointment_id" text NOT NULL REFERENCES "class_appointments"("id") ON DELETE cascade,
  "kind" text NOT NULL,
  "scheduled_for" timestamp with time zone NOT NULL,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_change_requests_status_idx" ON "appointment_change_requests" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_ledger_family_idx" ON "credit_ledger" ("family_user_id");
