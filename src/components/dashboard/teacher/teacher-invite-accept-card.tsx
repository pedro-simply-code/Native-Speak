"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import { acceptTeacherInvitation } from "@/server/actions/teacher";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function TeacherInviteAcceptCard() {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onAccept() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const result = await acceptTeacherInvitation();
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(t("teacherInvite.success"));
    router.refresh();
  }

  return (
    <div
      className="dash-card dash-card--lift border-l-4 p-5"
      style={{ borderLeftColor: "var(--dash-primary, #5D87FF)" }}
    >
      <h2 className="text-sm font-bold text-[var(--dash-ink)]">
        {t("teacherInvite.title")}
      </h2>
      <p className="mt-2 text-sm text-[var(--dash-muted)]">
        {t("teacherInvite.body")}
      </p>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="mt-2 text-sm text-green-800">{message}</p>
      ) : (
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => void onAccept()}
          sx={{ mt: 2 }}
        >
          {loading ? t("teacherInvite.working") : t("teacherInvite.accept")}
        </Button>
      )}
    </div>
  );
}
