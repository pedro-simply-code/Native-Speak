/**
 * Detect and repair mis-linked OAuth identities.
 *
 * Auth.js links a new Google identity to whichever user owns the current
 * session cookie, even when the Google email differs. That leaves the wrong
 * provider account attached to a user, so signing in with the other Google
 * address opens the first user's dashboard.
 *
 * Usage:
 *   node scripts/repair-auth-identities.mjs          # report only
 *   node scripts/repair-auth-identities.mjs --fix    # unlink + revoke sessions
 */
import postgres from "postgres";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

loadProjectEnv(projectRoot());
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const fix = process.argv.includes("--fix");
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

function decodeJwtEmail(token) {
  try {
    const part = token?.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(
      part.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const payload = JSON.parse(json);
    return (
      payload.email ?? payload.preferred_username ?? payload.upn ?? null
    );
  } catch {
    return null;
  }
}

const sameEmail = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.trim().toLowerCase() === b.trim().toLowerCase();

try {
  const rows = await sql`
    select a.user_id,
           a.provider,
           a.provider_account_id,
           a.id_token,
           u.email as user_email
    from accounts a
    join users u on u.id = a.user_id
    order by a.provider, a.provider_account_id
  `;

  const mismatched = [];

  for (const row of rows) {
    const identityEmail = decodeJwtEmail(row.id_token);
    if (!identityEmail) continue;
    if (sameEmail(identityEmail, row.user_email)) continue;
    mismatched.push({ ...row, identityEmail });
  }

  if (mismatched.length === 0) {
    console.log("[auth-repair] No mis-linked identities found.");
  } else {
    for (const row of mismatched) {
      console.warn(
        `[auth-repair] MISMATCH ${row.provider}:${row.provider_account_id} ` +
          `identity=${row.identityEmail} linkedTo=${row.user_email} ` +
          `(user ${row.user_id})`,
      );
    }
  }

  if (mismatched.length > 0 && fix) {
    const affectedUsers = new Set(mismatched.map((row) => row.user_id));

    await sql.begin(async (tx) => {
      for (const row of mismatched) {
        await tx`
          delete from accounts
          where provider = ${row.provider}
            and provider_account_id = ${row.provider_account_id}
            and user_id = ${row.user_id}
        `;
      }

      for (const userId of affectedUsers) {
        // Bump the session version so every JWT minted against the bad link
        // stops validating, then revoke the tracked rows.
        await tx`
          update users
          set session_version = session_version + 1,
              updated_at = now()
          where id = ${userId}
        `;
        await tx`
          update auth_active_sessions
          set revoked_at = now()
          where user_id = ${userId}
            and revoked_at is null
        `;
      }
    });

    console.log(
      `[auth-repair] Unlinked ${mismatched.length} identity row(s) and revoked sessions for ${affectedUsers.size} user(s).`,
    );
  } else if (mismatched.length > 0) {
    console.log("[auth-repair] Dry run — re-run with --fix to unlink them.");
  }
} finally {
  await sql.end();
}
