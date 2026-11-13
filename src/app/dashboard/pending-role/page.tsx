export default function PendingRolePage() {
  return (
    <div className="dash-card p-8">
      <h1 className="text-xl font-bold">Account pending</h1>
      <p className="mt-2 text-sm text-[var(--dash-muted)]">
        Your user exists but no role has been assigned yet. Contact an admin or
        complete an invite link.
      </p>
    </div>
  );
}
