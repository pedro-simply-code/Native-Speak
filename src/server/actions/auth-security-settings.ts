"use server";

import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { z } from "zod";
import { auth } from "@/auth";
import { recordSecurityAudit } from "@/lib/security/audit";
import { verifyPasswordForUser } from "@/lib/security/credentials";
import {
  createTotpSecret,
  openTotpSecret,
  sealTotpSecret,
  totpUri,
  verifyTotpCode,
} from "@/lib/security/totp";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb } from "@/server/db";
import { users } from "@/server/db/schema";

async function requireSessionUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getSecuritySettings() {
  const userId = await requireSessionUserId();
  const db = requireDb();
  const [user] = await db
    .select({
      twoFactorEnabled: users.twoFactorEnabled,
      twoFactorMethod: users.twoFactorMethod,
      hasPassword: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return {
    twoFactorEnabled: user?.twoFactorEnabled ?? false,
    twoFactorMethod: user?.twoFactorMethod ?? null,
    hasPassword: Boolean(user?.hasPassword),
  };
}

export async function enableEmailTwoFactor(password: string) {
  const userId = await requireSessionUserId();
  const ip = await getClientIp();
  const db = requireDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.email) return { ok: false as const, error: "User not found." };

  const check = await verifyPasswordForUser(user.email, password);
  if (!check.ok) {
    return { ok: false as const, error: "Incorrect password." };
  }

  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorMethod: "email",
      totpSecretEnc: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await recordSecurityAudit("auth.2fa_enabled", {
    actorUserId: userId,
    meta: { method: "email" },
    ip,
  });

  return { ok: true as const };
}

export async function beginTotpSetup(password: string) {
  const userId = await requireSessionUserId();
  const ip = await getClientIp();
  const limit = await enforceRateLimit(userId, {
    bucket: "auth-totp-setup",
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false as const, error: "Too many setup attempts." };
  }

  const db = requireDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.email) return { ok: false as const, error: "User not found." };

  const check = await verifyPasswordForUser(user.email, password);
  if (!check.ok) {
    return { ok: false as const, error: "Incorrect password." };
  }

  const secret = createTotpSecret();
  const uri = totpUri(secret, user.email);
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 });

  await db
    .update(users)
    .set({
      totpSecretEnc: sealTotpSecret(secret),
      twoFactorEnabled: false,
      twoFactorMethod: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await recordSecurityAudit("auth.totp_setup_started", { actorUserId: userId, ip });

  return { ok: true as const, qrDataUrl, secret };
}

export async function confirmTotpSetup(code: string) {
  const userId = await requireSessionUserId();
  const ip = await getClientIp();
  const db = requireDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return { ok: false as const, error: "User not found." };

  const secret = openTotpSecret(user.totpSecretEnc);
  if (!secret || !verifyTotpCode(secret, code.replace(/\s/g, ""))) {
    return { ok: false as const, error: "Invalid code from authenticator." };
  }

  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorMethod: "totp",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await recordSecurityAudit("auth.2fa_enabled", {
    actorUserId: userId,
    meta: { method: "totp" },
    ip,
  });

  return { ok: true as const };
}

export async function disableTwoFactor(password: string) {
  const userId = await requireSessionUserId();
  const ip = await getClientIp();
  const db = requireDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.email) return { ok: false as const, error: "User not found." };

  const check = await verifyPasswordForUser(user.email, password);
  if (!check.ok) {
    return { ok: false as const, error: "Incorrect password." };
  }

  await db
    .update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorMethod: null,
      totpSecretEnc: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await recordSecurityAudit("auth.2fa_disabled", { actorUserId: userId, ip });
  return { ok: true as const };
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const userId = await requireSessionUserId();
  const ip = await getClientIp();
  const parsed = z
    .object({
      currentPassword: z.string().min(8).max(128),
      newPassword: z.string().min(8).max(128),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }

  const db = requireDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.email) return { ok: false as const, error: "User not found." };

  const check = await verifyPasswordForUser(user.email, parsed.data.currentPassword);
  if (!check.ok) {
    return { ok: false as const, error: "Current password is incorrect." };
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await recordSecurityAudit("auth.password_changed", { actorUserId: userId, ip });
  return { ok: true as const };
}
