"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { MarketingButton } from "@/components/marketing/marketing-button";
import {
  completeTwoFactorLogin,
  requestEmailLoginCode,
  startEmailCodeLogin,
  startPasswordLogin,
} from "@/server/actions/auth-login";
import { resendVerificationEmail } from "@/server/actions/auth-verify-resend";

type AuthMethod = "password" | "email-code";
type Step = "credentials" | "2fa";

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

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

  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [codeSent, setCodeSent] = useState(false);
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

  function resetAuthFlow() {
    setAuthMethod(null);
    setCodeSent(false);
    setPassword("");
    setCode("");
    setError(null);
    setInfo(null);
    setShowResendVerify(false);
  }

  function onEmailChange(value: string) {
    setEmail(value);
    if (authMethod !== null) {
      resetAuthFlow();
    }
  }

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

  async function onChoosePassword() {
    setAuthMethod("password");
    setError(null);
    setInfo(null);
    setCode("");
    setCodeSent(false);
  }

  async function onChooseEmailCode() {
    if (!emailLooksValid(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    const result = await requestEmailLoginCode(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAuthMethod("email-code");
    setCodeSent(true);
    setPassword("");
    setInfo(result.message);
  }

  async function onCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authMethod) return;

    setLoading(true);
    setError(null);
    await ensureNotSignedInAsOtherAccount(email);

    if (authMethod === "password") {
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
      return;
    }

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

  const showMethodChoice = step === "credentials" && authMethod === null;

  const canSubmitCredentials =
    authMethod === "password" ||
    (authMethod === "email-code" && codeSent);

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
          <MarketingButton
            type="submit"
            disabled={loading}
            size="sm"
            className="w-full"
          >
            {loading ? "Verifying…" : "Continue"}
          </MarketingButton>
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
      ) : (
        <form onSubmit={onCredentialsSubmit} className="space-y-4">
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
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>

          {showMethodChoice ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <MarketingButton
                type="button"
                disabled={loading || !emailLooksValid(email)}
                size="sm"
                className="w-full flex-1"
                onClick={() => void onChooseEmailCode()}
              >
                {loading ? "Sending…" : "Get sign-in code"}
              </MarketingButton>
              <MarketingButton
                type="button"
                variant="soft"
                disabled={loading}
                size="sm"
                className="w-full flex-1"
                onClick={() => void onChoosePassword()}
              >
                Use password
              </MarketingButton>
            </div>
          ) : null}

          {authMethod === "password" ? (
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
              <button
                type="button"
                className="mt-2 text-sm text-[var(--theme-muted)] underline"
                onClick={resetAuthFlow}
              >
                Use email code instead
              </button>
            </div>
          ) : null}

          {authMethod === "email-code" && codeSent ? (
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
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void onChooseEmailCode()}
                  className="font-semibold text-[var(--theme-primary)] underline"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="text-[var(--theme-muted)] underline"
                  onClick={resetAuthFlow}
                >
                  Use password instead
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--theme-muted)]">
                The code proves you own this inbox. Accounts with 2FA may still
                need a second step.
              </p>
            </div>
          ) : null}

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
          {info ? (
            <p className="text-sm text-[var(--theme-muted)]">{info}</p>
          ) : null}
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

          {canSubmitCredentials ? (
            <MarketingButton
              type="submit"
              disabled={loading}
              size="sm"
              className="w-full"
            >
              {loading ? "Signing in…" : "Sign in"}
            </MarketingButton>
          ) : null}
        </form>
      )}

      {step === "credentials" ? (
        <>
          {showGoogle ? (
            <>
              <div
                className="flex items-center gap-3"
                role="separator"
                aria-label="Or"
              >
                <div
                  className="h-px flex-1"
                  style={{ background: "var(--theme-line)" }}
                />
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--theme-muted)]">
                  Or
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: "var(--theme-line)" }}
                />
              </div>
              <GoogleSignInButton callbackUrl={callbackUrl} loginHint={email} />
            </>
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
