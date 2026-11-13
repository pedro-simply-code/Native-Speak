"use client";

import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import { IconCalendarOff, IconClockPlus } from "@tabler/icons-react";
import {
  addCalendarBlock,
  addWeeklySlot,
  listCalendarBlocks,
  listWeeklyAvailability,
} from "@/server/actions/teacher";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TeacherAvailabilityForm({
  initialWeekly,
  initialBlocks,
}: {
  initialWeekly: Awaited<ReturnType<typeof listWeeklyAvailability>>;
  initialBlocks: Awaited<ReturnType<typeof listCalendarBlocks>>;
}) {
  const { t } = useDashboardI18n();
  const weeklyRef = useRef<HTMLFormElement>(null);
  const blockRef = useRef<HTMLFormElement>(null);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [weekly, setWeekly] = useState(initialWeekly);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(false);

  return (
    <div className="space-y-6">
      <div className="dash-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Weekly availability</h2>
            <p className="text-xs text-[var(--dash-muted)]">
              General days and times you can teach.
            </p>
          </div>
          <DashboardModalTrigger
            label={t("modal.addWeeklySlot")}
            onClick={() => setWeeklyOpen(true)}
            startIcon={<IconClockPlus size={18} stroke={1.5} />}
            variant="outlined"
          />
        </div>
        <ul className="mt-4 space-y-1 text-sm">
          {weekly.length === 0 ? (
            <li className="text-[var(--dash-muted)]">No weekly slots yet.</li>
          ) : (
            weekly.map((row) => (
              <li key={row.id}>
                {DAYS[row.dayOfWeek]} {row.startTime}–{row.endTime}
              </li>
            ))
          )}
        </ul>
      </div>

      <DashboardDialog
        open={weeklyOpen}
        onClose={() => setWeeklyOpen(false)}
        title={t("modal.weeklySlotTitle")}
        disableClose={loadingWeekly}
        actions={
          <>
            <Button
              color="inherit"
              disabled={loadingWeekly}
              onClick={() => setWeeklyOpen(false)}
            >
              {t("modal.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={loadingWeekly}
              onClick={() => weeklyRef.current?.requestSubmit()}
            >
              {t("modal.addWeeklySlot")}
            </Button>
          </>
        }
      >
        <form
          ref={weeklyRef}
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setLoadingWeekly(true);
            const f = new FormData(form);
            const res = await addWeeklySlot({
              dayOfWeek: Number(f.get("dayOfWeek")),
              startTime: String(f.get("startTime")),
              endTime: String(f.get("endTime")),
            });
            setLoadingWeekly(false);
            setMsg(res.ok ? "Slot saved." : res.error);
            if (res.ok) {
              setWeekly(await listWeeklyAvailability());
              form.reset();
              setWeeklyOpen(false);
            }
          }}
        >
          <select name="dayOfWeek" className="rounded border px-2 py-2 text-sm sm:col-span-2">
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            name="startTime"
            type="time"
            required
            className="rounded border px-2 py-2 text-sm"
          />
          <input
            name="endTime"
            type="time"
            required
            className="rounded border px-2 py-2 text-sm"
          />
        </form>
      </DashboardDialog>

      <div className="dash-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Calendar blocks</h2>
            <p className="text-xs text-[var(--dash-muted)]">
              Mark specific days unavailable.
            </p>
          </div>
          <DashboardModalTrigger
            label={t("modal.blockDay")}
            onClick={() => setBlockOpen(true)}
            startIcon={<IconCalendarOff size={18} stroke={1.5} />}
            variant="outlined"
          />
        </div>
        <ul className="mt-4 space-y-1 text-sm">
          {blocks.length === 0 ? (
            <li className="text-[var(--dash-muted)]">No blocks yet.</li>
          ) : (
            blocks.map((b) => (
              <li key={b.id}>
                {b.blockDate.toLocaleDateString()}
                {b.reason ? ` — ${b.reason}` : ""}
              </li>
            ))
          )}
        </ul>
      </div>

      <DashboardDialog
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={t("modal.blockDayTitle")}
        disableClose={loadingBlock}
        actions={
          <>
            <Button
              color="inherit"
              disabled={loadingBlock}
              onClick={() => setBlockOpen(false)}
            >
              {t("modal.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={loadingBlock}
              onClick={() => blockRef.current?.requestSubmit()}
            >
              {t("modal.blockDay")}
            </Button>
          </>
        }
      >
        <form
          ref={blockRef}
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setLoadingBlock(true);
            const f = new FormData(form);
            const res = await addCalendarBlock({
              blockDate: String(f.get("blockDate")),
              reason: String(f.get("reason") ?? ""),
            });
            setLoadingBlock(false);
            setMsg(res.ok ? "Block saved." : res.error);
            if (res.ok) {
              setBlocks(await listCalendarBlocks());
              form.reset();
              setBlockOpen(false);
            }
          }}
        >
          <input
            name="blockDate"
            type="date"
            required
            className="rounded border px-2 py-2 text-sm"
          />
          <input
            name="reason"
            placeholder="Reason"
            className="rounded border px-2 py-2 text-sm"
          />
        </form>
      </DashboardDialog>

      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
    </div>
  );
}
