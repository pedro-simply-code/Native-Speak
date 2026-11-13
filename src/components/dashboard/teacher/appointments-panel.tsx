"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import { IconNotes } from "@tabler/icons-react";
import { requestAppointmentChange } from "@/server/actions/appointment-changes";
import { saveAppointmentNote, uploadLessonMaterialFile } from "@/server/actions/teacher";
import type { listTeacherAppointments } from "@/server/actions/teacher";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

type Row = Awaited<ReturnType<typeof listTeacherAppointments>>[number];

function AppointmentList({
  title,
  rows,
}: {
  title: string;
  rows: Row[];
}) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(false);

  const open = editing !== null;

  return (
    <div className="dash-card p-5">
      <h2 className="text-sm font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--dash-muted)]">No items yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border-b pb-3 text-sm"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <p className="font-semibold">
                {row.startsAt.toLocaleString()} — {row.studentFirstName}{" "}
                {row.studentLastName}
              </p>
              <p className="text-[var(--dash-muted)]">{row.familyEmail}</p>
              <p>Status: {row.status}</p>
              {row.lessonNote ? (
                <p className="mt-1 text-[var(--dash-muted)]">
                  Note: {row.lessonNote}
                </p>
              ) : null}
              {row.taught ? (
                <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                  Marked as taught
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <DashboardModalTrigger
                  label={t("modal.lessonNote")}
                  onClick={() => setEditing(row)}
                  variant="outlined"
                  startIcon={<IconNotes size={18} stroke={1.5} />}
                />
                {row.status === "scheduled" ? (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={async () => {
                      const res = await requestAppointmentChange({
                        appointmentId: row.id,
                        requestType: "cancel",
                        reasonCode: "teacher_unavailable",
                        reasonText: "Teacher cancelled",
                      });
                      setMsg(res.ok ? "Cancellation submitted." : res.error);
                      if (res.ok) router.refresh();
                    }}
                  >
                    {t("scheduling.cancel")}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {msg ? <p className="mt-2 text-xs text-[var(--dash-muted)]">{msg}</p> : null}

      <DashboardDialog
        open={open}
        onClose={() => !loading && setEditing(null)}
        title={t("modal.lessonNoteTitle")}
        description={
          editing
            ? `${editing.startsAt.toLocaleString()} — ${editing.studentFirstName} ${editing.studentLastName}`
            : undefined
        }
        disableClose={loading}
        actions={
          <>
            <Button
              color="inherit"
              disabled={loading}
              onClick={() => setEditing(null)}
            >
              {t("modal.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={loading}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {t("modal.saveLessonNote")}
            </Button>
          </>
        }
      >
        {editing ? (
          <form
            key={editing.id}
            ref={formRef}
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setLoading(true);
              const f = new FormData(form);
              const res = await saveAppointmentNote({
                appointmentId: editing.id,
                lessonNote: String(f.get("note") ?? ""),
                taught: f.get("taught") === "on",
              });
              setLoading(false);
              setMsg(res.ok ? "Saved." : res.error);
              if (res.ok) {
                setEditing(null);
                router.refresh();
              }
            }}
          >
            <textarea
              name="note"
              placeholder="Lesson note"
              defaultValue={editing.lessonNote ?? ""}
              className="w-full rounded border px-2 py-1 text-sm"
              rows={4}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                name="taught"
                type="checkbox"
                defaultChecked={editing.taught ?? false}
              />
              Taught this lesson
            </label>
            <label className="block text-sm">
              Upload PDF material
              <input
                name="material"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                className="mt-1 block w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.set("appointmentId", editing.id);
                  fd.set("title", file.name);
                  fd.set("file", file);
                  const res = await uploadLessonMaterialFile(fd);
                  setMsg(res.ok ? "Material uploaded." : res.error);
                }}
              />
            </label>
          </form>
        ) : null}
      </DashboardDialog>
    </div>
  );
}

export function TeacherAppointmentsPanel({
  upcoming,
  past,
}: {
  upcoming: Row[];
  past: Row[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AppointmentList title="Upcoming" rows={upcoming} />
      <AppointmentList title="Past" rows={past} />
    </div>
  );
}
