"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";
import { verifyPasswordForUser } from "@/lib/security/credentials";
import { sendVerificationEmail } from "@/lib/email/send";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  fulfillStaffInvite,
  markInviteAccepted,
} from "@/lib/auth/staff-invite";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import { requireDb } from "@/server/db";
import { notifyRoles } from "@/server/notifications/service";
import {
  familyProfiles,
  invitations,
  students,
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

  const [existingUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const meta = invite.profileMeta ?? {};
  const primaryFirstName = String(
    meta.primaryFirstName ?? parsed.data.primaryFirstName,
  );
  const primaryLastName = String(
    meta.primaryLastName ?? parsed.data.primaryLastName,
  );
  const fullName = `${primaryFirstName} ${primaryLastName}`;

  if (existingUser) {
    const session = await auth();
    const signedInAsInvitee = session?.user?.id === existingUser.id;

    if (!signedInAsInvitee) {
      const verify = await verifyPasswordForUser(email, parsed.data.password);
      if (!verify.ok) {
        if (verify.reason === "no_password") {
          return {
            ok: false,
            error:
              "This email already has an account. Sign in (Google or email), then open this invite link again to add the role.",
          };
        }
        return {
          ok: false,
          error:
            "Use the password for your existing account to accept this invite.",
        };
      }
    }

    const [hasRole] = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, existingUser.id),
          eq(userRoles.role, invite.role),
        ),
      )
      .limit(1);
    if (hasRole) {
      await markInviteAccepted(invite.id);
      return {
        ok: true,
        message:
          "You already have this role. Sign in to open your dashboard.",
      };
    }

    await db
      .update(users)
      .set({
        primaryFirstName,
        primaryLastName,
        name: fullName,
        legalName: String(meta.legalName ?? ""),
        phone: String(meta.phone ?? ""),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    await fulfillStaffInvite({
      userId: existingUser.id,
      invite,
      email,
      fullName,
      addedRoleOnly: true,
    });

    return {
      ok: true,
      message: signedInAsInvitee
        ? "Role added. Refresh the dashboard or sign in again to see new access."
        : "Role added to your existing account. Sign in to continue.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

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

  await fulfillStaffInvite({
    userId: created.id,
    invite,
    email,
    fullName,
    addedRoleOnly: false,
  });

  return {
    ok: true,
    message: "Account created. You can sign in now.",
  };
}
