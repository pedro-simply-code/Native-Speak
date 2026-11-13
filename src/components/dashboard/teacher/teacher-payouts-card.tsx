import { listTeacherPayoutsSelf } from "@/server/actions/payouts";

export async function TeacherPayoutsCard() {
  const rows = await listTeacherPayoutsSelf();
  const pending = rows.filter((r) => r.status === "pending");
  const paid = rows.filter((r) => r.status === "paid");
  const pendingSum = pending.reduce((s, r) => s + r.amountCents, 0);

  return (
    <div className="dash-card p-5 text-sm">
      <h2 className="text-sm font-bold">Earnings</h2>
      <p className="mt-2">
        Pending: <strong>${(pendingSum / 100).toFixed(2)}</strong> (
        {pending.length} classes)
      </p>
      <p className="text-[var(--dash-muted)]">
        Paid: {paid.length} payout(s). Admin marks transfers in Teacher payouts.
      </p>
    </div>
  );
}
