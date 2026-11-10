"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function NavLink({ href, children, className = "" }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`mk-nav-link rounded-[var(--theme-radius-sm)] px-2.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "mk-nav-link--active text-[var(--theme-primary-deep)]"
          : "text-[var(--theme-muted)] hover:text-[var(--theme-primary-deep)]"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
