"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { createElement } from "react";
import {
  ArrowUpRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import type { ContactDetailItem, ContactSectionData } from "@/lib/cms/homepage-sections";
import { isExternalHref } from "@/lib/cms/link-options";
import {
  appContactBand,
  appPanel,
  appSectionContainer,
  siteReveal,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export const CONTACT_DETAIL_ICON_OPTIONS: {
  key: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "mail", label: "Email", icon: Mail },
  { key: "clock", label: "Clock", icon: Clock },
  { key: "map-pin", label: "Location", icon: MapPin },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "globe", label: "Globe", icon: Globe },
];

export function contactDetailIcon(key: string): LucideIcon | null {
  if (!key || key === "none") return null;
  return (
    CONTACT_DETAIL_ICON_OPTIONS.find((option) => option.key === key)?.icon ??
    null
  );
}

function ContactDetailValue({ item }: { item: ContactDetailItem }) {
  const plainClass = "mt-1 text-[15px] text-[#57524a]";
  const linkClass =
    "hover:text-sc-accent mt-1 block text-[15px] font-semibold text-[#15130f] underline underline-offset-4";

  if (item.valueType !== "link") {
    return <p className={plainClass}>{item.value}</p>;
  }

  const href = item.href.trim();
  if (!href) {
    return <p className={plainClass}>{item.value}</p>;
  }

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={linkClass}>
        {item.value}
      </a>
    );
  }

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={linkClass}
      >
        {item.value}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass}>
      {item.value}
    </Link>
  );
}

function ContactDetailsList({ items }: { items: ContactDetailItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-10 space-y-5">
      {items.map((item, index) => {
        const Icon = contactDetailIcon(item.icon);
        return (
          <li key={`${item.label}-${index}`} className="flex items-start gap-4">
            {Icon ? (
              <span className="text-sc-accent-bright flex size-10 shrink-0 items-center justify-center bg-[#15130f]">
                {createElement(Icon, { className: "size-4" })}
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col">
              {item.label.trim() ? (
                <p className="text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase">
                  {item.label}
                </p>
              ) : null}
              <ContactDetailValue item={item} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function HeadlineBlock({
  data,
  asPage,
}: {
  data: ContactSectionData;
  asPage: boolean;
}) {
  const headlineLines = data.headline.split("\n");
  const Heading = asPage ? "h1" : "h2";
  const headingClass = asPage
    ? "mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase"
    : "mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase";

  return (
    <>
      {data.eyebrow ? (
        <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
          {data.eyebrow}
        </p>
      ) : null}
      <Heading className={headingClass}>
        {headlineLines.map((line, index) => (
          <span key={`${line}-${index}`}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </Heading>
      {data.description ? (
        <p
          className={cn(
            "mt-6 text-[16px] leading-relaxed text-[#57524a]",
            asPage ? "max-w-xl" : "max-w-lg",
          )}
        >
          {data.description}
        </p>
      ) : null}
    </>
  );
}

function NextStepsPanel({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  if (steps.length === 0) return null;

  return (
    <div className={cn(appPanel, "mt-10 p-6")}>
      {title.trim() ? (
        <p className="text-sc-accent text-[11px] font-bold tracking-[0.2em] uppercase">
          {title}
        </p>
      ) : null}
      <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#57524a]">
        {steps.map((step, index) => (
          <li key={`${index}-${step.slice(0, 24)}`}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function FaqFootnote({ data }: { data: ContactSectionData }) {
  if (!data.faqLeadIn.trim() && !data.faqLabel.trim()) return null;
  return (
    <p className="mt-6 text-[13px] text-[#6f6a60]">
      {data.faqLeadIn.trim() ? `${data.faqLeadIn.trim()} ` : null}
      {data.faqLabel.trim() ? (
        <Link
          href={data.faqHref.trim() || "/faq"}
          target={data.faqNewTab ? "_blank" : undefined}
          rel={data.faqNewTab ? "noreferrer noopener" : undefined}
          className="hover:text-sc-accent underline underline-offset-4"
        >
          {data.faqLabel}
        </Link>
      ) : null}
      .
    </p>
  );
}

function BandFaqLink({ data }: { data: ContactSectionData }) {
  if (!data.faqLabel.trim()) return null;
  return (
    <Link
      href={data.faqHref.trim() || "/faq"}
      target={data.faqNewTab ? "_blank" : undefined}
      rel={data.faqNewTab ? "noreferrer noopener" : undefined}
      className="hover:text-sc-accent mt-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors"
    >
      {data.faqLabel}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}

export function ContactSection({
  data,
  className,
  introOverride,
  detailsOverride,
  nextStepsOverride,
  faqFootnoteOverride,
}: {
  data: ContactSectionData;
  className?: string;
  introOverride?: ReactNode;
  detailsOverride?: ReactNode;
  nextStepsOverride?: ReactNode;
  faqFootnoteOverride?: ReactNode;
}) {
  const isPage = data.layout === "page";

  if (isPage) {
    return (
      <section
        id="contact"
        className={cn(
          "bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24",
          className,
        )}
      >
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className={siteReveal}>
            {introOverride ?? <HeadlineBlock data={data} asPage />}
            {data.showContactDetails
              ? (detailsOverride ?? (
                  <ContactDetailsList items={data.contactDetails} />
                ))
              : null}
            {data.showNextSteps
              ? (nextStepsOverride ?? (
                  <NextStepsPanel
                    title={data.nextStepsTitle}
                    steps={data.nextSteps}
                  />
                ))
              : null}
            {faqFootnoteOverride ?? <FaqFootnote data={data} />}
          </div>
          {data.showForm ? (
            <div className={siteReveal}>
              <ContactForm />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className={cn(appContactBand, className)}>
      <div className={appSectionContainer}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
          <div className={siteReveal}>
            {introOverride ?? (
              <>
                <HeadlineBlock data={data} asPage={false} />
                <BandFaqLink data={data} />
              </>
            )}
          </div>
          {data.showForm ? (
            <div className={siteReveal}>
              <ContactForm />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
