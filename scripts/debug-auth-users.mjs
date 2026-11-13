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

const emails = [
  "ryanjhunter011@gmail.com",
  "rhaastp@gmail.com",
];

try {
  for (const e of emails) {
    const users = await sql`
      select id, email, name, status, session_version
      from users
      where lower(email) = ${e.toLowerCase()}
    `;
  const user = users[0];
  if (!user) {
    console.log(e, "-> not found");
    continue;
  }
  const roles = await sql`
    select role from user_roles where user_id = ${user.id}
  `;
  const accounts = await sql`
    select provider, provider_account_id from accounts where user_id = ${user.id}
  `;
  const sessions = await sql`
    select count(*)::int as n from auth_active_sessions
    where user_id = ${user.id} and revoked_at is null
  `;
  console.log("\n", e);
  console.log("  user:", user);
  console.log(
    "  roles:",
    roles.map((r) => r.role),
  );
  console.log("  accounts:", accounts);
  console.log("  active web sessions:", sessions[0]?.n ?? 0);
}
} finally {
  await sql.end();
}
