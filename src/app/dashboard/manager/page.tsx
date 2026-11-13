import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { ManagerOverviewSection } from "@/components/dashboard/manager/manager-overview-section";

export const instant = false;

export default function ManagerHomePage() {
  return (
    <Suspense
      fallback={
        <DashboardLoadingPlaceholder label="Loading overview…" minHeight={360} />
      }
    >
      <ManagerOverviewSection />
    </Suspense>
  );
}
