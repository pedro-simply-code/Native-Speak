"use client";

type StaticDemoFormProps = {
  submitLabel: string;
  showPassword?: boolean;
};

export function StaticDemoForm({
  submitLabel,
  showPassword = false,
}: StaticDemoFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-muted)]">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 w-full border bg-[var(--theme-paper)] px-4 py-3 text-sm text-[var(--theme-ink)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--theme-primary)]/25"
          style={{
            borderColor: "var(--theme-line)",
            borderRadius: "var(--theme-radius-md)",
            borderWidth: "var(--theme-border-width)",
            boxShadow: "var(--theme-shadow-sm)",
          }}
        />
      </label>
      {showPassword ? (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-muted)]">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1 w-full border bg-[var(--theme-paper)] px-4 py-3 text-sm text-[var(--theme-ink)] outline-none"
            style={{
              borderColor: "var(--theme-line)",
              borderRadius: "var(--theme-radius-md)",
              borderWidth: "var(--theme-border-width)",
            }}
          />
        </label>
      ) : (
        <>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-muted)]">
              Learner name
            </span>
            <input
              type="text"
              name="learner"
              placeholder="First name"
              className="mt-1 w-full border bg-[var(--theme-paper)] px-4 py-3 text-sm outline-none"
              style={{
                borderColor: "var(--theme-line)",
                borderRadius: "var(--theme-radius-md)",
                borderWidth: "var(--theme-border-width)",
              }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--theme-muted)]">
              Program interest
            </span>
            <select
              name="program"
              className="mt-1 w-full border bg-[var(--theme-paper)] px-4 py-3 text-sm outline-none"
              style={{
                borderColor: "var(--theme-line)",
                borderRadius: "var(--theme-radius-md)",
                borderWidth: "var(--theme-border-width)",
              }}
              defaultValue="elementary"
            >
              <option value="preschool">Preschool</option>
              <option value="elementary">Elementary</option>
              <option value="middle">Middle school</option>
              <option value="high">High school</option>
              <option value="adults">Adults</option>
            </select>
          </label>
        </>
      )}
      <button
        type="submit"
        className="w-full px-6 py-3 text-sm font-semibold text-white transition-colors"
        style={{
          borderRadius: "var(--theme-radius-button)",
          background: "var(--theme-primary-deep)",
        }}
      >
        {submitLabel}
      </button>
      <p className="text-xs text-[var(--theme-muted)]">
        Static demo — form does not submit yet.
      </p>
    </form>
  );
}
