"use client";

import { useEffect } from "react";

/** Marks the document while inside /dashboard (Modernize palette stays fixed). */
export function DashboardThemeScope({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.dashboard = "true";
    return () => {
      delete html.dataset.dashboard;
    };
  }, []);

  return children;
}
