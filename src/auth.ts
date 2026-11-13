import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { ensureDefaultRolesForUser } from "@/lib/auth/assign-roles";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import type { AppRole } from "@/lib/auth/roles";
import { pickPrimaryRole } from "@/lib/auth/roles";
import {
  findUserByEmail,
  userToSessionShape,
  verifyPasswordForUser,
} from "@/lib/security/credentials";
import { consumeLoginProof } from "@/lib/security/login-proof";
import { verifyEmailLoginCode } from "@/lib/security/otp";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { recordSecurityAudit } from "@/lib/security/audit";
import { hasSessionCookie } from "@/lib/auth/session-cookie";
import {
  isWebSessionValid,
  registerWebSession,
  touchWebSession,
} from "@/lib/security/sessions";
import { env } from "@/env.js";
import { getDb } from "@/server/db";
import {
  accounts,
  familyProfiles,
  sessions,
  userRoles,
  users,
  verificationTokens,
} from "@/server/db/schema";

async function loadUserRoles(userId: string): Promise<AppRole[]> {
  const db = getDb();
  const rows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));
  return rows.map((r) => r.role as AppRole);
}

async function loadUserProfile(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

function authAdapter() {
  if (!env.DATABASE_URL) return undefined;
  return DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });
}

/** True when the OAuth callback request still carries a session cookie. */
async function requestHasSessionCookie() {
  try {
    const h = await headers();
    return hasSessionCookie(new Headers(h as unknown as HeadersInit));
  } catch {
    return false;
  }
}

