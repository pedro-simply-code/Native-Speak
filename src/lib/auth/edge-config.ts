import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config for the proxy only (JWT decode, no Postgres).
 *
 * It intentionally exposes no authorization data: the proxy only decides
 * whether a visitor is authenticated. Roles live in the database and are
 * enforced by the Node.js dashboard layouts.
 */
export const edgeAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dev-only-auth-secret-min-32-chars-long!"),
  callbacks: {
    jwt({ token }) {
      if (token.invalid || !token.sub) {
        // Returning null makes Auth.js treat the request as unauthenticated.
        return null;
      }
      return token;
    },
    session({ session, token }) {
      if (!token.sub) {
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
