CREATE INDEX IF NOT EXISTS "class_appointments_starts_at_idx" ON "class_appointments" ("starts_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "class_appointments_status_idx" ON "class_appointments" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("status");
