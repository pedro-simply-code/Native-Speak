import { and, eq, gt, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { hashOpaqueToken } from "@/lib/security/crypto";
import { requireDb } from "@/server/db";
import { authLoginProofs } from "@/server/db/schema";

const PROOF_TTL_MS = 60 * 1000;

export async function createLoginProof(userId: string) {
  const raw = nanoid(48);
  const tokenHash = hashOpaqueToken(raw);
  const expiresAt = new Date(Date.now() + PROOF_TTL_MS);
  const db = requireDb();
  await db.insert(authLoginProofs).values({
    userId,
    tokenHash,
    expiresAt,
  });
  return raw;
}

export async function consumeLoginProof(raw: string): Promise<string | null> {
  const tokenHash = hashOpaqueToken(raw);
  const db = requireDb();
  const now = new Date();

  const [row] = await db
    .select()
    .from(authLoginProofs)
    .where(
      and(
        eq(authLoginProofs.tokenHash, tokenHash),
        gt(authLoginProofs.expiresAt, now),
        isNull(authLoginProofs.usedAt),
      ),
    )
    .limit(1);

  if (!row) return null;

  await db
    .update(authLoginProofs)
    .set({ usedAt: now })
    .where(eq(authLoginProofs.id, row.id));

  return row.userId;
}
