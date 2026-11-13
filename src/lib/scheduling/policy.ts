import { eq } from "drizzle-orm";
import type { AppRole } from "@/lib/auth/roles";
import { requireDb } from "@/server/db";
import { schedulingPolicies } from "@/server/db/schema";

export type ChangeReason =
  | "schedule_conflict"
  | "illness"
  | "emergency"
  | "travel"
  | "teacher_unavailable"
  | "system_error"
  | "other";

export const REASONS_REQUIRING_APPROVAL: ChangeReason[] = [
  "emergency",
  "other",
  "system_error",
];

export type PolicySnapshot = {
  freeCancelHours: number;
  lateCancelPenaltyCredits: number;
  freeRescheduleHours: number;
  lateReschedulePenaltyCredits: number;
  freeReschedulesPerMonth: number;
};

const DEFAULT_POLICY: PolicySnapshot = {
  freeCancelHours: 24,
  lateCancelPenaltyCredits: 1,
  freeRescheduleHours: 24,
  lateReschedulePenaltyCredits: 1,
  freeReschedulesPerMonth: 2,
};

export async function getSchedulingPolicy(): Promise<PolicySnapshot> {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(schedulingPolicies)
    .where(eq(schedulingPolicies.id, "default"))
    .limit(1);
  if (!row) return DEFAULT_POLICY;
  return {
    freeCancelHours: row.freeCancelHours,
    lateCancelPenaltyCredits: row.lateCancelPenaltyCredits,
    freeRescheduleHours: row.freeRescheduleHours,
    lateReschedulePenaltyCredits: row.lateReschedulePenaltyCredits,
    freeReschedulesPerMonth: row.freeReschedulesPerMonth,
  };
}

export function hoursUntilStart(startsAt: Date) {
  return (startsAt.getTime() - Date.now()) / (60 * 60 * 1000);
}

export type PolicyDecision = {
  autoApprove: boolean;
  penaltyCredits: number;
  requiresManager: boolean;
};

export function evaluateCancelPolicy(input: {
  policy: PolicySnapshot;
  startsAt: Date;
  reasonCode: ChangeReason;
  requestedByRole: AppRole;
}): PolicyDecision {
  if (input.requestedByRole === "teacher" || input.requestedByRole === "admin") {
    return { autoApprove: true, penaltyCredits: 0, requiresManager: false };
  }

  const hours = hoursUntilStart(input.startsAt);
  const late = hours < input.policy.freeCancelHours;
  const penalty = late ? input.policy.lateCancelPenaltyCredits : 0;
  const needsApproval = REASONS_REQUIRING_APPROVAL.includes(input.reasonCode);

  return {
    autoApprove: !needsApproval,
    penaltyCredits: penalty,
    requiresManager: needsApproval,
  };
}

export function evaluateReschedulePolicy(input: {
  policy: PolicySnapshot;
  startsAt: Date;
  reasonCode: ChangeReason;
  requestedByRole: AppRole;
  freeReschedulesUsed: number;
}): PolicyDecision {
  if (input.requestedByRole === "teacher" || input.requestedByRole === "admin") {
    return { autoApprove: true, penaltyCredits: 0, requiresManager: false };
  }

  const hours = hoursUntilStart(input.startsAt);
  const withinFreeMonth =
    input.freeReschedulesUsed < input.policy.freeReschedulesPerMonth;
  const late = hours < input.policy.freeRescheduleHours;

  let penalty = 0;
  if (late) penalty = input.policy.lateReschedulePenaltyCredits;
  else if (!withinFreeMonth) penalty = input.policy.lateReschedulePenaltyCredits;

  const needsApproval = REASONS_REQUIRING_APPROVAL.includes(input.reasonCode);

  return {
    autoApprove: !needsApproval,
    penaltyCredits: penalty,
    requiresManager: needsApproval,
  };
}
