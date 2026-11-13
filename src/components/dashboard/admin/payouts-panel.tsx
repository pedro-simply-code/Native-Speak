"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import type { listTeacherPayoutsForAdmin } from "@/server/actions/payouts";
import { markTeacherPayoutPaid } from "@/server/actions/payouts";

type Row = Awaited<ReturnType<typeof listTeacherPayoutsForAdmin>>[number];

export function AdminPayoutsPanel({ rows }: { rows: Row[] }) {
  const [data, setData] = useState(rows);
  const [msg, setMsg] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="dash-card p-5 text-sm text-[var(--dash-muted)]">
        No teacher payouts yet. Payouts accrue when a lesson is marked taught.
      </div>
    );
  }

  return (
    <>
      {msg ? <p className="mb-3 text-sm">{msg}</p> : null}
      <MotionTable>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className="font-mono text-xs">{row.teacherUserId.slice(0, 8)}…</td>
                <td>${(row.amountCents / 100).toFixed(2)}</td>
                <td>{row.status}</td>
                <td>{row.createdAt.toLocaleDateString()}</td>
                <td>
                  {row.status === "pending" ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        const res = await markTeacherPayoutPaid({ payoutId: row.id });
                        if (res.ok) {
                          setData((prev) =>
                            prev.map((p) =>
                              p.id === row.id ? { ...p, status: "paid" as const } : p,
                            ),
                          );
                          setMsg("Marked paid.");
                        } else {
                          setMsg(res.error);
                        }
                      }}
                    >
                      Mark paid
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MotionTable>
    </>
  );
}

function MotionTable({ children }: { children: ReactNode }) {
  return <div className="dash-card overflow-x-auto p-2">{children}</div>;
}
