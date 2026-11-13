import { desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { AppRole } from "@/lib/auth/roles";
import { requireDbAtRequest } from "@/server/db";
import {
  teacherApplications,
  teacherProfiles,
  userRoles,
  users,
} from "@/server/db/schema";

export type AdminUserRoleView = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: Date;
  roles: AppRole[];
  teacherProfileStatus: string | null;
  teacherApplicationStatus: string | null;
};

export async function listAllAdminUsers(limit = 200) {
  const db = await requireDbAtRequest();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  return enrichUsersWithRoles(rows);
}

export async function searchAdminUsers(query: string, limit = 50) {
  const db = await requireDbAtRequest();
  const term = query.trim();
  if (term.length < 2) return listAllAdminUsers(limit);

  const pattern = `%${term.replace(/%/g, "\\%")}%`;
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      or(ilike(users.email, pattern), ilike(users.name, pattern)),
    )
    .orderBy(desc(users.createdAt))
    .limit(limit);

  return enrichUsersWithRoles(rows);
}

export async function getAdminUserById(userId: string) {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;
  const [enriched] = await enrichUsersWithRoles([row]);
  return enriched ?? null;
}

async function enrichUsersWithRoles(
  rows: {
    id: string;
    email: string;
    name: string | null;
    status: string;
    createdAt: Date;
  }[],
): Promise<AdminUserRoleView[]> {
  if (rows.length === 0) return [];
  const db = await requireDbAtRequest();
  const ids = rows.map((r) => r.id);

  const roleRows = await db
    .select({ userId: userRoles.userId, role: userRoles.role })
    .from(userRoles)
    .where(inArray(userRoles.userId, ids));

  const rolesByUser = new Map<string, AppRole[]>();
  for (const r of roleRows) {
    const list = rolesByUser.get(r.userId) ?? [];
    list.push(r.role as AppRole);
    rolesByUser.set(r.userId, list);
  }

  const teacherMeta = await db
    .select({
      userId: teacherProfiles.userId,
      profileStatus: teacherProfiles.status,
      applicationStatus: teacherApplications.status,
    })
    .from(teacherProfiles)
    .leftJoin(
      teacherApplications,
      eq(teacherApplications.userId, teacherProfiles.userId),
    )
    .where(inArray(teacherProfiles.userId, ids));

  const teacherByUser = new Map(
    teacherMeta.map((t) => [
      t.userId,
      {
        profileStatus: t.profileStatus,
        applicationStatus: t.applicationStatus,
      },
    ]),
  );

  return rows.map((row) => {
    const teacher = teacherByUser.get(row.id);
    return {
      ...row,
      roles: rolesByUser.get(row.id) ?? [],
      teacherProfileStatus: teacher?.profileStatus ?? null,
      teacherApplicationStatus: teacher?.applicationStatus ?? null,
    };
  });
}
