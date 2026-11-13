import type { AppRole } from "@/lib/auth/roles";

type Permission =
  | "users.manage"
  | "managers.invite"
  | "teachers.invite"
  | "teachers.approve"
  | "teachers.manage"
  | "families.manage"
  | "billing.view"
  | "billing.charge"
  | "content.manage"
  | "audit.view";

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: [
    "users.manage",
    "managers.invite",
    "teachers.invite",
    "teachers.approve",
    "teachers.manage",
    "families.manage",
    "billing.view",
    "billing.charge",
    "content.manage",
    "audit.view",
  ],
  manager: [
    "teachers.invite",
    "teachers.approve",
    "teachers.manage",
    "billing.view",
  ],
  teacher: ["billing.view"],
  family: ["billing.view", "billing.charge"],
};

export function hasPermission(roles: AppRole[], permission: Permission) {
  return roles.some((role) => ROLE_PERMISSIONS[role].includes(permission));
}

export function canInviteRole(actor: AppRole[], target: AppRole) {
  if (target === "manager") return actor.includes("admin");
  if (target === "teacher") {
    return actor.includes("admin") || actor.includes("manager");
  }
  if (target === "family") return actor.includes("admin");
  return false;
}
