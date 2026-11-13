import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Slightly smaller wordmark (footer, compact rows). */
  compact?: boolean;
};

export function BrandLogo({
  href = "/",
  className = "",
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center ${className}`}
    >
      <span
        className={`font-[family-name:var(--font-display)] font-semibold tracking-[-0.03em] text-[var(--theme-primary-deep)] transition-colors duration-200 group-hover:text-[var(--theme-primary)] ${
          compact ? "text-lg" : "text-xl sm:text-[1.35rem]"
        }`}
      >
        Native Speak
      </span>
    </Link>
  );
}
