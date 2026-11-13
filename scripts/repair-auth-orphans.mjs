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
  const deleted = await sql`
    delete from accounts a
    where not exists (
      select 1 from users u where u.id = a.user_id
    )
    returning a.provider, a.provider_account_id
  `;
  console.log(
    deleted.length
      ? `[repair] Removed ${deleted.length} orphan account row(s).`
      : "[repair] No orphan accounts found.",
  );
} finally {
  await sql.end();
}
