import Link from "next/link";

type BrandLogoProps = {
  showWordmark?: boolean;
  href?: string;
  className?: string;
  markSize?: number;
};

/** Capital N with a speaking profile on the left stem. */
export function BrandLogo({
  showWordmark = true,
  href = "/",
  className = "",
  markSize = 36,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-3.5 sm:gap-4 ${className}`}
    >
      <span
        className="flex shrink-0 items-center justify-center text-[var(--theme-primary-deep)] transition-transform duration-300 group-hover:scale-105"
        style={{
          width: markSize,
          height: markSize,
          borderRadius: "var(--theme-radius-md)",
          background: "var(--theme-surface)",
          border: "var(--theme-border-width) solid var(--theme-line-strong)",
        }}
      >
        <BrandMarkSvg size={markSize - 10} />
      </span>
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--theme-primary-deep)]">
          Native Speak
        </span>
      ) : null}
    </Link>
  );
}

export function BrandMarkSvg({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Native Speak"
    >
      <path
        d="M12 38V12"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M12 38 33 12"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M33 12v26"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Profile on the left leg (facing right, speaking) */}
      <path
        d="M12 15.5c1.2-1.4 4-1.2 5.2 1.2.7 1.5.6 3.2-.2 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="13.6" cy="17.2" r="1.25" fill="currentColor" />
      <path
        d="M15.5 23.8c1.8 1.5 4 1.2 5.6-.2"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20.5 22.2c2.6-1 4.8-.2 6.8 1.4"
        stroke="var(--theme-accent)"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M21 25.5c3-.7 5.6.4 7.5 2.5"
        stroke="var(--theme-accent)"
        strokeWidth="1.55"
        strokeLinecap="round"
        opacity="0.88"
      />
      <path
        d="M21.2 28.8c3.4-.4 6.2 1 8 3"
        stroke="var(--theme-accent)"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
