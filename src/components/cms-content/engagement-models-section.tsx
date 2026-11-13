import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { buildLinkRel, isExternalHref } from "@/lib/cms/link-options";
import type { EngagementModelsSectionData } from "@/lib/cms/site-page-sections";
import {
  appAccentBrightButtonMarketingSm,
  siteMotionLift,
  siteReveal,
  siteStagger,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

function EngagementLink({
  href,
  newTab,
  nofollow,
  className,
  children,
}: {
  href: string;
  newTab: boolean;
  nofollow: boolean;
  className?: string;
  children: ReactNode;
}) {
  const target = newTab ? "_blank" : undefined;
  const rel = buildLinkRel({ newTab, nofollow }) ?? undefined;

  if (isExternalHref(href)) {
    return (
      <a href={href} target={target} rel={rel} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} target={target} rel={rel} className={className}>
      {children}
    </Link>
  );
}

/**
 * "Three Ways To Work Together" band, independent from the service blocks.
 */
export function EngagementModelsSection({
  data,
  headerOverride,
  modelsOverride,
  actionsOverride,
}: {
  data: EngagementModelsSectionData;
  /** Studio editor: editable header copy. */
  headerOverride?: ReactNode;
  /** Studio editor: editable model cards. */
  modelsOverride?: ReactNode;
  /** Studio editor: editable button and email links. */
  actionsOverride?: ReactNode;
}) {
  const buttonHref = data.buttonHref.trim() || "/contact";
  const emailHref =
    data.emailHref.trim() ||
    (data.email.trim() ? `mailto:${data.email.trim()}` : "");

  return (
    <section className="bg-[#15130f] py-16 text-white lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        {headerOverride ?? (
          <div className={siteReveal}>
            <p className="text-sc-accent-bright text-[11px] font-bold tracking-[0.24em] uppercase">
              {data.eyebrow}
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
              {data.headline}
            </h2>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed whitespace-pre-wrap text-white/60">
              {data.description}
            </p>
          </div>
        )}

        {modelsOverride ?? (
          <div className={cn(siteStagger, "mt-12 grid gap-6 lg:grid-cols-3")}>
            {data.models.map((model, index) => (
              <div
                key={index}
                className={cn(
                  siteReveal,
                  siteMotionLift,
                  "flex flex-col rounded-lg bg-white/[0.03] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.2)] ring-1 ring-white/10",
                )}
              >
                <span className="text-sc-accent-bright text-[11px] font-bold tracking-[0.2em]">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-xl font-black tracking-tight uppercase">
                  {model.title}
                </h3>
                <p className="mt-4 flex-1 text-[14px] leading-relaxed text-white/60">
                  {model.description}
                </p>
                <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/45">
                  <span className="font-bold tracking-[0.12em] text-white/70 uppercase">
                    Best for:
                  </span>{" "}
                  {model.bestFor}
                </p>
              </div>
            ))}
          </div>
        )}

        {actionsOverride ?? (
          <div
            className={cn(
              siteReveal,
              "mt-12 flex flex-wrap items-center gap-5",
            )}
          >
            {data.buttonLabel.trim() ? (
              <EngagementLink
                href={buttonHref}
                newTab={data.buttonNewTab}
                nofollow={data.buttonNofollow}
                className={appAccentBrightButtonMarketingSm}
              >
                {data.buttonLabel} <ArrowRight className="size-4" />
              </EngagementLink>
            ) : null}
            {emailHref && data.email.trim() ? (
              <EngagementLink
                href={emailHref}
                newTab={data.emailNewTab}
                nofollow={data.emailNofollow}
                className="hover:text-sc-accent-bright text-[14px] font-semibold text-white/70 underline underline-offset-8 transition-colors"
              >
                {data.email}
              </EngagementLink>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
