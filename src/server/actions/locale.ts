"use server";

import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setAppLocale(locale: AppLocale) {
  if (!isAppLocale(locale)) return { ok: false as const };
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  return { ok: true as const };
}
