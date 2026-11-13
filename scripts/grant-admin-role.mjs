import postgres from "postgres";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

loadProjectEnv(projectRoot());

const email = (process.argv[2] ?? "").trim().toLowerCase();
const url = process.env.DATABASE_URL;

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/grant-admin-role.mjs user@example.com");
  process.exit(1);
}

if (!url) {
  console.error("Set DATABASE_URL in .env");
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
  const users = await sql`
    select id, email from users where lower(email) = ${email}
  `;

  if (users.length === 0) {
    console.log(`No user found for ${email}. Register first, then re-run.`);
    process.exit(0);
  }

  for (const user of users) {
    await sql`
      insert into user_roles (user_id, role)
      values (${user.id}, 'admin')
      on conflict do nothing
    `;
    await sql`
      delete from user_roles
      where user_id = ${user.id} and role = 'family'
    `;
    console.log(`Admin role granted for ${user.email}`);
  }
} finally {
  await sql.end();
}