const authSecret =
  env.AUTH_SECRET ??
  (env.NODE_ENV === "production"
    ? undefined
    : "dev-only-auth-secret-min-32-chars-long!");

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  adapter: authAdapter(),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false,
            authorization: {
              params: {
                /** Always show Google's account picker (don't silent-sign-in as last Chrome user). */
                prompt: "select_account",
              },
            },
          }),
        ]
      : []),
    Credentials({
      id: "login-proof",
      name: "Login proof",
      credentials: {
        loginProof: { label: "Proof", type: "text" },
        email: { label: "Email", type: "email" },
      },
      authorize: async (raw) => {
        const loginProof = raw?.loginProof;
        if (!loginProof || typeof loginProof !== "string") return null;
        const userId = await consumeLoginProof(loginProof);
        if (!userId) return null;
        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (!user || user.status === "suspended") return null;
        const proofEmail =
          typeof raw?.email === "string" ? raw.email.trim().toLowerCase() : "";
        if (!proofEmail || user.email.toLowerCase() !== proofEmail) return null;
        const ip = await getClientIp();
        await recordSecurityAudit("auth.session_created", {
          actorUserId: user.id,
          meta: { via: "login-proof" },
          ip,
        });
        return userToSessionShape(user);
      },
    }),
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8).max(128),
          })
          .safeParse(raw);
        if (!parsed.success) return null;

        const ip = await getClientIp();
        const email = parsed.data.email.toLowerCase();
        const limit = await enforceRateLimit(`${email}:${ip}`, {
          bucket: "auth-credentials-legacy",
          limit: 5,
          windowMs: 60 * 1000,
        });
        if (!limit.allowed) return null;

        const result = await verifyPasswordForUser(email, parsed.data.password);
        if (!result.ok) return null;

        if (result.user.twoFactorEnabled) {
          return null;
        }

        return userToSessionShape(result.user);
      },
    }),
    Credentials({
      id: "email-code",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      authorize: async (raw) => {
        const parsed = z
          .object({
            email: z.string().email(),
            code: z.string().min(4).max(12),
          })
          .safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await findUserByEmail(email);
        if (!user || user.status === "suspended") return null;
        if (user.twoFactorEnabled) return null;

        const ok = await verifyEmailLoginCode(email, parsed.data.code.trim());
        if (!ok) return null;

        const db = getDb();
        await db
          .update(users)
          .set({
            emailVerified: user.emailVerified ?? new Date(),
            status: user.status === "pending_verification" ? "active" : user.status,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        return userToSessionShape(user);
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const db = getDb();

      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await ensureDefaultRolesForUser(user.id);

      await db
        .insert(familyProfiles)
        .values({ userId: user.id, learnerType: "self" })
        .onConflictDoNothing({ target: familyProfiles.userId });
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const db = getDb();
      const googleEmail =
        (typeof profile?.email === "string" && profile.email.toLowerCase()) ||
        (typeof user.email === "string" && user.email.toLowerCase()) ||
        null;

      // Resolve the identity by provider account id, not by the (temporary)
      // user id Auth.js assigns to profiles that are not linked yet.
      const [linked] = account.providerAccountId
        ? await db
            .select({ userId: accounts.userId })
            .from(accounts)
            .where(
              and(
                eq(accounts.provider, account.provider),
                eq(accounts.providerAccountId, account.providerAccountId),
              ),
            )
            .limit(1)
        : [];

      if (!linked) {
        // Auth.js links an unknown OAuth identity to the currently signed-in
        // session user. Refuse that: proxy strips the cookie, this is the
        // second line of defence for bypassed requests.
        if (await requestHasSessionCookie()) {
          const ip = await getClientIp();
          await recordSecurityAudit("auth.google_link_blocked", {
            target: googleEmail ?? account.providerAccountId,
            meta: { attemptedUserId: user.id },
            ip,
          });
          return false;
        }
        // No session: normal sign-up or OAuthAccountNotLinked handling.
        return true;
      }

      const [dbUser] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, linked.userId))
        .limit(1);

      // A linked identity must belong to the same person. This catches a
      // previously corrupted link instead of silently opening that account.
      if (!dbUser) return false;
      if (
        googleEmail &&
        dbUser.email &&
        googleEmail !== dbUser.email.toLowerCase()
      ) {
        const ip = await getClientIp();
        await recordSecurityAudit("auth.google_identity_mismatch", {
          actorUserId: dbUser.id,
          target: googleEmail,
          ip,
        });
        return false;
      }

      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(users.id, dbUser.id));

      await ensureDefaultRolesForUser(dbUser.id);

      const ip = await getClientIp();
      await recordSecurityAudit("auth.google_sign_in", {
        actorUserId: dbUser.id,
        target: googleEmail ?? dbUser.email,
        ip,
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        if (token.sub && token.sub !== user.id) {
          delete token.roles;
          delete token.primaryRole;
          delete token.sid;
          delete token.sv;
        }
        token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
        const reg = await registerWebSession(user.id);
        token.sid = reg.sessionId;
        token.sv = reg.sessionVersion;
        token.invalid = false;
      }

      // Validate on *every* session read. Previously this only ran on specific
      // triggers, so revoking a session never invalidated the live cookie.
      if (token.sub && !token.invalid) {
        if (typeof token.sid !== "string") {
          // Tokens minted before session tracking existed cannot be revoked.
          token.invalid = true;
        } else {
          const valid = await isWebSessionValid({
            userId: token.sub,
            sessionId: token.sid,
            sessionVersion:
              typeof token.sv === "number" ? token.sv : undefined,
          });
          if (!valid) {
            token.invalid = true;
          } else {
            await touchWebSession(token.sid);
          }
        }
      }

      // Returning null makes Auth.js drop the session and clear the cookie.
      // The `session` callback cannot do this: NextAuth falls back to the raw
      // token when it returns a falsy value.
      if (token.invalid) return null;

      return token;
    },
    async session({ session, token }) {
      if (!token.sub) {
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.sub;
        const profile = await loadUserProfile(token.sub);
        if (profile) {
          session.user.email = profile.email;
          session.user.name = profile.name ?? session.user.name;
          session.user.image = profile.image ?? session.user.image;
        } else if (token.email) {
          session.user.email = token.email;
        }
        const roles = await loadUserRoles(token.sub);
        session.user.roles = roles;
        session.user.primaryRole = pickPrimaryRole(roles);
        session.user.sessionId =
          typeof token.sid === "string" ? token.sid : undefined;
      }
      return session;
    },
  },
  trustHost: true,
});
