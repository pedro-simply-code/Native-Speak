"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { ActiveSessionsPanel } from "@/components/dashboard/settings/active-sessions-panel";
import { DashboardConfirmDialog } from "@/components/dashboard/modernize/dashboard-confirm-dialog";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import {
  beginTotpSetup,
  confirmTotpSetup,
  disableTwoFactor,
  enableEmailTwoFactor,
  type getSecuritySettings,
} from "@/server/actions/auth-security-settings";

type SecurityState = Awaited<ReturnType<typeof getSecuritySettings>>;

export function SecuritySettingsForm({ initial }: { initial: SecurityState }) {
  const { t } = useDashboardI18n();
  const [state, setState] = useState(initial);
  const [totpOpen, setTotpOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refreshState() {
    const { getSecuritySettings: load } = await import(
      "@/server/actions/auth-security-settings"
    );
    setState(await load());
  }

  async function onEnableEmail() {
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await enableEmailTwoFactor(password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("Email two-factor authentication is on.");
    setPassword("");
    setQr(null);
    await refreshState();
  }

  async function onBeginTotp() {
    setBusy(true);
    setError(null);
    const res = await beginTotpSetup(password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setQr(res.qrDataUrl);
    setTotpSecret(res.secret);
    setTotpOpen(true);
    setMessage("Scan the QR code, then enter a code to confirm.");
  }

  async function onConfirmTotp() {
    setBusy(true);
    setError(null);
    const res = await confirmTotpSetup(totpCode);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("Authenticator two-factor is enabled.");
    setTotpCode("");
    setQr(null);
    setTotpSecret(null);
    setTotpOpen(false);
    await refreshState();
  }

  async function onDisable() {
    setBusy(true);
    setError(null);
    const res = await disableTwoFactor(password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("Two-factor authentication disabled.");
    setPassword("");
    await refreshState();
  }

  return (
    <div className="space-y-8">
      <ActiveSessionsPanel />

      <section className="dash-card p-6">
        <h2 className="text-lg font-semibold text-[var(--dash-text)]">
          Two-factor authentication (2FA)
        </h2>
        <p className="mt-2 text-sm text-[var(--dash-muted)]">
          Required on password and email-code sign-in. Google sign-in skips 2FA
          (Google already verified the email).
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--dash-text)]">
          Status:{" "}
          {state.twoFactorEnabled
            ? `On (${state.twoFactorMethod === "totp" ? "Authenticator" : "Email"})`
            : "Off"}
        </p>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-semibold" htmlFor="sec-password">
            Current password
          </label>
          <input
            id="sec-password"
            type="password"
            autoComplete="current-password"
            className="w-full max-w-md rounded-lg border border-[var(--dash-border)] px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!state.hasPassword}
          />
          {!state.hasPassword ? (
            <p className="text-xs text-[var(--dash-muted)]">
              Set a password first if you only use Google or email codes.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="contained"
            disabled={busy || !state.hasPassword}
            onClick={onEnableEmail}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Enable email 2FA
          </Button>
          <Button
            variant="outlined"
            disabled={busy || !state.hasPassword}
            onClick={onBeginTotp}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Set up authenticator
          </Button>
          {state.twoFactorEnabled ? (
            <Button
              variant="outlined"
              color="error"
              disabled={busy || !state.hasPassword}
              onClick={() => setDisableOpen(true)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Disable 2FA
            </Button>
          ) : null}
        </div>
      </section>

      <DashboardDialog
        open={totpOpen && Boolean(qr)}
        onClose={() => setTotpOpen(false)}
        title="Set up authenticator"
        disableClose={busy}
        actions={
          <>
            <Button color="inherit" onClick={() => setTotpOpen(false)} disabled={busy}>
              {t("modal.cancel")}
            </Button>
            <Button variant="contained" onClick={onConfirmTotp} disabled={busy}>
              {t("modal.confirm")}
            </Button>
          </>
        }
      >
        {qr ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Authenticator QR code" className="mx-auto" />
            {totpSecret ? (
              <p className="mt-2 break-all text-center text-xs text-[var(--dash-muted)]">
                Manual key: {totpSecret}
              </p>
            ) : null}
            <label className="mt-4 block text-sm font-semibold" htmlFor="totp-confirm">
              Code from app
            </label>
            <input
              id="totp-confirm"
              type="text"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-[var(--dash-border)] px-3 py-2 text-sm tracking-widest"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
            />
          </>
        ) : null}
      </DashboardDialog>

      <DashboardConfirmDialog
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        onConfirm={async () => {
          await onDisable();
          setDisableOpen(false);
        }}
        title={t("modal.disable2faTitle")}
        description={t("modal.disable2faBody")}
        danger
        loading={busy}
      />

      {message ? (
        <p className="text-sm text-green-700">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
