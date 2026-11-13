"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { requireDb, requireDbAtRequest } from "@/server/db";
import { schedulingPolicies } from "@/server/db/schema";

const updateSchema = z.object({
  freeCancelHours: z.coerce.number().int().min(1).max(168),
  lateCancelPenaltyCredits: z.coerce.number().int().min(0).max(10),
  freeRescheduleHours: z.coerce.number().int().min(1).max(168),
  lateReschedulePenaltyCredits: z.coerce.number().int().min(0).max(10),
  freeReschedulesPerMonth: z.coerce.number().int().min(0).max(20),
});

export async function getSchedulingPolicyAdmin() {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select()
    .from(schedulingPolicies)
    .where(eq(schedulingPolicies.id, "default"))
    .limit(1);
  return row ?? null;
}

export async function updateSchedulingPolicy(
  input: z.infer<typeof updateSchema>,
) {
  const session = await auth();
  if (!session?.user?.roles?.includes("admin")) {
    return { ok: false as const, error: "Forbidden." };
  }
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid policy." };

  const db = requireDb();
  await db
    .insert(schedulingPolicies)
    .values({ id: "default", ...parsed.data })
    .onConflictDoUpdate({
      target: schedulingPolicies.id,
      set: { ...parsed.data, updatedAt: new Date() },
    });

  return { ok: true as const };
}
