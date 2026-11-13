import { eq } from "drizzle-orm";
import { requireDbAtRequest } from "@/server/db";
import { userRoles, users } from "@/server/db/schema";

export async function listFamilyAccountsForStaff() {
  const db = await requireDbAtRequest();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .where(eq(userRoles.role, "family"))
    .orderBy(users.email);
}
