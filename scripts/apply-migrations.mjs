import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

const root = projectRoot();
loadProjectEnv(root);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[db] DATABASE_URL is not set.");
  process.exit(1);
}

const skipCodes = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (enum)
  "42701", // duplicate_column
]);

async function main() {
  const drizzleDir = join(root, "drizzle");
  const files = readdirSync(drizzleDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("[db] No SQL migrations in drizzle/ — run: pnpm db:generate");
    process.exit(1);
  }

  const needsSsl =
    url.includes("sslmode=require") ||
    url.includes("neon.tech") ||
    url.includes("supabase.co");
  const sql = postgres(url, {
    max: 1,
    connect_timeout: 30,
    prepare: false,
    ...(needsSsl ? { ssl: "require" } : {}),
  });

  try {
    for (const file of files) {
      const raw = readFileSync(join(drizzleDir, file), "utf8");
      const statements = raw
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      console.log(`[db] Applying ${file} (${statements.length} statements)…`);

      for (const statement of statements) {
        try {
          await sql.unsafe(statement);
        } catch (error) {
          const code = error?.code;
          if (code && skipCodes.has(code)) {
            continue;
          }
          throw error;
        }
      }
    }
    console.log("[db] Migrations applied.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("[db] Migration failed:", error?.message || error);
  if (error?.code) console.error("[db] Postgres code:", error.code);
  if (error?.detail) console.error("[db] Detail:", error.detail);
  process.exit(1);
});
