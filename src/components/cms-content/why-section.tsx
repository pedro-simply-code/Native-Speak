import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Layers, Ruler, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  WhyBuildStep,
  WhyFeature,
  WhySectionData,
} from "@/lib/cms/homepage-sections";
import { appSectionBand, appSectionContainer, siteMotionLift, siteReveal } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<WhyFeature["icon"], LucideIcon> = {
  ruler: Ruler,
  layers: Layers,
  zap: Zap,
};

const STEP_STATUS = {
  done: { label: "✓ Done", tone: "text-white/30" },
  active: { label: "In Progress", tone: "text-sc-accent-bright" },
  queued: { label: "Queued", tone: "text-white/20" },
} as const;

function FeatureRow({ feature }: { feature: WhyFeature }) {
  const Icon = FEATURE_ICONS[feature.icon] ?? Ruler;
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-bold tracking-tight">{feature.title}</h3>
        <p className="text-[14px] leading-relaxed text-[#57524a]">
          {feature.summary}
        </p>
      </div>
    </div>
  );
}

function BuildPanel({
  title,
  titleOverride,
  steps,
}: {
  title: string;
  titleOverride?: ReactNode;
  steps: WhyBuildStep[];
}) {
  return (
    <div className={cn(siteReveal, siteMotionLift, "relative flex min-h-[360px] flex-col overflow-hidden rounded-lg bg-[#15130f] text-white shadow-[0_8px_32px_rgba(21,19,15,0.2)] ring-1 ring-white/10 sm:min-h-[390px]")}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </div>
        <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/45 uppercase">
          <span className="bg-sc-accent-bright size-1.5 animate-pulse rounded-full" />
          {titleOverride ?? title}
        </p>
      </div>
      <div className="relative flex-1 overflow-hidden p-5 font-mono text-[12px] leading-relaxed sm:p-6 sm:text-[13px]">
        <div className="sc-scan pointer-events-none absolute inset-x-0 top-0 h-24" />
        <ul className="space-y-2.5">
          {steps.map((step) => {
            const status = STEP_STATUS[step.status];
            return (
              <li key={step.label} className="flex items-center gap-3">
                <span className="shrink-0 text-white/30">$</span>
                <span
                  className={cn(
                    "min-w-0 flex-1 break-words",
                    step.status === "queued" ? "text-white/40" : "text-white",
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-bold tracking-[0.14em] uppercase",
                    status.tone,
                  )}
                >
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center gap-3">
          <span className="shrink-0 text-white/30">$</span>
          <span className="bg-sc-accent-bright inline-block h-4 w-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function WhySection({
  data,
  className,
  introOverride,
  afterFeaturesOverride,
  featuresSlot,
  buildPanelTitleOverride,
}: {
  data: WhySectionData;
  className?: string;
  introOverride?: ReactNode;
  /** Studio editor: editable link row after the feature list. */
  afterFeaturesOverride?: ReactNode;
  featuresSlot?: ReactNode;
  buildPanelTitleOverride?: ReactNode;
}) {
  const headlineLines = data.headline.split("\n");

  const linkBlock =
    !data.showLink
      ? null
      : afterFeaturesOverride ??
        (data.linkLabel.trim() ? (
      <Link
        href={data.linkHref.trim() || "#"}
        target={data.linkNewTab ? "_blank" : undefined}
        rel={data.linkNewTab ? "noreferrer noopener" : undefined}
        className="hover:text-sc-accent mt-8 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors"
      >
        {data.linkLabel} <ArrowUpRight className="size-3.5" />
      </Link>
    ) : null);

  return (
    <section className={cn(appSectionBand, className)}>
      <div className={appSectionContainer}>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className={siteReveal}>
            {introOverride ?? (
              <>
                {data.eyebrow ? (
                  <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                    {data.eyebrow}
                  </p>
                ) : null}
                <h2 className="mt-5 text-[clamp(1.85rem,4.1vw,3.05rem)] leading-[1.04] font-black tracking-[-0.03em] uppercase">
                  {headlineLines.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {index > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </h2>
                {data.description ? (
                  <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                    {data.description}
                  </p>
                ) : null}
              </>
            )}
            <div className="mt-10 space-y-6">
              {featuresSlot ??
                data.features.map((feature) => (
                  <FeatureRow key={feature.title} feature={feature} />
                ))}
            </div>
            {linkBlock}
          </div>
          {data.showBuildPanel ? (
            <BuildPanel
              title={data.panelTitle}
              titleOverride={buildPanelTitleOverride}
              steps={data.buildSteps}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
