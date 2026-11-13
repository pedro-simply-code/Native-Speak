import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardMuiProvider } from "@/components/dashboard/modernize/dashboard-mui-provider";
import { DashboardShell } from "@/components/dashboard/modernize/dashboard-shell";
import { DashboardThemeScope } from "@/components/dashboard/modernize/dashboard-theme-scope";
export async function DashboardAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
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
  );
}
