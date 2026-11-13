"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { IconMailForward, IconUserCheck } from "@tabler/icons-react";
import {
  lookupInviteRecipient,
  sendStaffInviteToNewUser,
  sendStaffRoleInviteInApp,
  type InviteLookupResult,
} from "@/server/actions/invitations";
import { DashField, dashInputClass, dashInputStyle } from "@/components/dashboard/dash-field";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import type { AppRole } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";

type RoleOption = "manager" | "teacher" | "family";

export function InviteStaffForm({
  allowedRoles,
}: {
  allowedRoles: RoleOption[];
}) {
  const { t } = useDashboardI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<RoleOption>(allowedRoles[0] ?? "teacher");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [lookup, setLookup] = useState<InviteLookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleForLookup = role as AppRole;

  const runLookup = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setLookup(null);
        return;
      }
      setLookupLoading(true);
      const result = await lookupInviteRecipient(trimmed, roleForLookup);
      setLookupLoading(false);
      setLookup(result);
    },
    [roleForLookup],
  );

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      void runLookup(email);
    }, 400);
    return () => window.clearTimeout(id);
  }, [email, open, runLookup]);

  useEffect(() => {
    if (open) {
      void runLookup(email);
    }
  }, [role, open, email, runLookup]);

  const existing =
    lookup?.ok && lookup.exists
      ? lookup
      : null;

  async function onSubmitNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (existing && !existingBlocked) {
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await sendStaffInviteToNewUser({
      email: email.trim(),
      role,
      fullName: fullName.trim(),
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      `Email invite sent to ${email.trim()}. They will register from the link.`,
    );
    form.reset();
    setEmail("");
    setFullName("");
    setLookup(null);
    closeSoon();
  }

  async function onAssignRole() {
    setLoading(true);
    setMessage(null);
    const result = await sendStaffRoleInviteInApp({
      email: email.trim(),
      role,
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    const label = ROLE_LABELS[role as AppRole];
    setMessage(
      `In-app invitation sent. They can accept the ${label} role from notifications.`,
    );
    setEmail("");
    setFullName("");
    setLookup(null);
    closeSoon();
  }

  function closeSoon() {
    setTimeout(() => {
      setOpen(false);
      setMessage(null);
    }, 1400);
  }

  function onDialogClose() {
    if (loading) return;
    setOpen(false);
    setMessage(null);
    setEmail("");
    setFullName("");
    setLookup(null);
  }

  const existingBlocked = existing?.hasTargetRole === true;

  return (
    <>
      <DashboardModalTrigger
        label={t("modal.sendInvite")}
        onClick={() => setOpen(true)}
        startIcon={<IconMailForward size={18} stroke={1.5} />}
      />

      <DashboardDialog
        open={open}
        onClose={onDialogClose}
        title={t("modal.inviteTitle")}
        maxWidth="sm"
        disableClose={loading}
        actions={
          existing && !existingBlocked ? (
            <>
              <Button onClick={onDialogClose} disabled={loading} color="inherit">
                {t("modal.cancel")}
              </Button>
              <Button
                variant="contained"
                disabled={loading || !email.trim()}
                onClick={() => void onAssignRole()}
              >
                {loading ? "…" : `Assign ${ROLE_LABELS[roleForLookup]} role`}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onDialogClose} disabled={loading} color="inherit">
                {t("modal.cancel")}
              </Button>
              <Button
                variant="contained"
                disabled={loading || existingBlocked}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {loading ? "…" : "Send email invite"}
              </Button>
            </>
          )
        }
      >
        {allowedRoles.length > 1 ? (
          <DashField label="Role">
            <select
              className={dashInputClass}
              style={dashInputStyle()}
              value={role}
              onChange={(e) => setRole(e.target.value as RoleOption)}
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r as AppRole]}
                </option>
              ))}
            </select>
          </DashField>
        ) : null}

        <form
          ref={formRef}
          onSubmit={onSubmitNew}
          className="mt-4 space-y-4"
        >
          <DashField label="Email">
            <input
              type="email"
              required
              autoComplete="off"
              className={dashInputClass}
              style={dashInputStyle()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </DashField>

          {lookupLoading ? (
            <p className="text-sm text-[var(--dash-muted)]">Checking account…</p>
          ) : null}

          {existing ? (
            <div
              className="rounded-[var(--dash-radius-lg)] border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--dash-border)",
                background: "var(--dash-primary-light)",
              }}
            >
              <p className="flex items-center gap-2 font-semibold text-[var(--dash-heading)]">
                <IconUserCheck size={18} stroke={1.5} />
                Account found
              </p>
              <p className="mt-1 text-[var(--dash-muted)]">
                {existing.name ?? existing.email}
                {existing.roles.length
                  ? ` · roles: ${existing.roles.join(", ")}`
                  : ""}
              </p>
              {existing.hasTargetRole ? (
                <p className="mt-2 text-amber-900">
                  Already has {ROLE_LABELS[roleForLookup]}. No invite needed.
                </p>
              ) : (
                <p className="mt-2 text-[var(--dash-muted)]">
                  Use &quot;Assign {ROLE_LABELS[roleForLookup]} role&quot; to notify
                  them in the dashboard (no registration email).
                </p>
              )}
            </div>
          ) : lookup?.ok && !lookup.exists && email.includes("@") ? (
            <p className="text-sm text-[var(--dash-muted)]">
              No account yet — add their name and send an email invite.
            </p>
          ) : null}

          {!existing ? (
            <DashField label="Full name">
              <input
                required
                className={dashInputClass}
                style={dashInputStyle()}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and last name"
              />
            </DashField>
          ) : null}

          {lookup && !lookup.ok ? (
            <p className="text-sm text-red-700">{lookup.error}</p>
          ) : null}
          {message ? (
            <p className="text-sm text-[var(--dash-muted)]">{message}</p>
          ) : null}
        </form>
      </DashboardDialog>
    </>
  );
}
