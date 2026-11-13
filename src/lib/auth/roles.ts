export const ROLES = ["admin", "manager", "teacher", "family"] as const;
export type AppRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  teacher: "Teacher",
  family: "Family",
};

export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  teacher: "/dashboard/teacher",
  family: "/dashboard/family",
};

export function pickPrimaryRole(roles: AppRole[]): AppRole | null {
  const order: AppRole[] = ["admin", "manager", "teacher", "family"];
  for (const role of order) {
    if (roles.includes(role)) return role;
  }
  return null;
}
