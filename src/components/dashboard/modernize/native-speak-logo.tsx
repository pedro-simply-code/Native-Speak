"use client";

import Typography from "@mui/material/Typography";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function NativeSpeakLogo({ compact }: { compact?: boolean }) {
  const { t } = useDashboardI18n();
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: 'var(--font-display), "Fraunces", Georgia, serif',
        fontWeight: 600,
        fontSize: compact ? "1.05rem" : "1.2rem",
        letterSpacing: "-0.03em",
        color: "text.primary",
        whiteSpace: "nowrap",
        lineHeight: 1.12,
        display: "inline-block",
      }}
    >
      {t("shell.brandName")}
    </Typography>
  );
}
