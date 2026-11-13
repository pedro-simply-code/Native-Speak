"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import {
  getMyActiveSessions,
  revokeAllMySessions,
  revokeMySession,
  signOutEverywhere,
} from "@/server/actions/auth-sessions";
import { DashboardConfirmDialog } from "@/components/dashboard/modernize/dashboard-confirm-dialog";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

type SessionRow = Awaited<ReturnType<typeof getMyActiveSessions>>[number];

type ConfirmKind = "session" | "others" | "everywhere";

export function ActiveSessionsPanel() {
  const { t } = useDashboardI18n();
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind;
    sessionId?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getMyActiveSessions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const sessions = await getMyActiveSessions();
        if (!cancelled) setRows(sessions);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function runConfirm() {
    if (!confirm) return;
    setBusy(true);
    setError(null);
    try {
      if (confirm.kind === "session" && confirm.sessionId) {
        const res = await revokeMySession(confirm.sessionId);
        if (!res.ok) setError(res.error);
        else setMessage("Session ended.");
      } else if (confirm.kind === "others") {
        const res = await revokeAllMySessions();
        if (!res.ok) setError(res.error);
        else setMessage("Signed out on other devices.");
      } else if (confirm.kind === "everywhere") {
        const res = await signOutEverywhere();
        if (!res.ok) setError(res.error);
        return;
      }
      await reload();
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  const confirmTitle =
    confirm?.kind === "session"
      ? t("modal.signOutSessionTitle")
      : confirm?.kind === "others"
        ? t("modal.signOutOthersTitle")
        : confirm?.kind === "everywhere"
          ? t("modal.signOutEverywhereTitle")
          : "";

  const confirmBody =
    confirm?.kind === "others"
      ? t("modal.signOutOthersBody")
      : confirm?.kind === "everywhere"
        ? t("modal.signOutEverywhereBody")
        : undefined;

  return (
    <>
      <section className="dash-card p-6">
        <h2 className="text-lg font-semibold text-[var(--dash-text)]">
          Active sessions
        </h2>
        <p className="mt-2 text-sm text-[var(--dash-muted)]">
          Web browsers and mobile API tokens appear here. Revoke anything you
          don&apos;t recognize.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-[var(--dash-muted)]">Loading…</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.length === 0 ? (
              <li className="text-sm text-[var(--dash-muted)]">
                No active sessions recorded yet. Sign in again to register this
                device.
              </li>
            ) : (
              rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--dash-border)] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--dash-text)]">
                      {row.label}
                      {row.current ? (
                        <span className="ml-2 text-xs font-normal text-green-700">
                          This device
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-[var(--dash-muted)]">
                      Last active{" "}
                      {new Date(row.lastSeenAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {row.ip ? ` · ${row.ip}` : ""}
                    </p>
                  </div>
                  {!row.current ? (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() =>
                        setConfirm({ kind: "session", sessionId: row.id })
                      }
                    >
                      Sign out
                    </Button>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outlined"
            size="small"
            disabled={loading || rows.length < 2}
            sx={{ textTransform: "none" }}
            onClick={() => setConfirm({ kind: "others" })}
          >
            Sign out other devices
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={loading}
            sx={{ textTransform: "none" }}
            onClick={() => setConfirm({ kind: "everywhere" })}
          >
            Sign out everywhere
          </Button>
        </div>

        {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </section>

      <DashboardConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        title={confirmTitle}
        description={confirmBody}
        danger={confirm?.kind === "everywhere"}
        loading={busy}
        confirmLabel={t("modal.confirm")}
      />
    </>
  );
}
