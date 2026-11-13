"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { registerFamilyAccount } from "@/server/actions/auth-register";
import {
  PROFICIENCY_LEVELS,
  US_STATES,
} from "@/lib/platform/profile-options";

type StudentDraft = {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  grade: string;
  proficiency: (typeof PROFICIENCY_LEVELS)[number];
};

export function RegisterFamilyForm({ showGoogle }: { showGoogle: boolean }) {
  const [learnerType, setLearnerType] = useState<"self" | "children">("self");
  const [students, setStudents] = useState<StudentDraft[]>([
    {
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      grade: "",
      proficiency: "beginner",
    },
  ]);
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const result = await registerFamilyAccount({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      primaryFirstName: String(form.get("primaryFirstName") ?? ""),
      primaryLastName: String(form.get("primaryLastName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      residentialCity: String(form.get("residentialCity") ?? ""),
      residentialState: String(form.get("residentialState") ?? ""),
      learnerType,
      students:
        learnerType === "children"
          ? students.map((s) => ({
              firstName: s.firstName,
              lastName: s.lastName,
              email: s.email || undefined,
              age: s.age ? Number(s.age) : undefined,
              grade: s.grade || undefined,
              proficiency: s.proficiency,
            }))
          : [],
    });
    setState({ ok: result.ok, text: result.ok ? result.message : result.error });
  }

  return (
    <>
      {showGoogle ? (
        <div className="space-y-3">
          <GoogleSignInButton
            label="Register with Google"
            callbackUrl="/dashboard/family"
          />
          <p className="text-center text-xs text-[var(--theme-muted)]">
            Or complete the family form below (parent + students).
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="primaryFirstName"
            required
            placeholder="Parent first name"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            name="primaryLastName"
            required
            placeholder="Parent last name"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <input
          name="email"
          type="email"
          required
          placeholder="Parent email"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Parent phone"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="residentialCity"
            placeholder="City"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <select
            name="residentialState"
            className="w-full rounded border px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">State</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <label className="block text-sm font-semibold">
          Who is learning?
          <select
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={learnerType}
            onChange={(e) =>
              setLearnerType(e.target.value as "self" | "children")
            }
          >
            <option value="self">Myself</option>
            <option value="children">My children</option>
          </select>
        </label>

        {learnerType === "children"
          ? students.map((student, index) => (
              <div key={index} className="dash-card space-y-2 p-4">
                <p className="text-xs font-bold">Student {index + 1}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    placeholder="First name"
                    className="rounded border px-3 py-2 text-sm"
                    value={student.firstName}
                    onChange={(e) => {
                      const next = [...students];
                      next[index] = { ...student, firstName: e.target.value };
                      setStudents(next);
                    }}
                  />
                  <input
                    placeholder="Last name"
                    className="rounded border px-3 py-2 text-sm"
                    value={student.lastName}
                    onChange={(e) => {
                      const next = [...students];
                      next[index] = { ...student, lastName: e.target.value };
                      setStudents(next);
                    }}
                  />
                </div>
                <input
                  placeholder="Student email (optional)"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={student.email}
                  onChange={(e) => {
                    const next = [...students];
                    next[index] = { ...student, email: e.target.value };
                    setStudents(next);
                  }}
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    placeholder="Age"
                    type="number"
                    min={3}
                    className="rounded border px-3 py-2 text-sm"
                    value={student.age}
                    onChange={(e) => {
                      const next = [...students];
                      next[index] = { ...student, age: e.target.value };
                      setStudents(next);
                    }}
                  />
                  <input
                    placeholder="Grade"
                    className="rounded border px-3 py-2 text-sm"
                    value={student.grade}
                    onChange={(e) => {
                      const next = [...students];
                      next[index] = { ...student, grade: e.target.value };
                      setStudents(next);
                    }}
                  />
                  <select
                    className="rounded border px-3 py-2 text-sm"
                    value={student.proficiency}
                    onChange={(e) => {
                      const next = [...students];
                      next[index] = {
                        ...student,
                        proficiency: e.target
                          .value as StudentDraft["proficiency"],
                      };
                      setStudents(next);
                    }}
                  >
                    {PROFICIENCY_LEVELS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          : null}

        {learnerType === "children" ? (
          <button
            type="button"
            className="text-sm font-semibold text-[var(--theme-primary)]"
            onClick={() =>
              setStudents([
                ...students,
                {
                  firstName: "",
                  lastName: "",
                  email: "",
                  age: "",
                  grade: "",
                  proficiency: "beginner",
                },
              ])
            }
          >
            + Add another student
          </button>
        ) : null}

        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <MarketingButton type="submit" size="sm" className="w-full">
          Register with email
        </MarketingButton>
        {state ? (
          <p className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>
            {state.text}
          </p>
        ) : null}
      </form>

      <p className="mt-4 text-center text-sm text-[var(--theme-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--theme-primary)]">
          Sign in
        </Link>
      </p>
    </>
  );
}
