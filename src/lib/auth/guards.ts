import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";

/** A session whose user object is guaranteed to exist (and carry an id). */
export type AuthorizedSession = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

/**
 * Server-side access control for dashboard sections.
 *
 * The edge proxy only checks that someone is signed in. Roles can change while
 * a JWT is still alive, so authorization must read the session produced by the
 * Node.js Auth.js config (whose `session` callback loads roles from Postgres).
 */
export async function requireSession(
  callbackUrl = "/dashboard",
): Promise<AuthorizedSession> {
  const session = await auth();
  if (!session?.user?.id) {
    const login = new URLSearchParams({ callbackUrl });
    redirect(`/login?${login.toString()}`);
  }
  return session;
}

/**
 * Requires one of the given roles. Users with no role yet are sent to the
 * pending screen; users with a role but the wrong one get the denied screen.
 */
export async function requireRoles(
  allowed: readonly AppRole[],
  callbackUrl?: string,
): Promise<AuthorizedSession> {
  const session = await requireSession(callbackUrl);
  const roles = session.user.roles ?? [];

  if (roles.length === 0) {
    redirect("/dashboard/pending-role");
  }
  if (!roles.some((role: AppRole) => allowed.includes(role))) {
    redirect("/dashboard/unauthorized");
  }

  return session;
}
