"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { registerViaInvite } from "@/server/actions/auth-register";
import "@/app/(public)/auth-portal.css";

function InviteRegisterForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);

  if (!token || !email) {
    return (
      <p className="text-sm text-red-700">
        Missing invite token. Open the full link from your administrator.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await registerViaInvite({
      email,
      token,
      password: String(form.get("password") ?? ""),
      primaryFirstName: String(form.get("firstName") ?? ""),
      primaryLastName: String(form.get("lastName") ?? ""),
    });
    setState({
      ok: result.ok,
      text: result.ok ? result.message : result.error,
    });
  }

  return (
    <>
      <p className="text-sm text-[var(--dash-muted)]">Invite for {email}</p>
      <form onSubmit={onSubmit} className="auth-portal-card mt-4 space-y-3 p-6">
        <input
          name="firstName"
          required
          placeholder="First name"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          name="lastName"
          required
          placeholder="Last name"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <button type="submit" className="dash-btn-primary w-full">
          Accept invite
        </button>
        {state ? (
          <p className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>
            {state.text}
          </p>
        ) : null}
      </form>
      {state?.ok ? (
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-[var(--theme-primary)]"
        >
          Sign in
        </Link>
      ) : null}
    </>
  );
}

export default function RegisterInvitePage() {
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-bold">Accept staff invite</h1>
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <InviteRegisterForm />
      </Suspense>
    </section>
  );
}
