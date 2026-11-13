import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { SecuritySettingsForm } from "@/components/dashboard/settings/security-settings-form";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { getSecuritySettings } from "@/server/actions/auth-security-settings";

export const metadata = {
  title: "Security | Native Speak",
};

async function SecuritySettingsSection() {
  const initial = await getSecuritySettings();
  return <SecuritySettingsForm initial={initial} />;
}

export default function SecuritySettingsPage() {
  return (
    <main className="dash-page-scroll" role="main">
      <div className="dash-page-pad">
        <DashboardPageHeader
          title="Security"
          description="Two-factor authentication, sign-in hardening, and account protection."
        />
        <div className="mt-8 max-w-3xl">
          <Suspense
            fallback={
              <DashboardLoadingPlaceholder label="Loading security settings…" />
            }
          >
            <SecuritySettingsSection />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
