"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { IconCalendarPlus } from "@tabler/icons-react";
import {
  bookFamilyClass,
  fetchTeacherSlots,
} from "@/server/actions/appointments";
import type { listActiveTeachers, listFamilyStudents } from "@/server/actions/family";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function FamilyScheduleForm({
  teachers,
  students,
}: {
  teachers: Awaited<ReturnType<typeof listActiveTeachers>>;
  students: Awaited<ReturnType<typeof listFamilyStudents>>;
}) {
  const { t } = useDashboardI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [slots, setSlots] = useState<{ startsAt: string; label: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;
    void (async () => {
      setSlotsLoading(true);
      const next = await fetchTeacherSlots(teacherId);
      if (!cancelled) {
        setSlots(next);
        setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  /** Cleared teacher selection hides stale slots without an extra render pass. */
  const visibleSlots = teacherId ? slots : [];

  if (students.length === 0) {
    return (
      <p className="dash-card p-5 text-sm text-[var(--dash-muted)]">
        Add at least one student in the Students section before scheduling.
      </p>
    );
  }

  return (
    <>
      <div className="dash-card flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm text-[var(--dash-muted)]">
          {teachers.length} teacher(s) available · {students.length} student(s)
        </p>
        <DashboardModalTrigger
          label={t("modal.scheduleClass")}
          onClick={() => setOpen(true)}
          startIcon={<IconCalendarPlus size={18} stroke={1.5} />}
        />
      </div>

      {msg && !open ? (
        <p className="mt-3 text-sm text-green-700" role="status">
          {msg}
        </p>
      ) : null}

      <DashboardDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("modal.scheduleClassTitle")}
        disableClose={loading}
        actions={
          <>
            <Button color="inherit" disabled={loading} onClick={() => setOpen(false)}>
              {t("modal.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={loading}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {t("modal.scheduleClass")}
            </Button>
          </>
        }
      >
        <form
          ref={formRef}
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setLoading(true);
            const f = new FormData(form);
            const res = await bookFamilyClass({
              teacherUserId: String(f.get("teacherUserId")),
              studentId: String(f.get("studentId")),
              startsAt: String(f.get("startsAt")),
              savePreferredTeacher: f.get("savePreferredTeacher") === "on",
            });
            setLoading(false);
            if (res.ok) {
              setMsg("Class scheduled (25 min).");
              setOpen(false);
            } else {
              setMsg(res.error);
            }
          }}
        >
          <label className="block text-sm font-semibold">
            Teacher
            <select
              name="teacherUserId"
              required
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.userId} value={teacher.userId}>
                  {teacher.name ?? teacher.email} ({teacher.timezone})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Student
            <select
              name="studentId"
              required
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Available slot
            <select
              name="startsAt"
              required
              disabled={!teacherId || slotsLoading}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">
                {slotsLoading
                  ? "Loading slots…"
                  : visibleSlots.length === 0
                    ? "Set teacher availability or pick another teacher"
                    : "Select a time"}
              </option>
              {visibleSlots.map((s) => (
                <option key={s.startsAt} value={s.startsAt}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="savePreferredTeacher" type="checkbox" />
            Save as preferred teacher
          </label>
          {msg && open ? (
            <p className="text-sm text-red-700" role="alert">
              {msg}
            </p>
          ) : null}
        </form>
      </DashboardDialog>
    </>
  );
}
