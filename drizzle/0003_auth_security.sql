DO $$ BEGIN
  CREATE TYPE "two_factor_method" AS ENUM ('email', 'totp');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failed_login_attempts" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_until" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_method" "two_factor_method";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_secret_enc" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_login_proofs" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_login_proofs_user_idx" ON "auth_login_proofs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_login_proofs_expires_idx" ON "auth_login_proofs" ("expires_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_otp_challenges" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "user_id" text REFERENCES "users"("id") ON DELETE CASCADE,
  "purpose" text NOT NULL,
  "code_hash" text NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 5 NOT NULL,
  "expires_at" timestamp NOT NULL,
  "consumed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_otp_email_purpose_idx" ON "auth_otp_challenges" ("email", "purpose");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_otp_expires_idx" ON "auth_otp_challenges" ("expires_at");
