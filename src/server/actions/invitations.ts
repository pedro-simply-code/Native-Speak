"use server";

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { canInviteRole, hasPermission } from "@/lib/auth/permissions";
import {
  fulfillStaffInvite,
  profileMetaFromFullName,
  revokePendingStaffInvites,
  splitFullName,
} from "@/lib/auth/staff-invite";
import { sendInviteEmail } from "@/lib/email/send";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb, requireDbAtRequest } from "@/server/db";
import { auditLogs, invitations, userRoles, users } from "@/server/db/schema";
import { notifyUser } from "@/server/notifications/service";

const roleSchema = z.enum(["manager", "teacher", "family"]);

const newUserInviteSchema = z.object({
  email: z.string().email(),
  role: roleSchema,
  fullName: z.string().min(1).max(160),
});

const existingUserInviteSchema = z.object({
  email: z.string().email(),
  role: roleSchema,
});

export type InviteLookupResult =
  | { ok: true; exists: false }
  | {
      ok: true;
      exists: true;
      userId: string;
      name: string | null;
      email: string;
      roles: AppRole[];
      hasTargetRole: boolean;
    }
  | { ok: false; error: string };

export type StaffInviteResult =
  | { ok: true; channel: "email" | "in_app" }
  | { ok: false; error: string };

async function assertCanInvite(role: AppRole) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized." };
  }

  const roles = session.user.roles ?? [];
  if (!canInviteRole(roles, role)) {
    return { ok: false as const, error: "You cannot invite this role." };
  }

  if (role === "manager" && !hasPermission(roles, "managers.invite")) {
    return { ok: false as const, error: "Missing permission." };
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(`${session.user.id}:${ip}`, {
    bucket: "invite-send",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false as const, error: "Invite rate limit exceeded." };
  }

  return { ok: true as const, session, ip };
}

export async function lookupInviteRecipient(
  email: string,
  role: AppRole,
): Promise<InviteLookupResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized." };
  }

  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email." };
  }

  if (!canInviteRole(session.user.roles ?? [], role)) {
    return { ok: false, error: "You cannot invite this role." };
  }

  const emailLower = parsed.data.toLowerCase();
  const db = requireDb();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, emailLower))
    .limit(1);

  if (!user) {
    return { ok: true, exists: false };
  }

  const roleRows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));

  const roles = roleRows.map((r) => r.role as AppRole);

  return {
    ok: true,
    exists: true,
    userId: user.id,
    name: user.name,
    email: user.email,
    roles,
    hasTargetRole: roles.includes(role),
  };
}

export async function sendStaffInviteToNewUser(
  raw: z.infer<typeof newUserInviteSchema>,
): Promise<StaffInviteResult> {
  const parsed = newUserInviteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid invite data." };
  }

  const target = parsed.data.role as AppRole;
  const gate = await assertCanInvite(target);
  if (!gate.ok) return gate;

  const db = requireDb();
  const emailLower = parsed.data.email.toLowerCase();

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, emailLower))
    .limit(1);
  if (existingUser) {
    return {
      ok: false,
      error: "This email already has an account. Use in-app role invitation instead.",
    };
  }

  await revokePendingStaffInvites(emailLower, target);

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);
  const profileMeta = profileMetaFromFullName(parsed.data.fullName, target);
  Object.assign(profileMeta, splitFullName(parsed.data.fullName));

  await db.insert(invitations).values({
    email: emailLower,
    role: target,
    tokenHash,
    invitedBy: gate.session.user.id,
    expiresAt,
    profileMeta,
  });

  await db.insert(auditLogs).values({
    actorUserId: gate.session.user.id,
    action: "invite.sent",
    target: emailLower,
    meta: { role: target, channel: "email" },
    ip: gate.ip,
  });

  const invitePath = `/register/invite?token=${rawToken}&email=${encodeURIComponent(parsed.data.email)}`;
  await sendInviteEmail(parsed.data.email, target, invitePath);

  return { ok: true, channel: "email" };
}

