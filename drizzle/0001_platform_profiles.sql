CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."learner_type" AS ENUM('self', 'children');--> statement-breakpoint
CREATE TYPE "public"."language_proficiency" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."staff_member_status" AS ENUM('invited', 'active', 'inactive');--> statement-breakpoint
CREATE TABLE "class_appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_user_id" text NOT NULL,
	"family_user_id" text NOT NULL,
	"student_id" text,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"lesson_note" text,
	"taught" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"residential_city" text,
	"residential_state" text,
	"learner_type" "learner_type" DEFAULT 'self' NOT NULL,
	"preferred_teacher_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"family_user_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"age" integer,
	"grade" text,
	"language_to_learn" text DEFAULT 'Spanish' NOT NULL,
	"proficiency" "language_proficiency" DEFAULT 'beginner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_calendar_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_user_id" text NOT NULL,
	"block_date" timestamp NOT NULL,
	"start_time" text,
	"end_time" text,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"timezone" text DEFAULT 'America/Chicago' NOT NULL,
	"status" "staff_member_status" DEFAULT 'invited' NOT NULL,
	"teaching_age_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"native_language" text DEFAULT 'Spanish' NOT NULL,
	"secondary_languages" jsonb DEFAULT '["English"]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_weekly_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_user_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "profile_meta" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "class_appointments" ADD CONSTRAINT "class_appointments_teacher_user_id_users_id_fk" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_appointments" ADD CONSTRAINT "class_appointments_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_appointments" ADD CONSTRAINT "class_appointments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_profiles" ADD CONSTRAINT "family_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_profiles" ADD CONSTRAINT "family_profiles_preferred_teacher_id_users_id_fk" FOREIGN KEY ("preferred_teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_family_user_id_users_id_fk" FOREIGN KEY ("family_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_calendar_blocks" ADD CONSTRAINT "teacher_calendar_blocks_teacher_user_id_users_id_fk" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_weekly_availability" ADD CONSTRAINT "teacher_weekly_availability_teacher_user_id_users_id_fk" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;