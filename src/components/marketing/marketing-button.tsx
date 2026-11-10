import Link from "next/link";

type MarketingButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "soft" | "ghost";
  /** Header toolbar uses `sm` to match phone pill height. */
  size?: "default" | "sm";
  className?: string;
};

const sizeClass: Record<NonNullable<MarketingButtonProps["size"]>, string> = {
  default: "px-6 py-3 text-sm",
  sm: "mk-header-action px-4 text-sm",
};

const variantClass: Record<NonNullable<MarketingButtonProps["variant"]>, string> =
  {
    primary:
      "mk-btn-glow bg-[var(--theme-primary-deep)] text-white hover:brightness-95",
    soft:
      "bg-[var(--theme-surface)] text-[var(--theme-primary-deep)] border border-[var(--theme-line)] hover:border-[var(--theme-line-strong)] hover:bg-[var(--theme-paper)]",
    ghost: "text-[var(--theme-primary-deep)] hover:bg-[var(--theme-surface)]",
  };

export function MarketingButton({
  href,
  children,
  variant = "primary",
  size = "default",
  className = "",
}: MarketingButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center font-semibold transition-colors ${sizeClass[size]} ${variantClass[variant]} ${className}`}
      style={{ borderRadius: "var(--theme-radius-button)" }}
    >
      {children}
    </Link>
  );
}