export async function sendStaffRoleInviteInApp(
  raw: z.infer<typeof existingUserInviteSchema>,
): Promise<StaffInviteResult> {
  const parsed = existingUserInviteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid invite data." };
  }

  const target = parsed.data.role as AppRole;
  const gate = await assertCanInvite(target);
  if (!gate.ok) return gate;

  const db = requireDb();
  const emailLower = parsed.data.email.toLowerCase();

  const [existingUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, emailLower))
    .limit(1);

  if (!existingUser) {
    return {
      ok: false,
      error: "No account found for this email. Send an email invite instead.",
    };
  }

  const [alreadyHasRole] = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, existingUser.id),
        eq(userRoles.role, target),
      ),
    )
    .limit(1);
  if (alreadyHasRole) {
    return {
      ok: false,
      error: `This user already has the ${ROLE_LABELS[target]} role.`,
    };
  }

  await revokePendingStaffInvites(emailLower, target);

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 60 * 24 * 14);

  const profileMeta: Record<string, unknown> = {
    ...(existingUser.name ? splitFullName(existingUser.name) : { primaryFirstName: "", primaryLastName: "", legalName: "" }),
    phone: "",
    channel: "in_app",
  };
  if (target === "teacher") {
    Object.assign(profileMeta, {
      bio: "",
      timezone: "America/Chicago",
      staffStatus: "invited",
      teachingAgeGroups: [] as string[],
      nativeLanguage: "Spanish",
      secondaryLanguages: ["English"],
    });
  }

  const [inviteRow] = await db
    .insert(invitations)
    .values({
      email: emailLower,
      role: target,
      tokenHash,
      invitedBy: gate.session.user.id,
      expiresAt,
      profileMeta,
    })
    .returning({ id: invitations.id });

  if (!inviteRow) {
    return { ok: false, error: "Could not create invitation." };
  }

  await db.insert(auditLogs).values({
    actorUserId: gate.session.user.id,
    action: "invite.sent",
    target: emailLower,
    meta: { role: target, channel: "in_app", inviteId: inviteRow.id },
    ip: gate.ip,
  });

  const roleLabel = ROLE_LABELS[target];
  await notifyUser(existingUser.id, {
    kind: "invite.staff_role",
    title: `${roleLabel} role invitation`,
    body: `You were invited to join as ${roleLabel}. Accept from your dashboard — no email link required.`,
    href: `/dashboard/accept-staff-invite?inviteId=${inviteRow.id}`,
    meta: {
      inviteId: inviteRow.id,
      role: target,
      inviterId: gate.session.user.id,
    },
  });

  return { ok: true, channel: "in_app" };
}

export async function getStaffInviteForAccept(inviteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Sign in to respond to this invitation." };
  }

  const db = await requireDbAtRequest();
  const [invite] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, inviteId))
    .limit(1);

  if (!invite || invite.status !== "pending") {
    return { ok: false as const, error: "This invitation is not available." };
  }

  if (invite.expiresAt < new Date()) {
    return { ok: false as const, error: "This invitation has expired." };
  }

  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      ok: false as const,
      error: "This invitation was sent to a different email address.",
    };
  }

  return {
    ok: true as const,
    invite: {
      id: invite.id,
      role: invite.role as AppRole,
      email: invite.email,
    },
    userName: user.name,
  };
}

export async function acceptStaffInviteInApp(inviteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Sign in to accept." };
  }

  const db = requireDb();
  const [invite] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.id, inviteId),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!invite) {
    return { ok: false as const, error: "Invitation invalid or expired." };
  }

  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return { ok: false as const, error: "This invitation is for another account." };
  }

  const [hasRole] = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, user.id),
        eq(userRoles.role, invite.role),
      ),
    )
    .limit(1);

  if (hasRole) {
    await db
      .update(invitations)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(invitations.id, invite.id));
    return {
      ok: true as const,
      message: "You already have this role.",
      role: invite.role as AppRole,
    };
  }

  const fullName = user.name ?? invite.email;

  await fulfillStaffInvite({
    userId: user.id,
    invite,
    email: user.email,
    fullName,
    addedRoleOnly: true,
  });

  return {
    ok: true as const,
    message: "Role added. Refresh or open your dashboard.",
    role: invite.role as AppRole,
  };
}

export async function listPendingInvitations() {
  const session = await auth();
  if (!session?.user?.id || !hasPermission(session.user.roles ?? [], "managers.invite")) {
    return [];
  }
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(invitations)
    .where(and(eq(invitations.status, "pending")));
}
