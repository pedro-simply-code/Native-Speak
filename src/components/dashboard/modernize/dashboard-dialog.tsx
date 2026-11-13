"use client";

import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { IconX } from "@tabler/icons-react";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

type DashboardDialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Prevent closing while submitting (backdrop / escape). */
  disableClose?: boolean;
};

export function DashboardDialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  disableClose = false,
}: DashboardDialogProps) {
  const { t } = useDashboardI18n();

  return (
    <Dialog
      open={open}
      onClose={disableClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll="paper"
      aria-labelledby="dashboard-dialog-title"
    >
      <DialogTitle
        id="dashboard-dialog-title"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pr: 1,
        }}
      >
        <span>
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {description ? (
            <Typography
              component="p"
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              {description}
            </Typography>
          ) : null}
        </span>
        <IconButton
          aria-label={t("modal.close")}
          onClick={onClose}
          disabled={disableClose}
          size="small"
          sx={{ mt: -0.5 }}
        >
          <IconX size={20} stroke={1.5} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        {children}
      </DialogContent>
      {actions ? (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{actions}</DialogActions>
      ) : null}
    </Dialog>
  );
}
