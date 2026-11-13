"use client";

import PerfectScrollbar from "react-perfect-scrollbar";
import Box from "@mui/material/Box";

export function DashboardSidebarScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
    <PerfectScrollbar
      options={{
        wheelSpeed: 0.5,
        suppressScrollX: true,
      }}
      style={{
        height: "100%",
        maxHeight: "calc(100dvh - 200px)",
      }}
    >
      {children}
    </PerfectScrollbar>
  </Box>
  );
}
