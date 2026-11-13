"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function NativeSpeakLogo({ compact }: { compact?: boolean }) {
  const { t } = useDashboardI18n();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "0.85rem",
          letterSpacing: "-0.02em",
        }}
      >
        NS
      </Box>
      {!compact ? (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: "1.125rem",
            letterSpacing: "-0.02em",
            color: "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          {t("shell.brandName")}
        </Typography>
      ) : null}
    </Box>
  );
}
