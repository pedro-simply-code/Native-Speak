export function DashboardLoadingPlaceholder({
  label,
  minHeight = 120,
}: {
  label: string;
  minHeight?: number;
}) {
  return (
    <div
      className="dash-card dash-skeleton mt-6 flex items-center px-5 text-sm dash-muted"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}
