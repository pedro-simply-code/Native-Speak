import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { recordSecurityAudit } from "@/lib/security/audit";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";

export async function GET(req: Request) {
  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "auth-verify-email",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.redirect(new URL("/login?error=verify", req.url));
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email")?.toLowerCase();

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=verify", req.url));
  }

  const db = requireDb();
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, email))
    .limit(1);

  if (!row || row.token !== token || row.expires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=verify", req.url));
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(users.email, email));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, email));

  if (user) {
    await recordSecurityAudit("auth.email_verified", {
      actorUserId: user.id,
      target: email,
      ip,
    });
  }

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
