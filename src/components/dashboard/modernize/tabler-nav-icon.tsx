"use client";

import type { ReactNode } from "react";
import type { TablerIconName } from "@/components/dashboard/modernize/nav-config";
import {
  IconAperture,
  IconCalendar,
  IconCreditCard,
  IconLayoutDashboard,
  IconMail,
  IconMessages,
  IconPhone,
  IconSchool,
  IconShieldLock,
  IconShoppingCart,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

const ICON_PROPS = { size: 21, stroke: 1.5 } as const;

const MAP: Record<TablerIconName, ReactNode> = {
  dashboard: <IconLayoutDashboard {...ICON_PROPS} />,
  modern: <IconAperture {...ICON_PROPS} />,
  ecommerce: <IconShoppingCart {...ICON_PROPS} />,
  contacts: <IconPhone {...ICON_PROPS} />,
  users: <IconUsers {...ICON_PROPS} />,
  userCheck: <IconUserCheck {...ICON_PROPS} />,
  school: <IconSchool {...ICON_PROPS} />,
  families: <IconUsersGroup {...ICON_PROPS} />,
  mail: <IconMail {...ICON_PROPS} />,
  calendar: <IconCalendar {...ICON_PROPS} />,
  billing: <IconCreditCard {...ICON_PROPS} />,
  settings: <IconShieldLock {...ICON_PROPS} />,
  chat: <IconMessages {...ICON_PROPS} />,
};

export function TablerNavIcon({ name }: { name: TablerIconName }) {
  return <>{MAP[name] ?? <IconLayoutDashboard {...ICON_PROPS} />}</>;
}
