import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StudioCard({
  className,
  children,
  title: _title,
  description: _description,
  padded: _padded,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
  description?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--dash-border)] bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StudioSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string },
) {
  const { className, ...rest } = props;
  return (
    <select
      className={cn(
        "w-full rounded-md border border-[var(--dash-border)] bg-white px-3 py-2 text-sm",
        className,
      )}
      {...rest}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </span>
      {children}
      {hint ? <p className="text-xs text-[var(--dash-muted)]">{hint}</p> : null}
    </label>
  );
}

export function StudioInput(
  props: InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
  },
) {
  const { className, ...rest } = props;
  return (
    <input
      className={cn(
        "w-full rounded-md border border-[var(--dash-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-primary-light)]",
        className,
      )}
      {...rest}
    />
  );
}

export function StudioTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string },
) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-[var(--dash-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-primary-light)]",
        className,
      )}
      {...rest}
    />
  );
}
