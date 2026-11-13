"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  completeTwoFactorLogin,
  requestEmailLoginCode,
  startEmailCodeLogin,
  startPasswordLogin,
} from "@/server/actions/auth-login";
import { resendVerificationEmail } from "@/server/actions/auth-verify-resend";

type Mode = "password" | "email-code";
type Step = "credentials" | "2fa";

export function LoginForm({
  showGoogle = false,
  callbackUrl: callbackUrlProp,
  authError: authErrorProp,
  emailVerified,
  activeSessionEmail = null,
}: {
  showGoogle?: boolean;
  callbackUrl?: string | null;
  authError?: string | null;
  emailVerified?: boolean;
  /** When set, another account is still signed in (cookie). */
  activeSessionEmail?: string | null;
}) {
  const router = useRouter();
  const callbackUrl = callbackUrlProp ?? "/dashboard";
  const authError = authErrorProp;

  const [mode, setMode] = useState<Mode>("password");
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [twoFactorMethod, setTwoFactorMethod] = useState<"email" | "totp">(
    "email",
  );
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResendVerify, setShowResendVerify] = useState(false);

  const configError =
    authError === "session_revoked"
      ? "This session was signed out. Sign in again."
      : authError === "Configuration"
        ? "La base de datos no tiene las tablas de Auth (p. ej. accounts). Reinicia el servidor: Ctrl+C y luego pnpm dev (aplica el esquema al arrancar). O ejecuta: pnpm db:migrate"
        : authError === "OAuthAccountNotLinked"
          ? "This email is already registered with a password. Sign in with email/password instead."
          : authError === "AccessDenied"
            ? "Google no pudo completar el registro. Reinicia pnpm dev, ejecuta pnpm auth:repair y vuelve a intentar. También puedes usar email y contraseña."
            : authError
              ? "Sign-in failed. Try again or use email and password."
              : null;

  async function ensureNotSignedInAsOtherAccount(targetEmail: string) {
    const current = activeSessionEmail?.trim().toLowerCase();
    const target = targetEmail.trim().toLowerCase();
    if (!current || current === target) return;
    await signOut({ redirect: false });
    router.refresh();
  }

  async function finishSignIn(loginProof: string, userEmail: string) {
    await ensureNotSignedInAsOtherAccount(userEmail);
    await signOut({ redirect: false });
    const res = await signIn("login-proof", {
      loginProof,
      email: userEmail,
      redirect: false,
      callbackUrl,
    });
    if (res?.error) {
      setError("Session could not be started. Try again.");
      return;
    }
    window.location.href = res?.url ?? callbackUrl;
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    await ensureNotSignedInAsOtherAccount(email);
    const result = await startPasswordLogin({ email, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      if (
        activeSessionEmail &&
        activeSessionEmail.toLowerCase() !== email.trim().toLowerCase()
      ) {
        setError(
          `${result.error} You are not signed in as ${email} — if you see another account in the dashboard, that login did not succeed.`,
        );
      }
      setShowResendVerify(
        result.error.toLowerCase().includes("verify your email"),
      );
      return;
    }
    setShowResendVerify(false);
    if (result.step === "2fa") {
      setStep("2fa");
      setChallengeId(result.challengeId);
      setTwoFactorMethod(result.method);
      setInfo(
        result.method === "email"
          ? "We sent a verification code to your email."
          : "Enter the code from your authenticator app.",
      );
      return;
    }
    await finishSignIn(result.loginProof, result.email);
  }

  async function onResendVerification() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await resendVerificationEmail(email);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setInfo(res.message);
  }

  async function onEmailCodeRequest() {
    setLoading(true);
    setError(null);
    setInfo(null);
    const result = await requestEmailLoginCode(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInfo(result.message);
  }

  async function onEmailCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await startEmailCodeLogin({ email, code });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.step === "2fa") {
      setStep("2fa");
      setChallengeId(result.challengeId);
      setTwoFactorMethod(result.method);
      setInfo(
        result.method === "email"
          ? "We sent a verification code to your email."
          : "Enter the code from your authenticator app.",
      );
      return;
    }
    await finishSignIn(result.loginProof, result.email);
  }

  async function onTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await completeTwoFactorLogin({
      challengeId,
      method: twoFactorMethod,
      code: twoFactorCode,
      email,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.step === "session") {
      await finishSignIn(result.loginProof, result.email);
    }
  }

  return (
    <div className="space-y-4">
      {activeSessionEmail ? (
        <div
          className="rounded-[var(--theme-radius-md)] border px-3 py-2.5 text-sm"
          style={{
            borderColor: "var(--theme-line)",
            background: "var(--theme-surface)",
          }}
        >
          <p className="text-[var(--theme-ink)]">
            Signed in as{" "}
            <span className="font-semibold">{activeSessionEmail}</span>.
          </p>
          <button
            type="button"
            className="mt-1 font-semibold text-[var(--theme-primary)] underline"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sign out to use another account
          </button>
        </div>
      ) : null}
      <div
        className="flex gap-1 rounded-[var(--theme-radius-md)] border p-1"
        style={{ borderColor: "var(--theme-line)" }}
        role="tablist"
        aria-label="Sign-in method"
      >
        {(
          [
            ["password", "Password"],
            ["email-code", "Email code"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id && step === "credentials"}
            disabled={step === "2fa"}
            onClick={() => {
              setMode(id);
              setError(null);
              setInfo(null);
            }}
            className="flex-1 rounded-[var(--theme-radius-sm)] px-2 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                mode === id ? "var(--theme-surface)" : "transparent",
              color: "var(--theme-ink)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {step === "2fa" ? (
        <form onSubmit={onTwoFactorSubmit} className="space-y-4">
          <p className="text-sm text-[var(--theme-muted)]">
            {info ?? "Two-factor verification required."}
          </p>
          <div>
            <label className="text-sm font-semibold" htmlFor="twofa">
              Verification code
            </label>
            <input
              id="twofa"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="mt-1 w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm tracking-widest"
              style={{ borderColor: "var(--theme-line)" }}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" disabled={loading} className="dash-btn-primary w-full">
            {loading ? "Verifying…" : "Continue"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-[var(--theme-muted)] underline"
            onClick={() => {
              setStep("credentials");
              setTwoFactorCode("");
              setError(null);
            }}
          >
            Back
          </button>
        </form>
      ) : mode === "password" ? (
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--theme-line)" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--theme-line)" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {configError ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              {configError}
            </p>
          ) : null}
          {emailVerified ? (
            <p className="text-sm text-green-800">
              Email verified. You can sign in now.
            </p>
          ) : null}
          {info ? <p className="text-sm text-[var(--theme-muted)]">{info}</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {showResendVerify ? (
            <button
              type="button"
              disabled={loading}
              onClick={onResendVerification}
              className="w-full text-sm font-semibold text-[var(--theme-primary)] underline"
            >
              Resend verification email
            </button>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="dash-btn-primary w-full"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={onEmailCodeSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="email-code-email">
              Email
            </label>
            <input
              id="email-code-email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--theme-line)" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={loading || !email}
            onClick={onEmailCodeRequest}
            className="w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--theme-line)" }}
          >
            Send code
          </button>
          <div>
            <label className="text-sm font-semibold" htmlFor="login-code">
              One-time code
            </label>
            <input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="mt-1 w-full rounded-[var(--theme-radius-md)] border px-3 py-2 text-sm tracking-widest"
              style={{ borderColor: "var(--theme-line)" }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <p className="text-xs text-[var(--theme-muted)]">
            No password needed — the code proves you own this inbox. Accounts
            with 2FA may still need a second step.
          </p>
          {info ? <p className="text-sm text-[var(--theme-muted)]">{info}</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="dash-btn-primary w-full"
          >
            {loading ? "Signing in…" : "Sign in with code"}
          </button>
        </form>
      )}

      {step === "credentials" ? (
        <>
          {showGoogle ? (
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              loginHint={email}
            />
          ) : null}
          <p className="text-center text-sm text-[var(--theme-muted)]">
            No account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--theme-primary)]"
            >
              Register
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
