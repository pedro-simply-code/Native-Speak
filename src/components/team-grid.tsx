import type { TeamMember } from "@/cms-seed-content/team";

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <div key={m.name} className="rounded-lg border p-4">
          <p className="font-semibold">{m.name}</p>
          <p className="text-sm text-[var(--theme-muted)]">{m.role}</p>
        </div>
      ))}
    </div>
  );
}
