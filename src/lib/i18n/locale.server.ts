import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  parseAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";

export async function getServerLocale(): Promise<AppLocale> {
  const jar = await cookies();
  return parseAppLocale(jar.get(LOCALE_COOKIE)?.value);
}
