import { connection } from "next/server";

/**
 * Opt out of static prerender before DB access or request-relative time
 * (`new Date()`, etc.). Required on Next.js 16 with Cache Components.
 */
export async function atRequestTime(): Promise<void> {
  await connection();
}
