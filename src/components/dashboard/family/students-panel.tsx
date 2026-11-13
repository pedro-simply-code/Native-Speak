"use client";

import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import { IconUserPlus } from "@tabler/icons-react";
import { addStudent, listFamilyStudents } from "@/server/actions/family";
import { PROFICIENCY_LEVELS } from "@/lib/platform/profile-options";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function StudentsPanel({
  initial,
}: {
  initial: Awaited<ReturnType<typeof listFamilyStudents>>;
}) {
  const { t } = useDashboardI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <DashboardModalTrigger
          label={t("modal.addStudent")}
          onClick={() => setOpen(true)}
          startIcon={<IconUserPlus size={18} stroke={1.5} />}
        />
      </div>

      <DashboardDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("modal.addStudentTitle")}
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
              {t("modal.addStudent")}
            </Button>
          </>
        }
      >
        <form
          ref={formRef}
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const f = new FormData(e.currentTarget);
            const res = await addStudent({
              firstName: String(f.get("firstName")),
              lastName: String(f.get("lastName")),
              email: String(f.get("email") ?? ""),
              age: f.get("age") ? Number(f.get("age")) : undefined,
              grade: String(f.get("grade") ?? ""),
              proficiency:
                (f.get("proficiency") as
                  | "beginner"
                  | "intermediate"
                  | "advanced") ?? "beginner",
            });
            setLoading(false);
            if (res.ok) {
              setRows(await listFamilyStudents());
              setMsg("Student added.");
              e.currentTarget.reset();
              setOpen(false);
            } else {
              setMsg(res.error);
            }
          }}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              name="firstName"
              required
              placeholder="First name"
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              name="lastName"
              required
              placeholder="Last name"
              className="rounded border px-3 py-2 text-sm"
            />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              name="age"
              type="number"
              min={3}
              placeholder="Age"
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              name="grade"
              placeholder="Grade"
              className="rounded border px-3 py-2 text-sm"
            />
            <select
              name="proficiency"
              defaultValue="beginner"
              className="rounded border px-3 py-2 text-sm"
            >
              {PROFICIENCY_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          {msg && !loading ? (
            <p className="text-xs text-[var(--dash-muted)]">{msg}</p>
          ) : null}
        </form>
      </DashboardDialog>

      <div className="dash-card overflow-x-auto">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Proficiency</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-[var(--dash-muted)]">
                  No students yet.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.firstName} {s.lastName}
                  </td>
                  <td>{s.age ?? "—"}</td>
                  <td>{s.proficiency}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
