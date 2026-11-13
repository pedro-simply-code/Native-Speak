import { LocaleCookieSync } from "@/components/i18n/locale-cookie-sync";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mk-public-shell flex flex-1 flex-col text-[var(--theme-ink)]">
      <LocaleCookieSync />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
