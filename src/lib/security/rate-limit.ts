import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { requireDb } from "@/server/db";
import { rateLimitEvents } from "@/server/db/schema";

type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
};

const memoryBuckets = new Map<string, { count: number; windowStart: number }>();

export async function getClientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function enforceRateLimit(
  key: string,
  { bucket, limit, windowMs }: RateLimitOptions,
) {
  const now = Date.now();
  const memKey = `${bucket}:${key}`;
  const current = memoryBuckets.get(memKey);

  if (!current || now - current.windowStart >= windowMs) {
    memoryBuckets.set(memKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  memoryBuckets.set(memKey, current);

  try {
    const db = requireDb();
    await db.insert(rateLimitEvents).values({
      bucket,
      key,
      count: current.count,
      windowStart: new Date(current.windowStart),
    });
  } catch {
    /* DB optional for rate limit telemetry */
  }

  return { allowed: true, remaining: limit - current.count };
}

export async function clearRateWindow(bucket: string, key: string) {
  memoryBuckets.delete(`${bucket}:${key}`);
  try {
    const db = requireDb();
    await db
      .delete(rateLimitEvents)
      .where(eq(rateLimitEvents.bucket, `${bucket}:${key}`));
  } catch {
    /* ignore */
  }
}
