"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { modernizeMuiTheme } from "@/components/dashboard/modernize/modernize-mui-theme";
import "react-perfect-scrollbar/dist/css/styles.css";

export function DashboardMuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={modernizeMuiTheme}>
        <ScopedCssBaseline
          enableColorScheme
          sx={{
            minHeight: "100dvh",
            bgcolor: "background.default",
          }}
        >
          {children}
        </ScopedCssBaseline>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
