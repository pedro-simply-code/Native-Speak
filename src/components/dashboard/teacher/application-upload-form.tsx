"use client";

import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import { IconUpload } from "@tabler/icons-react";
import { submitTeacherApplication } from "@/server/actions/teacher-application";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { DashboardModalTrigger } from "@/components/dashboard/modernize/dashboard-modal-trigger";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function TeacherApplicationUploadForm() {
  const { t } = useDashboardI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const documentUrls = urls
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const result = await submitTeacherApplication({ documentUrls });
    setLoading(false);
    setState(
      result.ok ? "Submitted — check the bell icon for updates." : result.error,
    );
    if (result.ok) {
      setUrls("");
      setTimeout(() => {
        setOpen(false);
        setState(null);
      }, 1200);
    }
  }

  return (
    <>
      <DashboardModalTrigger
        label={t("modal.submitCredentials")}
        onClick={() => setOpen(true)}
        startIcon={<IconUpload size={18} stroke={1.5} />}
        variant="outlined"
      />

      <DashboardDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("modal.credentialsTitle")}
        description="Paste secure links to résumé, certifications, or ID (one URL per line). Managers get an in-app notification immediately."
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
              {t("modal.submitCredentials")}
            </Button>
          </>
        }
      >
        <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
          <textarea
            className="w-full rounded-md border border-[var(--dash-border,#E5EAEF)] p-3 text-sm"
            rows={5}
            placeholder="https://..."
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
          />
          {state ? <p className="text-sm">{state}</p> : null}
        </form>
      </DashboardDialog>
    </>
  );
}
