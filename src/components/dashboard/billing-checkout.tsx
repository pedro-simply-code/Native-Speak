"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { CLASS_PACKAGES } from "@/lib/platform/profile-options";
import { DashboardConfirmDialog } from "@/components/dashboard/modernize/dashboard-confirm-dialog";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

type PayAction =
  | { kind: "stripe"; label: string; packageId: string }
  | { kind: "paypal"; usd: string; label: string; packageId: string };

type BillingMode = {
  stripeSimulated: boolean;
  paypalSimulated: boolean;
};

export function BillingCheckout({ mode }: { mode: BillingMode }) {
  const { t } = useDashboardI18n();
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState<PayAction | null>(null);
  const [loading, setLoading] = useState(false);

  const simulateActive = mode.stripeSimulated || mode.paypalSimulated;

  async function payStripe(packageId: string) {
    setStatus(null);
    const res = await fetch("/api/billing/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const data = (await res.json()) as {
      url?: string;
      error?: string;
      simulated?: boolean;
    };
    if (!res.ok || !data.url) {
      setStatus(data.error ?? t("billing.stripeUnavailable"));
      return;
    }
    window.location.assign(data.url);
  }

  async function payPayPal(usd: string, label: string, packageId: string) {
    setStatus(null);
    const res = await fetch("/api/billing/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsd: usd, label, packageId }),
    });
    const data = (await res.json()) as {
      approveUrl?: string;
      error?: string;
      simulated?: boolean;
    };
    if (!res.ok || !data.approveUrl) {
      setStatus(data.error ?? t("billing.paypalUnavailable"));
      return;
    }
    window.location.assign(data.approveUrl);
  }

  async function onConfirmPay() {
    if (!pending) return;
    setLoading(true);
    try {
      if (pending.kind === "stripe") {
        await payStripe(pending.packageId);
      } else {
        await payPayPal(pending.usd, pending.label, pending.packageId);
      }
    } finally {
      setLoading(false);
      setPending(null);
    }
  }

  const pendingSimulated =
    pending?.kind === "stripe" ? mode.stripeSimulated : mode.paypalSimulated;

  return (
    <>
      {simulateActive ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("billing.simulationBanner")}
        </Alert>
      ) : null}

      <div className="space-y-4">
        {CLASS_PACKAGES.map((pkg) => {
          const usd = (pkg.cents / 100).toFixed(2);
          const stripeNote = mode.stripeSimulated
            ? t("billing.stripeSimulated")
            : t("billing.stripeLive");
          const paypalNote = mode.paypalSimulated
            ? t("billing.paypalSimulated")
            : t("billing.paypalLive");

          return (
            <div
              key={pkg.id}
              className="dash-card flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold">{pkg.label}</p>
                <p className="text-sm text-[var(--dash-muted)]">
                  {pkg.cents === 0
                    ? t("billing.scheduleTrial")
                    : `${stripeNote} · ${paypalNote}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="contained"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  onClick={() => {
                    if (pkg.cents === 0) {
                      setStatus(t("billing.trialHint"));
                      return;
                    }
                    setPending({
                      kind: "stripe",
                      label: pkg.label,
                      packageId: pkg.id,
                    });
                  }}
                >
                  {pkg.cents === 0 ? t("billing.freeTrial") : t("modal.payWithStripe")}
                </Button>
                {pkg.cents > 0 ? (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    onClick={() =>
                      setPending({
                        kind: "paypal",
                        usd,
                        label: pkg.label,
                        packageId: pkg.id,
                      })
                    }
                  >
                    {t("modal.payWithPayPal")}
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
        {status ? <p className="text-sm text-[var(--dash-muted)]">{status}</p> : null}
      </div>

      <DashboardConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={onConfirmPay}
        title={t("modal.confirmPaymentTitle")}
        description={
          pendingSimulated
            ? `${t("billing.confirmSimulated")}${pending ? ` (${pending.label})` : ""}`
            : `${t("modal.confirmPaymentBody")}${pending ? ` (${pending.label})` : ""}`
        }
        confirmLabel={
          pending?.kind === "paypal"
            ? t("modal.payWithPayPal")
            : t("modal.payWithStripe")
        }
        loading={loading}
      />
    </>
  );
}
