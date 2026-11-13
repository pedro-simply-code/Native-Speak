"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { requestAppointmentChange } from "@/server/actions/appointment-changes";
import type { listFamilyAppointmentsDetailed } from "@/server/actions/appointment-changes";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

type Row = Awaited<ReturnType<typeof listFamilyAppointmentsDetailed>>[number];

function studentLabel(row: Row) {
  if (!row.studentFirstName && !row.studentLastName) return null;
  const name = [row.studentFirstName, row.studentLastName].filter(Boolean).join(" ");
  const extra = [row.studentGrade, row.studentProficiency].filter(Boolean);
  return extra.length ? `${name} (${extra.join(" · ")})` : name;
}

function formatClassWhen(start: Date, end: Date) {
  const startStr = start.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const endStr = end.toLocaleTimeString(undefined, { timeStyle: "short" });
  return `${startStr} – ${endStr}`;
}

function ClassDetails({
  row,
  t,
}: {
  row: Row;
  t: (key: string) => string;
}) {
  const student = studentLabel(row);
  const teacher = row.teacherName ?? row.teacherEmail ?? "—";
  const statusKey = `scheduling.status.${row.status}`;

  return (
    <div className="space-y-1">
      <p className="font-semibold text-[var(--dash-ink)]">
        {formatClassWhen(row.startsAt, row.endsAt)}
      </p>
      <dl className="mt-2 grid gap-1 text-[var(--dash-muted)] sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
            {t("scheduling.student")}
          </dt>
          <dd className="text-[var(--dash-ink)]">
            {student ?? t("scheduling.unknownStudent")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
            {t("scheduling.teacher")}
          </dt>
          <dd className="text-[var(--dash-ink)]">{teacher}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
            {t("scheduling.duration")}
          </dt>
          <dd className="text-[var(--dash-ink)]">{t("scheduling.durationMinutes")}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
            {t("scheduling.statusLabel")}
          </dt>
          <dd className="text-[var(--dash-ink)]">{t(statusKey)}</dd>
        </div>
      </dl>
      {row.lessonNote ? (
        <p className="mt-2 text-xs text-[var(--dash-muted)]">
          <span className="font-semibold">{t("scheduling.lessonNote")}:</span>{" "}
          {row.lessonNote}
        </p>
      ) : null}
    </div>
  );
}

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
                <div className="min-w-0 flex-1">
                  <ClassDetails row={c} t={t} />
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
              <li
                key={c.id}
                className="border-b pb-3"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <ClassDetails row={c} t={t} />
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
            <hr className="border-[var(--dash-border)]" />
            <ClassDetails row={dialog.row} t={t} />
            <hr className="border-[var(--dash-border)]" />
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
