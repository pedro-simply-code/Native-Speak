/**
 * Demo rows for overview charts (payments + class appointments).
 * Safe to re-run: skips when succeeded payments already exist.
 */
import postgres from "postgres";
import { loadProjectEnv, projectRoot } from "./load-env.mjs";

const root = projectRoot();
loadProjectEnv(root);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[seed] DATABASE_URL is not set.");
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

async function pickUserId(role) {
  const rows = await sql`
    select u.id from users u
    inner join user_roles r on r.user_id = u.id
    where r.role = ${role}
    order by u.created_at asc
    limit 1
  `;
  return rows[0]?.id ?? null;
}

async function main() {
  const [{ count: paymentCount }] = await sql`
    select count(*)::int as count from payments where status = 'succeeded'
  `;
  if (paymentCount > 0) {
    console.log("[seed] Succeeded payments already present — skipping demo seed.");
    return;
  }

  const familyId = await pickUserId("family");
  const teacherId = await pickUserId("teacher");

  if (!familyId || !teacherId) {
    console.log(
      "[seed] Need at least one family and one teacher user. Create accounts first, then re-run: pnpm db:seed-overview",
    );
    return;
  }

  const studentRows = await sql`
    select id from students where family_user_id = ${familyId} limit 1
  `;
  let studentId = studentRows[0]?.id ?? null;
  if (!studentId) {
    const [created] = await sql`
      insert into students (id, family_user_id, first_name, last_name, proficiency)
      values (gen_random_uuid()::text, ${familyId}, 'Demo', 'Student', 'beginner')
      returning id
    `;
    studentId = created.id;
  }

  const amounts = [9900, 14900, 29900, 4900, 19900, 9900, 24900, 14900];
  const now = new Date();
  for (let i = 0; i < amounts.length; i++) {
    const createdAt = new Date(now.getFullYear(), now.getMonth() - (7 - i), 15);
    await sql`
      insert into payments (id, user_id, provider, status, amount_cents, currency, metadata, created_at, updated_at)
      values (
        gen_random_uuid()::text,
        ${familyId},
        ${i % 2 === 0 ? "stripe" : "paypal"},
        'succeeded',
        ${amounts[i]},
        'usd',
        ${sql.json({ label: "Class package (demo)", packageId: i % 3 === 0 ? "pack-30" : i % 3 === 1 ? "pack-60" : "pack-90" })},
        ${createdAt},
        ${createdAt}
      )
    `;
  }

  const statuses = ["scheduled", "completed", "completed", "cancelled", "scheduled"];
  for (let w = 0; w < 10; w++) {
    const starts = new Date(now);
    starts.setDate(starts.getDate() - w * 5 + 3);
    starts.setHours(10, 0, 0, 0);
    const ends = new Date(starts);
    ends.setMinutes(50);
    const status = w < 5 ? statuses[w % statuses.length] : w % 3 === 0 ? "completed" : "scheduled";
    await sql`
      insert into class_appointments (
        id, teacher_user_id, family_user_id, student_id,
        starts_at, ends_at, status, taught, created_at, updated_at
      ) values (
        gen_random_uuid()::text,
        ${teacherId},
        ${familyId},
        ${studentId},
        ${starts},
        ${ends},
        ${status}::appointment_status,
        ${status === "completed"},
        ${starts},
        ${starts}
      )
    `;
  }

  console.log("[seed] Demo payments and class appointments inserted.");
}

main()
  .catch((err) => {
    console.error("[seed]", err?.message || err);
    process.exit(1);
  })
  .finally(() => sql.end());
