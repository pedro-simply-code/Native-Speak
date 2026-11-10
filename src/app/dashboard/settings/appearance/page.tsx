import { AppearanceSettingsForm } from "@/components/dashboard/settings/appearance-settings-form";

export default function DashboardAppearanceSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--theme-ink)]">
          Site appearance
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--theme-muted)]">
          Choose a color palette by mood — names reflect hues, not marketing
          templates. Border, shadow, and radius tokens apply across the public
          site and dashboard preview.
        </p>
      </header>
      <AppearanceSettingsForm />
    </div>
  );
}
