import { auth } from "@/auth";
import { BillingRefundButton } from "@/components/dashboard/billing-refund-button";
import {
  listAllPayments,
  listPaymentsForUser,
} from "@/server/queries/dashboard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function noticeFromParams(
  params: Record<string, string | string[] | undefined>,
): string | null {
  if (params.simulated === "1") {
    const provider = String(params.provider ?? "stripe");
    return provider === "paypal"
      ? "PayPal payment simulated — marked as succeeded."
      : "Stripe payment simulated — marked as succeeded.";
  }
  if (params.success === "paypal") return "PayPal payment completed.";
  if (params.status === "success") return "Payment completed.";
  if (params.status === "pending") {
    return "Payment is processing — Stripe will confirm it shortly.";
  }
  if (params.status === "canceled") return "Payment canceled.";
  if (params.status === "error") {
    const reason = String(params.error ?? "");
    if (reason === "invalid_session") {
      return "Payment error: this checkout does not belong to your account.";
    }
    if (reason === "not_configured") return "Payment error: Stripe is not configured.";
    if (reason === "missing_session") return "Payment error: missing checkout session.";
    return "Payment error: we could not verify the Stripe payment.";
  }
  if (params.error) return `Payment error: ${String(params.error)}`;
  return null;
}

export async function BillingPaymentSection({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const notice = noticeFromParams(params);

  const roles = session?.user?.roles ?? [];
  const rows =
    roles.includes("admin")
      ? await listAllPayments()
      : session?.user?.id
        ? await listPaymentsForUser(session.user.id)
        : [];

  return (
    <>
      {notice ? (
        <p className="mt-3 text-sm font-medium text-[var(--dash-muted)]">
          {notice}
        </p>
      ) : null}
      <div className="dash-card mt-8 overflow-x-auto">
        <h2 className="mb-3 text-sm font-bold">Payment history</h2>
        <table className="dash-table">
          <thead>
            <tr>
              {roles.includes("admin") ? <th>User</th> : null}
              <th>Package</th>
              <th>Amount</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Date</th>
              {!roles.includes("admin") ? <th>Refund</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={roles.includes("admin") ? 6 : 6}
                  className="text-[var(--dash-muted)]"
                >
                  No payments recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const label =
                  "metadata" in row && row.metadata?.label
                    ? row.metadata.label
                    : "—";
                const userEmail =
                  "userEmail" in row ? row.userEmail : undefined;
                return (
                  <tr key={row.id}>
                    {roles.includes("admin") ? (
                      <td>{userEmail ?? "—"}</td>
                    ) : null}
                    <td>{label}</td>
                    <td>
                      ${(row.amountCents / 100).toFixed(2)} {row.currency}
                    </td>
                    <td>{row.provider}</td>
                    <td>{row.status}</td>
                    <td>{row.createdAt.toLocaleString()}</td>
                    {!roles.includes("admin") ? (
                      <td>
                        {row.status === "succeeded" ? (
                          <BillingRefundButton paymentId={row.id} />
                        ) : (
                          "—"
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
