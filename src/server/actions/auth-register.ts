"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { AppRole } from "@/lib/auth/roles";
import { sendVerificationEmail } from "@/lib/email/send";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import { requireDb } from "@/server/db";
import { notifyRoles, notifyUser } from "@/server/notifications/service";
import {
  familyProfiles,
  invitations,
  students,
  teacherProfiles,
  userRoles,
  users,
  verificationTokens,
} from "@/server/db/schema";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  primaryFirstName: z.string().min(1).max(80),
  primaryLastName: z.string().min(1).max(80),
});

const familyRegisterSchema = registerSchema.extend({
  phone: z.string().max(40).optional(),
  residentialCity: z.string().max(80).optional(),
  residentialState: z.string().max(2).optional(),
  learnerType: z.enum(["self", "children"]),
  students: z
    .array(
      z.object({
        firstName: z.string().min(1).max(80),
        lastName: z.string().min(1).max(80),
        email: z.string().email().optional().or(z.literal("")),
        age: z.coerce.number().int().min(3).max(99).optional(),
        grade: z.string().max(40).optional(),
        proficiency: z
          .enum(["beginner", "intermediate", "advanced"])
          .default("beginner"),
      }),
    )
    .default([]),
});

export type RegisterState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function registerFamilyAccount(
  input: z.infer<typeof familyRegisterSchema>,
): Promise<RegisterState> {
  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "auth-register",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const parsed = familyRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid registration data." };
  }

  const email = parsed.data.email.toLowerCase();
  const db = requireDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const fullName = `${parsed.data.primaryFirstName} ${parsed.data.primaryLastName}`;

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: fullName,
      primaryFirstName: parsed.data.primaryFirstName,
      primaryLastName: parsed.data.primaryLastName,
      phone: parsed.data.phone,
      passwordHash,
      status: "pending_verification",
    })
    .returning({ id: users.id });

  if (!created) {
    return { ok: false, error: "Could not create account." };
  }

  await db.insert(userRoles).values({
    userId: created.id,
    role: "family",
  });

  await db.insert(familyProfiles).values({
    userId: created.id,
    residentialCity: parsed.data.residentialCity,
    residentialState: parsed.data.residentialState,
    learnerType: parsed.data.learnerType,
  });

  if (parsed.data.learnerType === "children") {
    for (const student of parsed.data.students) {
      await db.insert(students).values({
        familyUserId: created.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || null,
        age: student.age,
        grade: student.grade,
        proficiency: student.proficiency,
      });
    }
  }

  const token = nanoid(48);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  const mail = await sendVerificationEmail(email, token);

  await notifyRoles(
    ["admin", "manager"],
    {
      kind: "account.family_registered",
      title: "New family account",
      body: `${fullName} registered (${email}). Verify email may still be pending.`,
      href: NOTIFICATION_ROUTES["account.family_registered"],
      meta: { userId: created.id, email, name: fullName },
    },
    { exceptUserId: created.id },
  );

  return {
    ok: true,
    message: mail.sent
      ? "Account created. We sent a verification link to your email."
      : "Account created. Email is not configured — check the server console for the verification link.",
  };
}

const inviteRegisterSchema = registerSchema.extend({
  token: z.string().min(32).max(128),
});

export async function registerViaInvite(
  input: z.infer<typeof inviteRegisterSchema>,
): Promise<RegisterState> {
  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "auth-invite-register",
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const parsed = inviteRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid registration data." };
  }

  const email = parsed.data.email.toLowerCase();
  const tokenHash = createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");
  const db = requireDb();

  const [invite] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, email),
        eq(invitations.tokenHash, tokenHash),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!invite) {
    return { ok: false, error: "Invite invalid or expired." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const meta = invite.profileMeta ?? {};
  const primaryFirstName = String(
    meta.primaryFirstName ?? parsed.data.primaryFirstName,
  );
  const primaryLastName = String(
    meta.primaryLastName ?? parsed.data.primaryLastName,
  );
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const fullName = `${primaryFirstName} ${primaryLastName}`;

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: fullName,
      primaryFirstName,
      primaryLastName,
      legalName: String(meta.legalName ?? ""),
      phone: String(meta.phone ?? ""),
      passwordHash,
      emailVerified: new Date(),
      status: "active",
    })
    .returning({ id: users.id });

  if (!created) {
    return { ok: false, error: "Could not create account." };
  }

  await db.insert(userRoles).values({
    userId: created.id,
    role: invite.role as AppRole,
    assignedBy: invite.invitedBy,
  });

  if (invite.role === "teacher") {
    await db.insert(teacherProfiles).values({
      userId: created.id,
      bio: String(meta.bio ?? ""),
      timezone: String(meta.timezone ?? "America/Chicago"),
      status:
        (meta.staffStatus as "invited" | "active" | "inactive") ?? "invited",
      teachingAgeGroups: (meta.teachingAgeGroups as string[]) ?? [],
      nativeLanguage: String(meta.nativeLanguage ?? "Spanish"),
      secondaryLanguages: (meta.secondaryLanguages as string[]) ?? ["English"],
    });
  }

  await db
    .update(invitations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(invitations.id, invite.id));

  const roleLabel =
    invite.role === "manager"
      ? "manager"
      : invite.role === "teacher"
        ? "teacher"
        : "staff";
  const href =
    invite.role === "family"
      ? NOTIFICATION_ROUTES["account.family_registered"]
      : NOTIFICATION_ROUTES["invite.accepted"];

  await notifyRoles(
    ["admin"],
    {
      kind: "account.staff_joined",
      title: `New ${roleLabel} joined`,
      body: `${fullName} accepted an invite and is now active.`,
      href,
      meta: {
        userId: created.id,
        role: invite.role,
        email,
        name: fullName,
      },
    },
    { exceptUserId: created.id },
  );

  if (invite.invitedBy) {
    await notifyUser(invite.invitedBy, {
      kind: "invite.accepted",
      title: "Invite accepted",
      body: `${fullName} joined as ${roleLabel}.`,
      href,
      meta: { userId: created.id, role: invite.role, name: fullName },
    });
  }

  return {
    ok: true,
    message: "Account created. You can sign in now.",
  };
}
