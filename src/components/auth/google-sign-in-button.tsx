"use client";

import { signIn, signOut } from "next-auth/react";

export function GoogleSignInButton({
  label = "Continue with Google",
  callbackUrl = "/dashboard",
  loginHint,
}: {
  label?: string;
  callbackUrl?: string;
  /** Suggests this Google account on the next OAuth screen (from the email field). */
  loginHint?: string;
}) {
  const hint = loginHint?.trim().toLowerCase();

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm font-semibold"
        style={{ borderColor: "var(--theme-line)" }}
        onClick={async () => {
          // Always drop the current session first. Auth.js links an unknown
          // Google identity to whoever owns the session cookie, which is how a
          // different Google account ended up inside the previous user.
          await signOut({ redirect: false });
          await signIn("google", {
            callbackUrl,
            authorizationParams: {
              prompt: "select_account",
              ...(hint && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hint)
                ? { login_hint: hint }
                : {}),
            },
          });
        }}
      >
        {label}
      </button>
      <p className="text-center text-xs text-[var(--theme-muted)]">
        Google opens in a new step — pick the account that matches your email.
        If you only see another person, choose &quot;Use another account&quot;.
      </p>
    </div>
  );
}
