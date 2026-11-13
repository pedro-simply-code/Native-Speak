import { NextResponse } from "next/server";
import { edgeAuth } from "@/auth.edge";
import {
  clearSessionCookies,
  hasSessionCookie,
  stripSessionCookies,
} from "@/lib/auth/session-cookie";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(self)",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

function withSecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  return response;
}

export default edgeAuth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Starting an OAuth flow must never carry the current session cookie: Auth.js
  // links an unknown provider identity to the signed-in user when the callback
  // request still has one, regardless of `allowDangerousEmailAccountLinking`.
  if (pathname.startsWith("/api/auth/signin/")) {
    const response = NextResponse.next({
      request: { headers: stripSessionCookies(req.headers) },
    });
    return withSecurityHeaders(clearSessionCookies(response));
  }

  if (pathname.startsWith("/api/auth/callback/")) {
    return withSecurityHeaders(
      NextResponse.next({
        request: { headers: stripSessionCookies(req.headers) },
      }),
    );
  }

  // Drop cookies that can no longer produce a session (revoked, malformed, or
  // minted before session tracking). Without this the browser keeps replaying
  // a dead token after the identity repair.
  if (!session && hasSessionCookie(req.headers)) {
    return withSecurityHeaders(clearSessionCookies(NextResponse.next()));
  }

  // Only gate unauthenticated access here. Roles are authoritative in the
  // database and are checked in the Node.js layouts — never trust the JWT copy,
  // which can be stale until the next session read.
  if (pathname.startsWith("/dashboard") && !session?.user) {
    const login = new URL("/login", nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return withSecurityHeaders(NextResponse.redirect(login));
  }

  return withSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo/).*)"],
};
