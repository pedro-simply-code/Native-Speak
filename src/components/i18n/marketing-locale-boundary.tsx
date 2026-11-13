import { Suspense } from "react";
import { getMarketingContentForRequest } from "@/lib/i18n/marketing/server";
import type { MarketingContent } from "@/lib/i18n/marketing";

async function MarketingLocaleResolver({
  children,
}: {
  children: (m: MarketingContent) => React.ReactNode;
}) {
  const m = await getMarketingContentForRequest();
  return <>{children(m)}</>;
}

export function MarketingLocaleBoundary({
  children,
  fallback,
}: {
  children: (m: MarketingContent) => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback ?? null}>
      <MarketingLocaleResolver>{children}</MarketingLocaleResolver>
    </Suspense>
  );
}
