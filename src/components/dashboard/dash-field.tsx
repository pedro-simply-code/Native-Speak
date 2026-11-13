export function DashField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      {children}
    </label>
  );
}

export const dashInputClass =
  "w-full rounded-md border px-3 py-2 text-sm bg-white";

export function dashInputStyle() {
  return { borderColor: "var(--dash-border)" as const };
}
