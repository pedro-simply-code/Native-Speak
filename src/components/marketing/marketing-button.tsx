import Link from "next/link";
import type { ReactNode } from "react";

type MarketingButtonVariant = "primary" | "soft" | "ghost";
type MarketingButtonSize = "default" | "sm";

type MarketingButtonCommon = {
  children: ReactNode;
  variant?: MarketingButtonVariant;
  /** Header toolbar uses `sm` to match phone pill height. */
  size?: MarketingButtonSize;
  className?: string;
};

export type MarketingButtonProps = MarketingButtonCommon &
  (
    | { href: string; type?: never; disabled?: never }
    | {
        href?: undefined;
        type?: "button" | "submit";
        disabled?: boolean;
        onClick?: () => void;
      }
  );

const sizeClass: Record<MarketingButtonSize, string> = {
  default: "px-6 py-3 text-sm",
  sm: "mk-header-action px-4 text-sm",
};

const variantClass: Record<MarketingButtonVariant, string> = {
  primary:
    "mk-btn-glow bg-[var(--theme-primary-deep)] text-white hover:brightness-95",
  soft:
    "bg-[var(--theme-surface)] text-[var(--theme-primary-deep)] border border-[var(--theme-line)] hover:border-[var(--theme-line-strong)] hover:bg-[var(--theme-paper)]",
  ghost: "text-[var(--theme-primary-deep)] hover:bg-[var(--theme-surface)]",
};

function marketingButtonClassName({
  variant = "primary",
  size = "default",
  className = "",
}: MarketingButtonCommon) {
  return `inline-flex items-center justify-center font-semibold transition-colors ${sizeClass[size]} ${variantClass[variant]} ${className}`;
}

const buttonRadius = { borderRadius: "var(--theme-radius-button)" } as const;

export function MarketingButton(props: MarketingButtonProps) {
  const { children, variant, size, className } = props;
  const classes = marketingButtonClassName({
    children,
    variant,
    size,
    className,
  });

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} style={buttonRadius}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={classes}
      style={buttonRadius}
    >
      {children}
    </button>
  );
}
