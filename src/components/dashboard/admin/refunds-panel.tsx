"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import type { listPaymentRefundsAdmin } from "@/server/actions/refunds";
import { reviewPaymentRefund } from "@/server/actions/refunds";

type Row = Awaited<ReturnType<typeof listPaymentRefundsAdmin>>[number];

export function RefundsAdminPanel({ rows }: { rows: Row[] }) {
  const [data, setData] = useState(rows);
  const [msg, setMsg] = useState<string | null>(null);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="dash-card mt-8 overflow-x-auto p-4">
      <h2 className="mb-3 text-sm font-bold">Refund requests</h2>
      {msg ? <p className="mb-2 text-sm">{msg}</p> : null}
      <table className="dash-table">
        <thead>
          <tr>
            <th>Payment</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Reason</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.refund.id}>
              <td className="font-mono text-xs">{row.refund.paymentId.slice(0, 8)}…</td>
              <td>${(row.refund.amountCents / 100).toFixed(2)}</td>
              <td>{row.refund.status}</td>
              <td className="max-w-xs truncate">{row.refund.reason}</td>
              <td>
                {row.refund.status === "pending" ? (
                  <RefundActions refundId={row.refund.id} onDone={setMsg} setData={setData} />
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RefundActions({
  refundId,
  onDone,
  setData,
}: {
  refundId: string;
  onDone: (m: string) => void;
  setData: Dispatch<SetStateAction<Row[]>>;
}) {
  return (
    <div className="flex gap-1">
      <Button
        size="small"
        variant="outlined"
        onClick={async () => {
          const res = await reviewPaymentRefund({ refundId, approve: true });
          onDone(res.ok ? "Refund approved." : res.error ?? "Error");
          if (res.ok) {
            setData((prev) =>
              prev.map((r) =>
                r.refund.id === refundId
                  ? { ...r, refund: { ...r.refund, status: "succeeded" as const } }
                  : r,
              ),
            );
          }
        }}
      >
        Approve
      </Button>
      <Button
        size="small"
        color="error"
        onClick={async () => {
          const res = await reviewPaymentRefund({ refundId, approve: false });
          onDone(res.ok ? "Refund denied." : res.error ?? "Error");
          if (res.ok) {
            setData((prev) =>
              prev.filter((r) => r.refund.id !== refundId),
            );
          }
        }}
      >
        Deny
      </Button>
    </div>
  );
}
