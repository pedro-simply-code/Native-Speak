import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { env } from "@/env.js";
import { createPostgres } from "@/server/db/postgres-client";

const skipCodes = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object
  "42701", // duplicate_column
  "23505", // unique_violation (index exists)
]);

let ensurePromise: Promise<void> | null = null;

async function tableExists(
  sql: ReturnType<typeof createPostgres>,
  name: string,
): Promise<boolean> {
  const rows = await sql`
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = ${name}
    limit 1
  `;
  return rows.length > 0;
}

async function applySqlMigrations(
  sql: ReturnType<typeof createPostgres>,
): Promise<void> {
  const drizzleDir = join(process.cwd(), "drizzle");
  const files = readdirSync(drizzleDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const raw = readFileSync(join(drizzleDir, file), "utf8");
    const statements = raw
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]!;
      try {
        await sql.unsafe(statement);
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error
            ? String((error as { code: string }).code)
            : "";
        if (skipCodes.has(code)) continue;
        console.error(
          `[db] Migration ${file} statement ${i + 1} failed:`,
          error,
        );
        throw error;
      }
    }
  }
}

async function ensureDatabaseSchemaInternal(): Promise<void> {
  if (!env.DATABASE_URL) {
    console.warn("[db] DATABASE_URL not set — skip schema sync.");
    return;
  }

  const sql = createPostgres(env.DATABASE_URL, 1);
  try {
    if (await tableExists(sql, "accounts")) {
      return;
    }
    console.log("[db] Auth tables missing — applying drizzle/0000_init.sql …");
    await applySqlMigrations(sql);
    console.log("[db] Schema ready.");
  } finally {
    await sql.end();
  }
}

/** Runs once per Node server process (see instrumentation.ts). */
export function ensureDatabaseSchema(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = ensureDatabaseSchemaInternal().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}
