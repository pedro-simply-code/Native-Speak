import type { NextResponse } from "next/server";

/**
 * Every cookie Auth.js may use to keep a browser signed in. Chunked session
 * tokens are stored as `authjs.session-token.0`, `.1`, … so names are matched
 * by prefix.
 */
const SESSION_COOKIE_BASES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function isSessionCookieName(name: string) {
  return SESSION_COOKIE_BASES.some(
    (base) => name === base || name.startsWith(`${base}.`),
  );
}

function cookieName(part: string) {
  const eq = part.indexOf("=");
  return eq === -1 ? "" : part.slice(0, eq).trim();
}

function splitCookieHeader(header: string) {
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Removes the session cookie from a request so Auth.js cannot attach an OAuth
 * identity to the already signed-in user. This is the only reliable way to
 * stop implicit account linking: `allowDangerousEmailAccountLinking: false`
 * only guards email matching, not an existing session.
 */
export function stripSessionCookies(headers: Headers): Headers {
  const cookie = headers.get("cookie");
  if (!cookie) return headers;

  const kept = splitCookieHeader(cookie).filter((part) => {
    return !isSessionCookieName(cookieName(part));
  });

  const next = new Headers(headers);
  if (kept.length > 0) next.set("cookie", kept.join("; "));
  else next.delete("cookie");
  return next;
}

/** True when the forwarded request still carries an Auth.js session token. */
export function hasSessionCookie(headers: Headers): boolean {
  const cookie = headers.get("cookie");
  if (!cookie) return false;
  return splitCookieHeader(cookie).some((part) => {
    return isSessionCookieName(cookieName(part));
  });
}

/** Expires every Auth.js session cookie on the outgoing response. */
export function clearSessionCookies(
  response: NextResponse,
  secure = process.env.NODE_ENV === "production",
) {
  for (const base of SESSION_COOKIE_BASES) {
    response.cookies.set(base, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure,
    });
    // Chunked tokens leave `.0`, `.1`, … cookies behind.
    for (let index = 0; index < 8; index += 1) {
      response.cookies.set(`${base}.${index}`, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure,
      });
    }
  }
  return response;
}
