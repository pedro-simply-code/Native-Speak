"use server";

import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";
import { canInviteRole, hasPermission } from "@/lib/auth/permissions";
import { sendInviteEmail } from "@/lib/email/send";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb, requireDbAtRequest } from "@/server/db";
import { auditLogs, invitations } from "@/server/db/schema";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["manager", "teacher", "family"]),
  primaryFirstName: z.string().min(1).max(80),
  primaryLastName: z.string().min(1).max(80),
  legalName: z.string().min(1).max(160),
  phone: z.string().max(40).optional(),
  bio: z.string().max(2000).optional(),
  timezone: z.string().max(80).optional(),
  staffStatus: z.enum(["invited", "active", "inactive"]).optional(),
  teachingAgeGroups: z.array(z.string()).optional(),
  nativeLanguage: z.string().max(40).optional(),
  secondaryLanguages: z.array(z.string()).optional(),
});

export type InviteState =
  | { ok: true; inviteUrl: string }
  | { ok: false; error: string };

export async function sendStaffInvite(
  raw: z.infer<typeof inviteSchema>,
): Promise<InviteState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized." };
  }

  const roles = session.user.roles ?? [];
  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid invite data." };

  const target = parsed.data.role as AppRole;
  if (!canInviteRole(roles, target)) {
    return { ok: false, error: "You cannot invite this role." };
  }

  if (target === "manager" && !hasPermission(roles, "managers.invite")) {
    return { ok: false, error: "Missing permission." };
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(`${session.user.id}:${ip}`, {
    bucket: "invite-send",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Invite rate limit exceeded." };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

  const profileMeta: Record<string, unknown> = {
    primaryFirstName: parsed.data.primaryFirstName,
    primaryLastName: parsed.data.primaryLastName,
    legalName: parsed.data.legalName,
    phone: parsed.data.phone ?? "",
  };

  if (target === "teacher") {
    Object.assign(profileMeta, {
      bio: parsed.data.bio ?? "",
      timezone: parsed.data.timezone ?? "America/Chicago",
      staffStatus: parsed.data.staffStatus ?? "invited",
      teachingAgeGroups: parsed.data.teachingAgeGroups ?? [],
      nativeLanguage: parsed.data.nativeLanguage ?? "Spanish",
      secondaryLanguages: parsed.data.secondaryLanguages ?? ["English"],
    });
  }

  const db = requireDb();
  await db.insert(invitations).values({
    email: parsed.data.email.toLowerCase(),
    role: target,
    tokenHash,
    invitedBy: session.user.id,
    expiresAt,
    profileMeta,
  });

  await db.insert(auditLogs).values({
    actorUserId: session.user.id,
    action: "invite.sent",
    target: parsed.data.email,
    meta: { role: target },
    ip,
  });

  const invitePath = `/register/invite?token=${rawToken}&email=${encodeURIComponent(parsed.data.email)}`;
  await sendInviteEmail(parsed.data.email, target, invitePath);

  return { ok: true, inviteUrl: invitePath };
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
