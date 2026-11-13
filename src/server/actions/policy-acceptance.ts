"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { requireDb, requireDbAtRequest } from "@/server/db";
import {
  PRIVACY_POLICY_KEY,
  PRIVACY_POLICY_VERSION,
  SCHEDULING_POLICY_KEY,
  SCHEDULING_POLICY_VERSION,
} from "@/lib/policy/keys";
import { userPolicyAcceptances } from "@/server/db/schema";

export async function hasAcceptedFamilyPrivacyPolicy(userId: string) {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select({ id: userPolicyAcceptances.id })
    .from(userPolicyAcceptances)
    .where(
      and(
        eq(userPolicyAcceptances.userId, userId),
        eq(userPolicyAcceptances.policyKey, PRIVACY_POLICY_KEY),
        eq(userPolicyAcceptances.policyVersion, PRIVACY_POLICY_VERSION),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function hasAcceptedSchedulingPolicy(userId: string) {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select({ id: userPolicyAcceptances.id })
    .from(userPolicyAcceptances)
    .where(
      and(
        eq(userPolicyAcceptances.userId, userId),
        eq(userPolicyAcceptances.policyKey, SCHEDULING_POLICY_KEY),
        eq(userPolicyAcceptances.policyVersion, SCHEDULING_POLICY_VERSION),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function acceptSchedulingPolicy() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const db = requireDb();
  await db
    .insert(userPolicyAcceptances)
    .values({
      userId: session.user.id,
      policyKey: SCHEDULING_POLICY_KEY,
      policyVersion: SCHEDULING_POLICY_VERSION,
    })
    .onConflictDoNothing();

  return { ok: true as const };
}

export async function acceptFamilyPrivacyPolicy() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const db = requireDb();
  await db
    .insert(userPolicyAcceptances)
    .values({
      userId: session.user.id,
      policyKey: PRIVACY_POLICY_KEY,
      policyVersion: PRIVACY_POLICY_VERSION,
    })
    .onConflictDoNothing();

  return { ok: true as const };
}
