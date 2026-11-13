DO $$ BEGIN
  CREATE TYPE "notification_kind" AS ENUM (
    'account.family_registered',
    'account.staff_joined',
    'invite.accepted',
    'teacher.application_submitted',
    'appointment.booked',
    'payment.received'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "kind" "notification_kind" NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "href" text,
  "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "read_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_created_idx"
  ON "notifications" ("user_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx"
  ON "notifications" ("user_id", "read_at");
