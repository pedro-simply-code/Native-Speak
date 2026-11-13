"use client";

import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import { IconMailForward } from "@tabler/icons-react";
import { sendStaffInvite } from "@/server/actions/invitations";
import { DashField, dashInputClass, dashInputStyle } from "@/components/dashboard/dash-field";
import {
  LANGUAGES,
  TEACHING_AGE_GROUPS,
  TIMEZONES,
} from "@/lib/platform/profile-options";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

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
  const [message, setMessage] = useState<string | null>(null);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [secondaryLangs, setSecondaryLangs] = useState<string[]>(["English"]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const result = await sendStaffInvite({
      role,
      email: String(form.get("email") ?? ""),
      primaryFirstName: String(form.get("primaryFirstName") ?? ""),
      primaryLastName: String(form.get("primaryLastName") ?? ""),
      legalName: String(form.get("legalName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      bio: role === "teacher" ? String(form.get("bio") ?? "") : undefined,
      timezone:
        role === "teacher" ? String(form.get("timezone") ?? "") : undefined,
      staffStatus:
        role === "teacher"
          ? (String(form.get("staffStatus") ?? "invited") as
              | "invited"
              | "active"
              | "inactive")
          : undefined,
      teachingAgeGroups: role === "teacher" ? ageGroups : undefined,
      nativeLanguage:
        role === "teacher" ? String(form.get("nativeLanguage") ?? "Spanish") : undefined,
      secondaryLanguages: role === "teacher" ? secondaryLangs : undefined,
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      `Invite sent to ${String(form.get("email"))}. They can authenticate from the email link.`,
    );
    e.currentTarget.reset();
    setAgeGroups([]);
    setSecondaryLangs(["English"]);
    setTimeout(() => {
      setOpen(false);
      setMessage(null);
    }, 1200);
  }

  function toggleMulti(
    value: string,
    list: string[],
    set: (next: string[]) => void,
  ) {
    set(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    );
  }

  return (
    <>
      <DashboardModalTrigger
        label={t("modal.sendInvite")}
        onClick={() => setOpen(true)}
        startIcon={<IconMailForward size={18} stroke={1.5} />}
      />

      <DashboardDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("modal.inviteTitle")}
        maxWidth="md"
        disableClose={loading}
        actions={
          <>
            <Button onClick={() => setOpen(false)} disabled={loading} color="inherit">
              {t("modal.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={loading}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {loading ? "…" : t("modal.sendInvite")}
            </Button>
          </>
        }
      >
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
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
                    {r}
                  </option>
                ))}
              </select>
            </DashField>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <DashField label="Primary first name">
              <input
                name="primaryFirstName"
                required
                className={dashInputClass}
                style={dashInputStyle()}
              />
            </DashField>
            <DashField label="Primary last name">
              <input
                name="primaryLastName"
                required
                className={dashInputClass}
                style={dashInputStyle()}
              />
            </DashField>
          </div>

          <DashField label="Full legal name">
            <input
              name="legalName"
              required
              className={dashInputClass}
              style={dashInputStyle()}
            />
          </DashField>

          <DashField label="Email">
            <input
              name="email"
              type="email"
              required
              className={dashInputClass}
              style={dashInputStyle()}
            />
          </DashField>

          <DashField label="Phone">
            <input
              name="phone"
              type="tel"
              className={dashInputClass}
              style={dashInputStyle()}
            />
          </DashField>

          {role === "teacher" ? (
            <>
              <DashField label="Bio">
                <textarea
                  name="bio"
                  rows={3}
                  className={dashInputClass}
                  style={dashInputStyle()}
                />
              </DashField>
              <DashField label="Time zone">
                <select
                  name="timezone"
                  defaultValue="America/Chicago"
                  className={dashInputClass}
                  style={dashInputStyle()}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </DashField>
              <DashField label="Status">
                <select
                  name="staffStatus"
                  defaultValue="invited"
                  className={dashInputClass}
                  style={dashInputStyle()}
                >
                  <option value="invited">Invited</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </DashField>
              <DashField label="Teaching age groups">
                <div className="flex flex-wrap gap-2">
                  {TEACHING_AGE_GROUPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs ${
                        ageGroups.includes(g)
                          ? "bg-[var(--dash-primary)] text-white"
                          : ""
                      }`}
                      style={{ borderColor: "var(--dash-border)" }}
                      onClick={() => toggleMulti(g, ageGroups, setAgeGroups)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </DashField>
              <DashField label="Native language">
                <select
                  name="nativeLanguage"
                  defaultValue="Spanish"
                  className={dashInputClass}
                  style={dashInputStyle()}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </DashField>
              <DashField label="Secondary languages">
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.filter((l) => l !== "Spanish").map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs ${
                        secondaryLangs.includes(l)
                          ? "bg-[var(--dash-primary)] text-white"
                          : ""
                      }`}
                      style={{ borderColor: "var(--dash-border)" }}
                      onClick={() =>
                        toggleMulti(l, secondaryLangs, setSecondaryLangs)
                      }
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </DashField>
            </>
          ) : null}

          {message ? (
            <p className="text-sm text-[var(--dash-muted)]">{message}</p>
          ) : null}
        </form>
      </DashboardDialog>
    </>
  );
}
