"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  pricingClassTypeOptions,
  pricingDurationOptions,
  pricingTiers,
  type PricingBadge,
  type PricingClassType,
  type PricingDuration,
  type PricingPlan,
} from "@/lib/marketing/pricing-content";
import { useMarketingContent } from "@/lib/i18n/hooks/use-marketing-content";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { Reveal } from "@/components/marketing/reveal";

function badgeLabel(badge: PricingBadge, ui: { badgePopular: string; badgeValue: string }) {
  return badge === "popular" ? ui.badgePopular : ui.badgeValue;
}

function PlanCard({
  plan,
  siteNav,
  ui,
}: {
  plan: PricingPlan;
  siteNav: { loginHref: string; trialHref: string };
  ui: {
    badgePopular: string;
    badgeValue: string;
    buildQuote: string;
    tryFreeClass: string;
    pricingTotal: string;
  };
}) {
  return (
    <article className="mk-card mk-card--lift relative flex h-full flex-col p-6">
      {plan.badge ? (
        <p
          className="absolute right-4 top-4 rounded-[var(--theme-radius-button)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: "var(--theme-primary-deep)" }}
        >
          {badgeLabel(plan.badge, ui)}
        </p>
      ) : null}
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--theme-muted)]">
        {plan.countLabel}
      </p>
      <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold capitalize text-[var(--theme-ink)]">
        {plan.subtitle}
      </h3>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--theme-primary-deep)]">
        ${plan.pricePerClass}
        <span className="text-sm font-normal text-[var(--theme-muted)]">
          {" "}
          {plan.pricePerClassSuffix}
        </span>
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--theme-ink)]">
        {ui.pricingTotal}: ${plan.total.toLocaleString("en-US")}
      </p>
      {plan.perStudentLine ? (
        <p className="mt-1 text-xs text-[var(--theme-accent)]">
          {plan.perStudentLine}
        </p>
      ) : null}
      <ul className="mt-5 flex-1 space-y-2 text-sm text-[var(--theme-muted)]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--theme-accent)" }}
            />
            {feature}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-[var(--theme-muted)]">{plan.monthlyNote}</p>
      <div className="mt-5 flex flex-col gap-2">
        <MarketingButton href={siteNav.loginHref} size="sm" className="w-full justify-center">
          {ui.buildQuote}
        </MarketingButton>
        <MarketingButton href={siteNav.trialHref} size="sm" variant="soft" className="w-full justify-center">
          {ui.tryFreeClass}
        </MarketingButton>
      </div>
    </article>
  );
}

export function PricingPlanPicker() {
  const m = useMarketingContent();
  const [duration, setDuration] = useState<PricingDuration>(25);
  const [classType, setClassType] = useState<PricingClassType>("oneOnOne");

  const tier = useMemo(
    () => pricingTiers[`${duration}-${classType}`],
    [duration, classType],
  );

  const steps = m.pricingPage.steps;

  return (
    <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
      <div className="space-y-10">
        <section
          className="border-b pb-10"
          style={{ borderColor: "var(--theme-line)" }}
        >
          <p className="mk-eyebrow">
            {m.ui.stepLabel.replace("{n}", "1")}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)] sm:text-2xl">
            {steps[0]}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {pricingDurationOptions.map((option) => {
              const selected = duration === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDuration(option.id)}
                  className="px-4 py-2 text-sm font-semibold transition-colors"
                  style={{
                    borderRadius: "var(--theme-radius-button)",
                    background: selected
                      ? "var(--theme-primary-deep)"
                      : "var(--theme-surface)",
                    color: selected ? "#fff" : "var(--theme-primary-deep)",
                    border: selected
                      ? "none"
                      : "var(--theme-border-width) solid var(--theme-line)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="border-b pb-10"
          style={{ borderColor: "var(--theme-line)" }}
        >
          <p className="mk-eyebrow">
            {m.ui.stepLabel.replace("{n}", "2")}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)] sm:text-2xl">
            {steps[1]}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {pricingClassTypeOptions.map((option) => {
              const selected = classType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setClassType(option.id)}
                  className="flex flex-col px-4 py-3 text-left transition-colors"
                  style={{
                    borderRadius: "var(--theme-radius-button)",
                    background: selected
                      ? "var(--theme-primary-deep)"
                      : "var(--theme-surface)",
                    color: selected ? "#fff" : "var(--theme-primary-deep)",
                    border: selected
                      ? "none"
                      : "var(--theme-border-width) solid var(--theme-line)",
                  }}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span
                    className={`text-xs ${selected ? "text-white/85" : "text-[var(--theme-muted)]"}`}
                  >
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mk-eyebrow">
            {m.ui.stepLabel.replace("{n}", "3")}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)] sm:text-2xl">
            {steps[2]}
          </h2>
          <Reveal className="mt-5">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)] sm:text-xl">
              {tier.sectionTitle}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--theme-muted)]">
              {tier.intro}{" "}
              <Link
                href="/how-it-works#faq"
                className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
              >
                {m.ui.faqLink}
              </Link>
              .
            </p>
          </Reveal>

          <ul className="mt-8 grid gap-6 lg:grid-cols-3">
            {tier.plans.map((plan, index) => (
              <li key={plan.classCount} className="h-full">
                <Reveal delayMs={index * 60} className="h-full">
                  <PlanCard plan={plan} siteNav={m.siteNav} ui={m.ui} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
