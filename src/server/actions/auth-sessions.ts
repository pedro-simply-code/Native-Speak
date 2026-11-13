"use server";

import { auth, signOut } from "@/auth";
import { recordSecurityAudit } from "@/lib/security/audit";
import {
  listActiveSessionsForUser,
  revokeAllSessions,
  revokeOtherSessions,
  revokeSession,
  sessionLabel,
} from "@/lib/security/sessions";
import { getClientIp } from "@/lib/security/rate-limit";

export async function getMyActiveSessions() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const rows = await listActiveSessionsForUser(
    session.user.id,
    session.user.sessionId,
  );

  return rows.map((row) => ({
    ...row,
    label: sessionLabel(row.userAgent, row.client),
    lastSeenAt: row.lastSeenAt?.toISOString() ?? row.createdAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function revokeMySession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const ip = await getClientIp();
  await revokeSession(session.user.id, sessionId);
  await recordSecurityAudit("auth.session_revoked", {
    actorUserId: session.user.id,
    meta: { sessionId },
    ip,
  });

  if (sessionId === session.user.sessionId) {
    await signOut({ redirectTo: "/login?error=session_revoked" });
  }

  return { ok: true as const };
}

export async function revokeAllMySessions() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const ip = await getClientIp();
  if (!session.user.sessionId) {
    return { ok: false as const, error: "Current session not tracked yet. Sign in again." };
  }
  await revokeOtherSessions(session.user.id, session.user.sessionId);
  await recordSecurityAudit("auth.sessions_revoked_others", {
    actorUserId: session.user.id,
    ip,
  });

  return { ok: true as const };
}

export async function signOutEverywhere() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const ip = await getClientIp();
  await revokeAllSessions(session.user.id);
  await recordSecurityAudit("auth.sessions_revoked_all", {
    actorUserId: session.user.id,
    meta: { keptCurrent: false },
    ip,
  });

  await signOut({ redirectTo: "/login?signedOut=1" });
  return { ok: true as const };
}
