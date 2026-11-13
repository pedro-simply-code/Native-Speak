import type { AppRole } from "@/lib/auth/roles";
import { hasPermission } from "@/lib/auth/permissions";

export type TablerIconName =
  | "dashboard"
  | "modern"
  | "ecommerce"
  | "contacts"
  | "users"
  | "userCheck"
  | "school"
  | "families"
  | "mail"
  | "calendar"
  | "billing"
  | "settings"
  | "chat";

export type DashNavGroup = "HOME" | "APPS";

export type DashNavItem = {
  href: string;
  /** Dot-path into `lib/i18n/messages` → `nav.*` */
  labelKey: string;
  group: DashNavGroup;
  icon: TablerIconName;
  badgeKey?: string;
};

export function navForRoles(roles: AppRole[]): DashNavItem[] {
  const items: DashNavItem[] = [];

  if (roles.includes("admin")) {
    items.push(
      {
        group: "HOME",
        href: "/dashboard/admin",
        labelKey: "nav.overview",
        icon: "modern",
        badgeKey: "common.new",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/users",
        labelKey: "nav.userRoles",
        icon: "users",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/managers",
        labelKey: "nav.managers",
        icon: "userCheck",
      },
      {
        group: "APPS",
        href: "/dashboard/teachers",
        labelKey: "nav.teachers",
        icon: "school",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/families",
        labelKey: "nav.families",
        icon: "families",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/invitations",
        labelKey: "nav.invitations",
        icon: "mail",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/scheduling-policy",
        labelKey: "nav.schedulingPolicy",
        icon: "calendar",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/payouts",
        labelKey: "nav.payouts",
        icon: "ecommerce",
      },
      {
        group: "APPS",
        href: "/dashboard/admin/content",
        labelKey: "nav.content",
        icon: "chat",
      },
    );
  }

  if (roles.includes("manager") && !roles.includes("admin")) {
    items.push({
      group: "HOME",
      href: "/dashboard/manager",
      labelKey: "nav.overview",
      icon: "modern",
    });
    items.push({
      group: "APPS",
      href: "/dashboard/teachers",
      labelKey: "nav.teachers",
      icon: "school",
    });
  }

  if (roles.includes("admin") || roles.includes("manager")) {
    items.push(
      {
        group: "APPS",
        href: "/dashboard/manager/applications",
        labelKey: "nav.applications",
        icon: "users",
      },
      {
        group: "APPS",
        href: "/dashboard/manager/schedule-requests",
        labelKey: "nav.scheduleRequests",
        icon: "calendar",
      },
    );
  }

  if (roles.includes("teacher")) {
    if (!roles.includes("admin") && !roles.includes("manager")) {
      items.push({
        group: "HOME",
        href: "/dashboard/teacher",
        labelKey: "nav.overview",
        icon: "modern",
      });
    }
    items.push(
      {
        group: "APPS",
        href: "/dashboard/teacher/availability",
        labelKey: "nav.availability",
        icon: "calendar",
      },
      {
        group: "APPS",
        href: "/dashboard/teacher/appointments",
        labelKey: "nav.appointments",
        icon: "contacts",
      },
      {
        group: "APPS",
        href: "/dashboard/teacher/students",
        labelKey: "nav.students",
        icon: "users",
      },
      {
        group: "APPS",
        href: "/dashboard/teacher/study",
        labelKey: "nav.studyBuilder",
        icon: "contacts",
      },
      {
        group: "APPS",
        href: "/dashboard/teacher/schedule",
        labelKey: "nav.calendar",
        icon: "calendar",
      },
    );
  }

  if (roles.includes("family")) {
    if (
      !roles.includes("admin") &&
      !roles.includes("manager") &&
      !roles.includes("teacher")
    ) {
      items.push({
        group: "HOME",
        href: "/dashboard/family",
        labelKey: "nav.overview",
        icon: "modern",
      });
    }
    items.push(
      {
        group: "APPS",
        href: "/dashboard/family/students",
        labelKey: "nav.students",
        icon: "users",
      },
      {
        group: "APPS",
        href: "/dashboard/family/schedule",
        labelKey: "nav.scheduleClass",
        icon: "calendar",
      },
      {
        group: "APPS",
        href: "/dashboard/family/classes",
        labelKey: "nav.myClasses",
        icon: "contacts",
      },
      {
        group: "APPS",
        href: "/dashboard/family/study",
        labelKey: "nav.studyJournal",
        icon: "chat",
      },
    );
  }

  if (hasPermission(roles, "billing.view") || hasPermission(roles, "billing.charge")) {
    items.push({
      group: "APPS",
      href: "/dashboard/billing",
      labelKey: "nav.ecommerce",
      icon: "ecommerce",
    });
  }

  items.push({
    group: "APPS",
    href: "/dashboard/settings/security",
    labelKey: "nav.security",
    icon: "settings",
  });

  return items;
}

export function navPageTitleKey(
  items: DashNavItem[],
  pathname: string,
): string {
  const exact = items.find((i) => pathname === i.href);
  if (exact) return exact.labelKey;
  const nested = items.find((i) => pathname.startsWith(`${i.href}/`));
  if (nested) return nested.labelKey;
  return "nav.dashboard";
}
