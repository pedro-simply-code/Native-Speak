import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "teacher",
  "family",
]);

export const userStatusEnum = pgEnum("user_status", [
  "pending_verification",
  "active",
  "suspended",
]);

export const twoFactorMethodEnum = pgEnum("two_factor_method", ["email", "totp"]);

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const teacherApplicationStatusEnum = pgEnum("teacher_application_status", [
  "submitted",
  "under_review",
  "approved",
  "rejected",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "paypal",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "requires_action",
  "succeeded",
  "failed",
  "refunded",
  "canceled",
]);

export const staffMemberStatusEnum = pgEnum("staff_member_status", [
  "invited",
  "active",
  "inactive",
]);

export const learnerTypeEnum = pgEnum("learner_type", ["self", "children"]);

export const proficiencyEnum = pgEnum("language_proficiency", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
]);

export const appointmentChangeTypeEnum = pgEnum("appointment_change_type", [
  "cancel",
  "reschedule",
]);

export const appointmentChangeStatusEnum = pgEnum("appointment_change_status", [
  "pending",
  "approved",
  "denied",
]);

export const appointmentChangeReasonEnum = pgEnum("appointment_change_reason", [
  "schedule_conflict",
  "illness",
  "emergency",
  "travel",
  "teacher_unavailable",
  "system_error",
  "other",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  primaryFirstName: text("primary_first_name"),
  primaryLastName: text("primary_last_name"),
  legalName: text("legal_name"),
  phone: text("phone"),
  status: userStatusEnum("status").default("pending_verification").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until", { mode: "date" }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorMethod: twoFactorMethodEnum("two_factor_method"),
  totpSecretEnc: text("totp_secret_enc"),
  sessionVersion: integer("session_version").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
]);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    assignedBy: text("assigned_by").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.role] })],
);

