import postgres from "postgres";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

loadProjectEnv(projectRoot());

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const needsSsl =
  url.includes("sslmode=require") ||
  url.includes("neon.tech") ||
  url.includes("supabase.co");
const sql = postgres(url, {
  max: 1,
  prepare: false,
  connect_timeout: 30,
  ...(needsSsl ? { ssl: "require" } : {}),
});
try {
  const rows = await sql`select 1 as ok`;
  console.log("connected", rows[0]);
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_name = 'accounts'
  `;
  console.log(
    tables.length
      ? "accounts table: present"
      : "accounts table: MISSING — run pnpm db:push",
  );
} catch (error) {
  console.error("connect failed:", error.message);
  process.exit(1);
} finally {
  await sql.end();
}
