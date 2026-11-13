/** Shown briefly while `cookies()` resolves for dashboard locale (root Suspense). */
export function GlobalLocaleFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-1 items-center justify-center text-sm text-[var(--theme-muted,#5A6A85)]"
      aria-busy="true"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}
