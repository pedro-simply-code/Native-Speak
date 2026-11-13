import { join } from "node:path";
import { spawnSync } from "node:child_process";
import postgres from "postgres";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

const root = projectRoot();
loadProjectEnv(root);

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn("[db] DATABASE_URL missing — skipping schema sync.");
  process.exit(0);
}

function makeSql() {
  const needsSsl =
    url.includes("sslmode=require") ||
    url.includes("neon.tech") ||
    url.includes("supabase.co");
  return postgres(url, {
    max: 1,
    connect_timeout: 30,
    prepare: false,
    ...(needsSsl ? { ssl: "require" } : {}),
  });
}

function runMigrations() {
  console.log("[db] Applying SQL migrations…");
  const script = join(root, "scripts", "apply-migrations.mjs");
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function accountsTableExists(sql) {
  const rows = await sql`
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'accounts'
    limit 1
  `;
  return rows.length > 0;
}

async function pendingAuthColumns(sql) {
  const rows = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'two_factor_enabled'
    limit 1
  `;
  return rows.length === 0;
}

async function main() {
  const sql = makeSql();
  try {
    const hasAccounts = await accountsTableExists(sql);
    if (!hasAccounts) {
      console.log("[db] Missing Auth tables — applying migrations…");
      runMigrations();
      return;
    }

    if (await pendingAuthColumns(sql)) {
      console.log(
        "[db] Auth security columns missing on users — applying migrations…",
      );
      runMigrations();
      return;
    }

    runMigrations();
    console.log("[db] Schema migrations up to date.");
  } catch (error) {
    console.warn(
      "[db] Could not inspect DB — applying migrations:",
      error?.message ?? error,
    );
    runMigrations();
  } finally {
    await sql.end();
  }
}

await main();
