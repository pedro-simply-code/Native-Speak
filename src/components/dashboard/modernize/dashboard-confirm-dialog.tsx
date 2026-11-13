"use client";

import Button from "@mui/material/Button";
import { DashboardDialog } from "@/components/dashboard/modernize/dashboard-dialog";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function DashboardConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) {
  const { t } = useDashboardI18n();

  return (
    <DashboardDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="xs"
      disableClose={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading} color="inherit">
            {cancelLabel ?? t("modal.cancel")}
          </Button>
          <Button
            onClick={() => void onConfirm()}
            variant="contained"
            color={danger ? "error" : "primary"}
            disabled={loading}
          >
            {confirmLabel ?? t("modal.confirm")}
          </Button>
        </>
      }
    >
      <span className="sr-only">{description ?? title}</span>
    </DashboardDialog>
  );
}
