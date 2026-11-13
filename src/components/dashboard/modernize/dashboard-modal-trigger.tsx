"use client";

import type { ReactNode } from "react";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

type DashboardModalTriggerProps = {
  label: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  startIcon?: ReactNode;
  disabled?: boolean;
};

export function DashboardModalTrigger({
  label,
  onClick,
  variant = "contained",
  color = "primary",
  startIcon,
  disabled,
}: DashboardModalTriggerProps) {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      startIcon={startIcon}
      disabled={disabled}
      sx={{ textTransform: "none", fontWeight: 600 }}
    >
      {label}
    </Button>
  );
}
