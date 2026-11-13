import { and, eq } from "drizzle-orm";
import type { AppRole } from "@/lib/auth/roles";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import { requireDb } from "@/server/db";
import {
  invitations,
  teacherProfiles,
  userRoles,
} from "@/server/db/schema";
import { notifyRoles, notifyUser } from "@/server/notifications/service";

export type StaffInviteRow = typeof invitations.$inferSelect;

export function splitFullName(fullName: string) {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const primaryFirstName = parts[0] ?? trimmed;
  const primaryLastName =
    parts.length > 1 ? parts.slice(1).join(" ") : primaryFirstName;
  return {
    primaryFirstName,
    primaryLastName,
    legalName: trimmed,
  };
}

export function profileMetaFromFullName(
  fullName: string,
  role: AppRole,
): Record<string, unknown> {
  const names = splitFullName(fullName);
  const base: Record<string, unknown> = { ...names, phone: "" };
  if (role === "teacher") {
    Object.assign(base, {
      bio: "",
      timezone: "America/Chicago",
      staffStatus: "invited",
      teachingAgeGroups: [] as string[],
      nativeLanguage: "Spanish",
      secondaryLanguages: ["English"],
    });
  }
  return base;
}

export async function applyTeacherProfileFromInvite(
  userId: string,
  meta: Record<string, unknown>,
) {
  const db = requireDb();
  const values = {
    userId,
    bio: String(meta.bio ?? ""),
    timezone: String(meta.timezone ?? "America/Chicago"),
    status:
      (meta.staffStatus as "invited" | "active" | "inactive") ?? "invited",
    teachingAgeGroups: (meta.teachingAgeGroups as string[]) ?? [],
    nativeLanguage: String(meta.nativeLanguage ?? "Spanish"),
    secondaryLanguages: (meta.secondaryLanguages as string[]) ?? ["English"],
  };

  const [existing] = await db
    .select({ userId: teacherProfiles.userId })
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(teacherProfiles)
      .set(values)
      .where(eq(teacherProfiles.userId, userId));
  } else {
    await db.insert(teacherProfiles).values(values);
  }
}

export async function assignRoleFromInvite(
  userId: string,
  invite: StaffInviteRow,
  meta: Record<string, unknown>,
) {
  const db = requireDb();
  const role = invite.role as AppRole;

  await db
    .insert(userRoles)
    .values({
      userId,
      role,
      assignedBy: invite.invitedBy,
    })
    .onConflictDoNothing({
      target: [userRoles.userId, userRoles.role],
    });

  if (role === "teacher") {
    await applyTeacherProfileFromInvite(userId, meta);
  }
}

export async function markInviteAccepted(inviteId: string) {
  const db = requireDb();
  await db
    .update(invitations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(invitations.id, inviteId));
}

export async function revokePendingStaffInvites(
  email: string,
  role: AppRole,
) {
  const db = requireDb();
  await db
    .update(invitations)
    .set({ status: "revoked" })
    .where(
      and(
        eq(invitations.email, email.toLowerCase()),
        eq(invitations.role, role),
        eq(invitations.status, "pending"),
      ),
    );
}

export async function notifyInviteAccepted(opts: {
  userId: string;
  invite: StaffInviteRow;
  email: string;
  fullName: string;
  addedRoleOnly: boolean;
}) {
  const { userId, invite, email, fullName, addedRoleOnly } = opts;
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
      title: addedRoleOnly
        ? `${fullName} accepted a ${roleLabel} invite`
        : `New ${roleLabel} joined`,
      body: addedRoleOnly
        ? `${fullName} (${email}) added the ${roleLabel} role on their existing account.`
        : `${fullName} accepted an invite and is now active.`,
      href,
      meta: {
        userId,
        role: invite.role,
        email,
        name: fullName,
      },
    },
    { exceptUserId: userId },
  );

  if (invite.invitedBy) {
    await notifyUser(invite.invitedBy, {
      kind: "invite.accepted",
      title: "Invite accepted",
      body: addedRoleOnly
        ? `${fullName} added the ${roleLabel} role to their account.`
        : `${fullName} joined as ${roleLabel}.`,
      href,
      meta: { userId, role: invite.role, name: fullName },
    });
  }
}

export async function fulfillStaffInvite(opts: {
  userId: string;
  invite: StaffInviteRow;
  email: string;
  fullName: string;
  addedRoleOnly: boolean;
}) {
  const { userId, invite, email, fullName, addedRoleOnly } = opts;
  const meta = invite.profileMeta ?? {};
  await assignRoleFromInvite(userId, invite, meta);
  await markInviteAccepted(invite.id);
  await notifyInviteAccepted({
    userId,
    invite,
    email,
    fullName,
    addedRoleOnly,
  });
}
