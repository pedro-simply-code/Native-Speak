"use client";

import Card, { type CardProps } from "@mui/material/Card";

/** Modernize card surface — drop-in for legacy `dash-card` class pages */
export function DashCard({ sx, ...props }: CardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        boxShadow: "0px 2px 6px rgba(42, 53, 71, 0.08)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 28px rgba(42, 53, 71, 0.1)",
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
}
