import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/env.js";
import { atRequestTime } from "@/server/db/request-time";
import { createPostgres } from "@/server/db/postgres-client";
import * as schema from "@/server/db/schema";

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof createPostgres> | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export function getDb() {
  if (globalForDb.db) return globalForDb.db;
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and run pnpm db:push.",
    );
  }
  const conn = globalForDb.conn ?? createPostgres(env.DATABASE_URL);
  const db = drizzle(conn, { schema });
  if (env.NODE_ENV !== "production") {
    globalForDb.conn = conn;
    globalForDb.db = db;
  }
  return db;
}

export function requireDb() {
  return getDb();
}

/** Use before DB reads in Server Components (Cache Components / PPR). */
export async function requireDbAtRequest() {
  await atRequestTime();
  return getDb();
}

export type Database = ReturnType<typeof getDb>;
