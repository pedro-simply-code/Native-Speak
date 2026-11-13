"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import {
  listPendingChangeRequests,
  reviewAppointmentChange,
} from "@/server/actions/appointment-changes";

type Row = Awaited<ReturnType<typeof listPendingChangeRequests>>[number];

export function ScheduleRequestsPanel({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function review(id: string, approve: boolean) {
    setLoadingId(id);
    const res = await reviewAppointmentChange({
      changeRequestId: id,
      approve,
    });
    setLoadingId(null);
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.request.id !== id));
      setMsg(approve ? "Approved." : "Denied.");
    } else {
      setMsg(res.error);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="dash-card p-5 text-sm text-[var(--dash-muted)]">
        No pending cancel or reschedule requests.
      </div>
    );
  }

  return (
    <>
      {msg ? <p className="mb-3 text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.request.id} className="dash-card p-4 text-sm">
            <p className="font-semibold">
              {row.request.requestType.toUpperCase()} ·{" "}
              {row.startsAt.toLocaleString()}
            </p>
            <p className="text-[var(--dash-muted)]">
              Reason: {row.request.reasonCode}
              {row.request.reasonText ? ` — ${row.request.reasonText}` : ""}
            </p>
            <p>Penalty credits: {row.request.penaltyCredits}</p>
            {row.request.proposedStartsAt ? (
              <p>Proposed: {row.request.proposedStartsAt.toLocaleString()}</p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Button
                size="small"
                variant="contained"
                disabled={loadingId === row.request.id}
                onClick={() => void review(row.request.id, true)}
              >
                Approve
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                disabled={loadingId === row.request.id}
                onClick={() => void review(row.request.id, false)}
              >
                Deny
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
