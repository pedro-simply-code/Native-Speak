import { redirect } from "next/navigation";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { AppI18nProvider } from "@/components/i18n/app-i18n-provider";
import { DashboardMuiProvider } from "@/components/dashboard/modernize/dashboard-mui-provider";
import { DashboardShell } from "@/components/dashboard/modernize/dashboard-shell";
import { DashboardThemeScope } from "@/components/dashboard/modernize/dashboard-theme-scope";
import { getServerLocale } from "@/lib/i18n/locale.server";
import "@/app/dashboard/dashboard.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-dashboard-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const locale = await getServerLocale();

  return (
    <AuthSessionProvider>
      <div
        className={`${plusJakarta.variable} ${fraunces.variable} min-h-dvh w-full`}
      >
        <AppI18nProvider initialLocale={locale}>
          <DashboardThemeScope>
            <DashboardMuiProvider>
              <DashboardShell
                user={{
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                  roles: session.user.roles ?? [],
                }}
              >
                {children}
              </DashboardShell>
            </DashboardMuiProvider>
          </DashboardThemeScope>
        </AppI18nProvider>
      </div>
    </AuthSessionProvider>
  );
}
