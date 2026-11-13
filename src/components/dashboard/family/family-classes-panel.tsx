"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { requestAppointmentChange } from "@/server/actions/appointment-changes";
import type { listFamilyAppointmentsDetailed } from "@/server/actions/appointment-changes";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

type Row = Awaited<ReturnType<typeof listFamilyAppointmentsDetailed>>[number];

const REASONS = [
  "schedule_conflict",
  "illness",
  "emergency",
  "travel",
  "other",
] as const;

export function FamilyClassesPanel({
  upcoming,
  past,
  creditBalance,
}: {
  upcoming: Row[];
  past: Row[];
  creditBalance: number;
}) {
  const { t } = useDashboardI18n();
  const [msg, setMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    mode: "cancel" | "reschedule";
    row: Row;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(form: HTMLFormElement) {
    if (!dialog) return;
    setLoading(true);
    const f = new FormData(form);
    const res = await requestAppointmentChange({
      appointmentId: dialog.row.id,
      requestType: dialog.mode === "cancel" ? "cancel" : "reschedule",
      reasonCode: String(f.get("reasonCode")) as (typeof REASONS)[number],
      reasonText: String(f.get("reasonText") ?? ""),
      proposedStartsAt:
        dialog.mode === "reschedule"
          ? String(f.get("proposedStartsAt") ?? "")
          : undefined,
    });
    setLoading(false);
    if (res.ok) {
      setMsg(
        res.status === "pending"
          ? t("scheduling.requestPending")
          : t("scheduling.requestApproved"),
      );
      setDialog(null);
      window.location.reload();
    } else {
      setMsg(res.error);
    }
  }

  return (
    <>
      <p className="dash-card mb-4 p-4 text-sm">
        {t("scheduling.creditBalance")}:{" "}
        <span className="font-bold">{creditBalance}</span>
      </p>
      {msg ? (
        <p className="mb-3 text-sm text-[var(--dash-muted)]" role="status">
          {msg}
        </p>
      ) : null}

      <div className="dash-card p-5">
        <h2 className="text-sm font-bold">{t("scheduling.upcoming")}</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {upcoming.length === 0 ? (
            <li className="text-[var(--dash-muted)]">{t("scheduling.noneUpcoming")}</li>
          ) : (
            upcoming.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <div>
                  <p className="font-semibold">{c.startsAt.toLocaleString()}</p>
                  <p className="text-[var(--dash-muted)]">{c.status}</p>
                  {c.meetingUrl ? (
                    <a
                      href={c.meetingUrl}
                      className="text-xs text-[var(--dash-primary)]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("scheduling.joinMeet")}
                    </a>
                  ) : null}
                </div>
                {c.status === "scheduled" ? (
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setDialog({ mode: "reschedule", row: c })}
                    >
                      {t("scheduling.reschedule")}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => setDialog({ mode: "cancel", row: c })}
                    >
                      {t("scheduling.cancel")}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="dash-card mt-4 p-5">
        <h2 className="text-sm font-bold">{t("scheduling.past")}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {past.length === 0 ? (
            <li className="text-[var(--dash-muted)]">{t("scheduling.nonePast")}</li>
          ) : (
            past.map((c) => (
              <li key={c.id}>
                {c.startsAt.toLocaleString()} — {c.status}
              </li>
            ))
          )}
        </ul>
      </div>

      <DashboardDialog
        open={dialog !== null}
        onClose={() => !loading && setDialog(null)}
        title={
          dialog?.mode === "cancel"
            ? t("scheduling.cancelTitle")
            : t("scheduling.rescheduleTitle")
        }
        disableClose={loading}
        actions={
          <>
            <Button disabled={loading} onClick={() => setDialog(null)} color="inherit">
              {t("modal.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={loading}
              form="family-change-form"
              type="submit"
            >
              {t("modal.confirm")}
            </Button>
          </>
        }
      >
        {dialog ? (
          <form
            id="family-change-form"
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(e.currentTarget);
            }}
          >
            <label className="block text-sm font-semibold">
              {t("scheduling.reason")}
              <select
                name="reasonCode"
                required
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                defaultValue="schedule_conflict"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {t(`scheduling.reasons.${r}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {t("scheduling.reasonDetails")}
              <textarea
                name="reasonText"
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                rows={3}
              />
            </label>
            {dialog.mode === "reschedule" ? (
              <label className="block text-sm font-semibold">
                {t("scheduling.newTime")}
                <input
                  name="proposedStartsAt"
                  type="datetime-local"
                  required
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                />
              </label>
            ) : null}
            <p className="text-xs text-[var(--dash-muted)]">
              {t("scheduling.policyHint")}
            </p>
          </form>
        ) : null}
      </DashboardDialog>
    </>
  );
}
