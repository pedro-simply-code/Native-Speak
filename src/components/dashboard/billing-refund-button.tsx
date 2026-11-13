"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { requestPaymentRefund } from "@/server/actions/refunds";

export function BillingRefundButton({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (!open) {
    return (
      <Button size="small" variant="text" onClick={() => setOpen(true)}>
        Request refund
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        className="rounded border px-2 py-1 text-xs"
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Button
        size="small"
        variant="outlined"
        onClick={async () => {
          const res = await requestPaymentRefund({ paymentId, reason });
          setMsg(res.ok ? "Refund requested." : res.error);
          if (res.ok) setOpen(false);
        }}
      >
        Submit
      </Button>
      {msg ? <span className="text-xs">{msg}</span> : null}
    </div>
  );
}
