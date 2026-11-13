"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import type { getSchedulingPolicyAdmin } from "@/server/actions/scheduling-policy-admin";
import { updateSchedulingPolicy } from "@/server/actions/scheduling-policy-admin";

export function SchedulingPolicyForm({
  initial,
}: {
  initial: NonNullable<Awaited<ReturnType<typeof getSchedulingPolicyAdmin>>>;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="dash-card max-w-xl space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const f = new FormData(e.currentTarget);
        const res = await updateSchedulingPolicy({
          freeCancelHours: Number(f.get("freeCancelHours")),
          lateCancelPenaltyCredits: Number(f.get("lateCancelPenaltyCredits")),
          freeRescheduleHours: Number(f.get("freeRescheduleHours")),
          lateReschedulePenaltyCredits: Number(f.get("lateReschedulePenaltyCredits")),
          freeReschedulesPerMonth: Number(f.get("freeReschedulesPerMonth")),
        });
        setLoading(false);
        setMsg(res.ok ? "Policy saved." : res.error);
      }}
    >
      <h2 className="text-sm font-bold">Scheduling policy</h2>
      <label className="block text-sm">
        Free cancel window (hours)
        <input
          name="freeCancelHours"
          type="number"
          defaultValue={initial.freeCancelHours}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>
      <label className="block text-sm">
        Late cancel penalty (credits)
        <input
          name="lateCancelPenaltyCredits"
          type="number"
          defaultValue={initial.lateCancelPenaltyCredits}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>
      <label className="block text-sm">
        Free reschedule window (hours)
        <input
          name="freeRescheduleHours"
          type="number"
          defaultValue={initial.freeRescheduleHours}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>
      <label className="block text-sm">
        Late reschedule penalty (credits)
        <input
          name="lateReschedulePenaltyCredits"
          type="number"
          defaultValue={initial.lateReschedulePenaltyCredits}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>
      <label className="block text-sm">
        Free reschedules per month
        <input
          name="freeReschedulesPerMonth"
          type="number"
          defaultValue={initial.freeReschedulesPerMonth}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>
      <Button type="submit" variant="contained" disabled={loading}>
        Save policy
      </Button>
      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
    </form>
  );
}
