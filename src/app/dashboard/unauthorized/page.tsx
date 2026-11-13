import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="dash-card p-8">
      <h1 className="text-xl font-bold">Access denied</h1>
      <p className="mt-2 text-sm text-[var(--dash-muted)]">
        Your role cannot open that section.
      </p>
      <Link href="/dashboard" className="dash-btn-primary mt-4 inline-flex">
        Back to dashboard
      </Link>
    </div>
  );
}
