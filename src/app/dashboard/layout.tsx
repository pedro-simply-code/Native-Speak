import Link from "next/link";

const settingsNav = [
  { href: "/dashboard/settings/appearance", label: "Appearance" },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--theme-paper)] text-[var(--theme-ink)]">
      <header
        className="border-b"
        style={{
          borderColor: "var(--theme-line)",
          borderWidth: "0 0 var(--theme-border-width)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-[var(--theme-content-max)] items-center justify-between gap-4 px-6 py-4"
        >
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--theme-primary-deep)]"
            >
              Native Speak
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-muted)]">
              Dashboard
            </span>
          </div>
          <nav className="text-sm text-[var(--theme-muted)]">
            <span>Admin preview</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[var(--theme-content-max)] flex-1 gap-10 px-6 py-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-muted)]">
            Settings
          </p>
          <p className="mt-1 text-xs text-[var(--theme-muted)]">
            Will move to Admin → Site settings in production.
          </p>
          <ul className="mt-4 space-y-1">
            {settingsNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-[var(--theme-radius-sm)] px-3 py-2 text-sm font-semibold text-[var(--theme-primary-deep)] hover:bg-[var(--theme-surface)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
