"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Button from "@mui/material/Button";
import {
  acceptStaffInviteInApp,
} from "@/server/actions/invitations";
import { ROLE_HOME, ROLE_LABELS } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";

export function AcceptStaffInvitePanel({
  inviteId,
  role,
  email,
}: {
  inviteId: string;
  role: AppRole;
  email: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAccept() {
    setLoading(true);
    setError(null);
    const result = await acceptStaffInviteInApp(inviteId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
    router.refresh();
    setTimeout(() => {
      router.push(ROLE_HOME[result.role]);
    }, 800);
  }

  const label = ROLE_LABELS[role];

  return (
    <div className="dash-card mx-auto max-w-lg space-y-4 p-6">
      <h1 className="dash-page-title text-xl">Staff invitation</h1>
      <p className="text-sm text-[var(--dash-muted)]">
        You were invited to join Native Speak as <strong>{label}</strong> (
        {email}).
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="text-sm text-green-800">{message}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => void onAccept()}
          >
            {loading ? "…" : `Accept ${label} role`}
          </Button>
          <Button component={Link} href="/dashboard" color="inherit">
            Later
          </Button>
        </div>
      )}
    </div>
  );
}
