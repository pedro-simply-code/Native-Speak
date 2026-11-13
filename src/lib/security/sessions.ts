import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { getClientIp } from "@/lib/security/rate-limit";
import { requireDb } from "@/server/db";
import {
  apiRefreshTokens,
  authActiveSessions,
  users,
} from "@/server/db/schema";

export type ActiveSessionRow = {
  id: string;
  userAgent: string | null;
  ip: string | null;
  client: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  current: boolean;
};

export async function registerWebSession(userId: string) {
  const db = requireDb();
  const h = await headers();
  const userAgent = h.get("user-agent")?.slice(0, 512) ?? null;
  const ip = await getClientIp();
  const jti = nanoid(32);
  const sessionId = randomBytes(16).toString("hex");

  const [user] = await db
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  await db.insert(authActiveSessions).values({
    id: sessionId,
    userId,
    jti,
    userAgent,
    ip,
    client: "web",
    lastSeenAt: new Date(),
  });

  return {
    sessionId,
    jti,
    sessionVersion: user?.sessionVersion ?? 0,
  };
}

export async function registerApiSession(userId: string, ip: string) {
  const db = requireDb();
  const sessionId = randomBytes(16).toString("hex");
  const jti = nanoid(32);

  await db.insert(authActiveSessions).values({
    id: sessionId,
    userId,
    jti,
    ip,
    client: "api",
    lastSeenAt: new Date(),
  });

  const [user] = await db
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    sessionId,
    jti,
    sessionVersion: user?.sessionVersion ?? 0,
  };
}

export async function touchWebSession(sessionId: string | undefined) {
  if (!sessionId) return;
  try {
    const db = requireDb();
    await db
      .update(authActiveSessions)
      .set({ lastSeenAt: new Date() })
      .where(
        and(
          eq(authActiveSessions.id, sessionId),
          isNull(authActiveSessions.revokedAt),
        ),
      );
  } catch {
    /* noop */
  }
}

export async function isWebSessionValid(opts: {
  userId: string;
  sessionId: string | undefined;
  sessionVersion: number | undefined;
}): Promise<boolean> {
  if (!opts.sessionId) return true;

  const db = requireDb();
  const [user] = await db
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, opts.userId))
    .limit(1);

  if (!user) return false;
  if (
    opts.sessionVersion !== undefined &&
    opts.sessionVersion !== user.sessionVersion
  ) {
    return false;
  }

  const [row] = await db
    .select({ revokedAt: authActiveSessions.revokedAt })
    .from(authActiveSessions)
    .where(
      and(
        eq(authActiveSessions.id, opts.sessionId),
        eq(authActiveSessions.userId, opts.userId),
      ),
    )
    .limit(1);

  if (row?.revokedAt) return false;
  if (!row) {
    await db
      .insert(authActiveSessions)
      .values({
        id: opts.sessionId,
        userId: opts.userId,
        jti: nanoid(32),
        client: "web",
        lastSeenAt: new Date(),
      })
      .onConflictDoNothing();
    return true;
  }
  return true;
}

export async function listActiveSessionsForUser(
  userId: string,
  currentSessionId?: string,
): Promise<ActiveSessionRow[]> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(authActiveSessions)
    .where(
      and(
        eq(authActiveSessions.userId, userId),
        isNull(authActiveSessions.revokedAt),
      ),
    )
    .orderBy(desc(authActiveSessions.lastSeenAt));

  return rows.map((row) => ({
    id: row.id,
    userAgent: row.userAgent,
    ip: row.ip,
    client: row.client,
    lastSeenAt: row.lastSeenAt,
    createdAt: row.createdAt,
    current: row.id === currentSessionId,
  }));
}

export async function revokeSession(userId: string, sessionId: string) {
  const db = requireDb();
  await db
    .update(authActiveSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(authActiveSessions.id, sessionId),
        eq(authActiveSessions.userId, userId),
        isNull(authActiveSessions.revokedAt),
      ),
    );
}

/** Signs out other browsers/devices; keeps the current web session. */
export async function revokeOtherSessions(userId: string, keepSessionId: string) {
  const db = requireDb();
  const now = new Date();
  await db
    .update(authActiveSessions)
    .set({ revokedAt: now })
    .where(
      and(
        eq(authActiveSessions.userId, userId),
        isNull(authActiveSessions.revokedAt),
        ne(authActiveSessions.id, keepSessionId),
      ),
    );
}

/** Invalidates every session (web + API refresh tokens). */
export async function revokeAllSessions(userId: string) {
  const db = requireDb();
  const now = new Date();

  await db
    .update(users)
    .set({
      sessionVersion: sql`${users.sessionVersion} + 1`,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  await db
    .update(authActiveSessions)
    .set({ revokedAt: now })
    .where(
      and(
        eq(authActiveSessions.userId, userId),
        isNull(authActiveSessions.revokedAt),
      ),
    );

  await db
    .update(apiRefreshTokens)
    .set({ revokedAt: now })
    .where(
      and(
        eq(apiRefreshTokens.userId, userId),
        isNull(apiRefreshTokens.revokedAt),
      ),
    );
}

export function sessionLabel(userAgent: string | null, client: string) {
  if (client === "api") return "Mobile / API";
  if (!userAgent) return "Web browser";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile browser";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/edg/i.test(userAgent)) return "Edge";
  return "Web browser";
}

export function hashApiChallengeToken(raw: string) {
  return createHash("sha256").update(`api-2fa:${raw}`).digest("hex");
}
