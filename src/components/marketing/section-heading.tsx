type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleAs?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleAs: TitleTag = "h2",
}: SectionHeadingProps) {
  const alignClass =
    align === "center" ? "text-center mx-auto items-center" : "text-left";

  return (
    <header className={`flex max-w-3xl flex-col gap-3 ${alignClass}`}>
      {eyebrow ? <p className="mk-eyebrow">{eyebrow}</p> : null}
      <TitleTag className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--theme-ink)] sm:text-4xl">
        {title}
      </TitleTag>
      {description ? (
        <p className="text-lg leading-relaxed text-[var(--theme-muted)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