export const invitations = pgTable("invitations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  tokenHash: text("token_hash").notNull(),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: inviteStatusEnum("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
  profileMeta: jsonb("profile_meta")
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const teacherProfiles = pgTable("teacher_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  timezone: text("timezone").default("America/Chicago").notNull(),
  status: staffMemberStatusEnum("status").default("invited").notNull(),
  teachingAgeGroups: jsonb("teaching_age_groups")
    .$type<string[]>()
    .default([])
    .notNull(),
  nativeLanguage: text("native_language").default("Spanish").notNull(),
  secondaryLanguages: jsonb("secondary_languages")
    .$type<string[]>()
    .default(["English"])
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const familyProfiles = pgTable("family_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  residentialCity: text("residential_city"),
  residentialState: text("residential_state"),
  learnerType: learnerTypeEnum("learner_type").default("self").notNull(),
  preferredTeacherId: text("preferred_teacher_id").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  familyUserId: text("family_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  age: integer("age"),
  grade: text("grade"),
  languageToLearn: text("language_to_learn").default("Spanish").notNull(),
  proficiency: proficiencyEnum("proficiency").default("beginner").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const teacherWeeklyAvailability = pgTable(
  "teacher_weekly_availability",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teacherUserId: text("teacher_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
  },
);

export const teacherCalendarBlocks = pgTable("teacher_calendar_blocks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blockDate: timestamp("block_date", { mode: "date" }).notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const classAppointments = pgTable("class_appointments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  familyUserId: text("family_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").references(() => students.id, {
    onDelete: "set null",
  }),
  startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
  endsAt: timestamp("ends_at", { mode: "date" }).notNull(),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  lessonNote: text("lesson_note"),
  taught: boolean("taught"),
  meetingUrl: text("meeting_url"),
  rescheduledFromId: text("rescheduled_from_id"),
  rescheduledToId: text("rescheduled_to_id"),
  creditHeld: boolean("credit_held").default(true).notNull(),
  calendarEventId: text("calendar_event_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const familyClassCredits = pgTable("family_class_credits", {
  familyUserId: text("family_user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").default(0).notNull(),
  freeReschedulesUsed: integer("free_reschedules_used").default(0).notNull(),
  periodStartedAt: timestamp("period_started_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const creditLedger = pgTable("credit_ledger", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  familyUserId: text("family_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  paymentId: text("payment_id").references(() => payments.id, {
    onDelete: "set null",
  }),
  appointmentId: text("appointment_id").references(() => classAppointments.id, {
    onDelete: "set null",
  }),
  changeRequestId: text("change_request_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const schedulingPolicies = pgTable("scheduling_policies", {
  id: text("id").primaryKey(),
  freeCancelHours: integer("free_cancel_hours").default(24).notNull(),
  lateCancelPenaltyCredits: integer("late_cancel_penalty_credits")
    .default(1)
    .notNull(),
  freeRescheduleHours: integer("free_reschedule_hours").default(24).notNull(),
  lateReschedulePenaltyCredits: integer("late_reschedule_penalty_credits")
    .default(1)
    .notNull(),
  freeReschedulesPerMonth: integer("free_reschedules_per_month")
    .default(2)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const appointmentChangeRequests = pgTable("appointment_change_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => classAppointments.id, { onDelete: "cascade" }),
  requestType: appointmentChangeTypeEnum("request_type").notNull(),
  requestedByUserId: text("requested_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  requestedByRole: userRoleEnum("requested_by_role").notNull(),
  reasonCode: appointmentChangeReasonEnum("reason_code").notNull(),
  reasonText: text("reason_text"),
  proposedStartsAt: timestamp("proposed_starts_at", { mode: "date" }),
  proposedEndsAt: timestamp("proposed_ends_at", { mode: "date" }),
  penaltyCredits: integer("penalty_credits").default(0).notNull(),
  status: appointmentChangeStatusEnum("status").default("pending").notNull(),
  reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
});

export const lessonMaterials = pgTable("lesson_materials", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => classAppointments.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  storagePath: text("storage_path"),
  mimeType: text("mime_type"),
  uploadedByUserId: text("uploaded_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const appointmentReminders = pgTable("appointment_reminders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => classAppointments.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  scheduledFor: timestamp("scheduled_for", { mode: "date" }).notNull(),
  sentAt: timestamp("sent_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "paid",
  "cancelled",
]);

export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "succeeded",
  "failed",
  "denied",
]);

export const teacherPayouts = pgTable("teacher_payouts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  appointmentId: text("appointment_id").references(() => classAppointments.id, {
    onDelete: "set null",
  }),
  amountCents: integer("amount_cents").notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const paymentRefunds = pgTable("payment_refunds", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  status: refundStatusEnum("status").default("pending").notNull(),
  reason: text("reason").notNull(),
  requestedByUserId: text("requested_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  providerRefundId: text("provider_refund_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
});

export const userPolicyAcceptances = pgTable(
  "user_policy_acceptances",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    policyKey: text("policy_key").notNull(),
    policyVersion: text("policy_version").notNull(),
    acceptedAt: timestamp("accepted_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_policy_acceptances_user_policy_idx").on(
      table.userId,
      table.policyKey,
      table.policyVersion,
    ),
  ],
);

export const teacherApplications = pgTable("teacher_applications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentUrls: jsonb("document_urls").$type<string[]>().default([]).notNull(),
  status: teacherApplicationStatusEnum("status").default("submitted").notNull(),
  reviewedBy: text("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: paymentProviderEnum("provider").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("usd").notNull(),
  externalId: text("external_id"),
  metadata: jsonb("metadata").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/** JWT refresh tokens for mobile apps (rotating). */
export const apiRefreshTokens = pgTable("api_refresh_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const notificationKindEnum = pgEnum("notification_kind", [
  "account.family_registered",
  "account.staff_joined",
  "invite.accepted",
  "teacher.application_submitted",
  "appointment.booked",
  "appointment.cancelled",
  "appointment.reschedule_requested",
  "appointment.change_reviewed",
  "payment.received",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: notificationKindEnum("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}).notNull(),
    readAt: timestamp("read_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
);

export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorUserId: text("actor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  target: text("target"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  ip: text("ip"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const authActiveSessions = pgTable("auth_active_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jti: text("jti").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  client: text("client").default("web").notNull(),
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const authLoginProofs = pgTable("auth_login_proofs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const authOtpChallenges = pgTable("auth_otp_challenges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  purpose: text("purpose").notNull(),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(5).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  consumedAt: timestamp("consumed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const cmsContentKindEnum = pgEnum("cms_content_kind", ["blog", "page"]);
export const cmsContentStatusEnum = pgEnum("cms_content_status", [
  "draft",
  "published",
]);
export const studyWorkbookStatusEnum = pgEnum("study_workbook_status", [
  "draft",
  "published",
]);

export const cmsContents = pgTable(
  "cms_contents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    kind: cmsContentKindEnum("kind").notNull(),
    slug: text("slug").notNull(),
    locale: text("locale").default("en").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    bodyMarkdown: text("body_markdown").default("").notNull(),
    bodyLexical: jsonb("body_lexical").$type<Record<string, unknown>>(),
    coverImageUrl: text("cover_image_url"),
    readMinutes: integer("read_minutes").default(5).notNull(),
    status: cmsContentStatusEnum("status").default("draft").notNull(),
    authorUserId: text("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cms_contents_kind_slug_locale_idx").on(
      table.kind,
      table.slug,
      table.locale,
    ),
  ],
);

export type StudyBlock =
  | {
      id: string;
      type: "note";
      title: string;
      body: string;
    }
  | {
      id: string;
      type: "exercise";
      title: string;
      instructions: string;
    }
  | {
      id: string;
      type: "resource";
      title: string;
      url: string;
    };

export const studyWorkbooks = pgTable("study_workbooks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  teacherUserId: text("teacher_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  familyUserId: text("family_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").references(() => students.id, {
    onDelete: "set null",
  }),
  appointmentId: text("appointment_id").references(() => classAppointments.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  blocks: jsonb("blocks").$type<StudyBlock[]>().default([]).notNull(),
  status: studyWorkbookStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const studyProgressLogs = pgTable(
  "study_progress_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workbookId: text("workbook_id")
      .notNull()
      .references(() => studyWorkbooks.id, { onDelete: "cascade" }),
    familyUserId: text("family_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockId: text("block_id").notNull(),
    reflection: text("reflection"),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("study_progress_workbook_family_block_idx").on(
      table.workbookId,
      table.familyUserId,
      table.blockId,
    ),
  ],
);

export const siteMedia = pgTable("site_media", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  altText: text("alt_text"),
  uploadedByUserId: text("uploaded_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type MarketingBlock =
  | {
      id: string;
      type: "hero";
      eyebrow: string;
      title: string;
      subtitle: string;
      highlights: string[];
      ctaLabel: string;
      ctaHref: string;
      imageMediaId?: string;
      imageUrl?: string;
    }
  | {
      id: string;
      type: "stats";
      items: { value: string; label: string }[];
    }
  | {
      id: string;
      type: "steps";
      eyebrow?: string;
      title: string;
      subtitle?: string;
      steps: { step: string; title: string; body: string }[];
    }
  | {
      id: string;
      type: "features";
      title: string;
      subtitle?: string;
      items: { title: string; body: string }[];
    }
  | {
      id: string;
      type: "bullets";
      title: string;
      intro?: string;
      bullets: string[];
    }
  | {
      id: string;
      type: "richText";
      title?: string;
      lexicalState: Record<string, unknown> | null;
    }
  | {
      id: string;
      type: "image";
      mediaId?: string;
      url?: string;
      alt: string;
      caption?: string;
    }
  | {
      id: string;
      type: "cta";
      title: string;
      body: string;
      buttonLabel: string;
      buttonHref: string;
    };

export const marketingPageDrafts = pgTable(
  "marketing_page_drafts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pageKey: text("page_key").notNull(),
    locale: text("locale").default("en").notNull(),
    blocks: jsonb("blocks").$type<MarketingBlock[]>().default([]).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("marketing_page_drafts_key_locale_idx").on(
      table.pageKey,
      table.locale,
    ),
  ],
);

export const rateLimitEvents = pgTable("rate_limit_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bucket: text("bucket").notNull(),
  key: text("key").notNull(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
