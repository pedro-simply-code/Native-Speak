"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { IconLogout, IconRocket } from "@tabler/icons-react";
import type { AppRole } from "@/lib/auth/roles";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import { navForRoles } from "@/components/dashboard/modernize/nav-config";
import { DashboardHeader } from "@/components/dashboard/modernize/dashboard-header";
import { DashboardSidebarScroll } from "@/components/dashboard/modernize/dashboard-sidebar-scroll";
import { NativeSpeakLogo } from "@/components/dashboard/modernize/native-speak-logo";
import { TablerNavIcon } from "@/components/dashboard/modernize/tabler-nav-icon";

const DRAWER_WIDTH = 270;

type DashboardShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles: AppRole[];
  };
  children: React.ReactNode;
};

function userInitials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email || "U";
  const parts = base.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

function SidebarUserCard({
  user,
}: {
  user: DashboardShellProps["user"];
}) {
  const { t } = useDashboardI18n();
  const primaryRole = (["admin", "manager", "teacher", "family"] as AppRole[]).find(
    (r) => user.roles.includes(r),
  );
  const roleLabel = primaryRole ? t(`roles.${primaryRole}`) : user.roles.join(", ");

  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 2,
        p: 1.75,
        borderRadius: 2.5,
        bgcolor: "primary.light",
        border: "1px solid",
        borderColor: "rgba(93, 135, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
      }}
    >
      <Avatar
        src={user.image ?? undefined}
        alt=""
        sx={{ width: 46, height: 46, bgcolor: "primary.main" }}
      >
        {!user.image ? userInitials(user.name, user.email) : null}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {user.name ?? t("common.user")}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {roleLabel}
        </Typography>
      </Box>
      <IconButton
        aria-label={t("common.signOut")}
        size="small"
        onClick={() => signOut({ callbackUrl: "/" })}
        sx={{
          bgcolor: "primary.main",
          color: "#fff",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <IconLogout size={18} stroke={1.5} />
      </IconButton>
    </Box>
  );
}

function SidebarPromo() {
  const { t } = useDashboardI18n();
  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 1.5,
        p: 2,
        borderRadius: 2.5,
        bgcolor: "#F6F9FC",
        border: "1px dashed #E5EAEF",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: "#ECF2FF",
          color: "primary.main",
          display: "grid",
          placeItems: "center",
          mx: "auto",
          mb: 1,
        }}
      >
        <IconRocket size={22} stroke={1.5} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem" }}>
        {t("shell.promoTitle")}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: "block" }}
      >
        {t("shell.promoBody")}
      </Typography>
    </Box>
  );
}

function SidebarNav({
  pathname,
  user,
  onNavigate,
}: {
  pathname: string;
  user: DashboardShellProps["user"];
  onNavigate?: () => void;
}) {
  const { t } = useDashboardI18n();
  const roles = user.roles;
  const nav = navForRoles(roles);
  const groups = nav.reduce<Record<string, typeof nav>>((acc, item) => {
    acc[item.group] ??= [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      <Box sx={{ px: 2, py: 2.5 }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }} onClick={onNavigate}>
          <NativeSpeakLogo />
        </Link>
      </Box>

      <DashboardSidebarScroll>
        {Object.entries(groups).map(([group, links]) => (
          <Box key={group} sx={{ mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                px: 2.25,
                py: 1,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#7C8FAC",
              }}
            >
              {t(`nav.groups.${group as "HOME" | "APPS"}`)}
            </Typography>
            <List dense disablePadding>
              {links.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    selected={active}
                    onClick={onNavigate}
                    sx={{
                      mx: 1.25,
                      py: 0.85,
                      "&.Mui-selected": {
                        fontWeight: 600,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: active ? "primary.main" : "#5A6A85",
                        minWidth: 38,
                      }}
                    >
                      <TablerNavIcon name={item.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.labelKey)}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.875rem",
                            fontWeight: active ? 600 : 500,
                          },
                        },
                      }}
                    />
                    {item.badgeKey ? (
                      <Chip
                        label={t(item.badgeKey)}
                        size="small"
                        color={item.badgeKey === "common.new" ? "primary" : "secondary"}
                        sx={{
                          height: 22,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </DashboardSidebarScroll>

      <SidebarPromo />
      <SidebarUserCard user={user} />
    </>
  );
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = navForRoles(user.roles);

  const sidebarBody = (
    <SidebarNav
      pathname={pathname}
      user={user}
      onNavigate={() => setMobileOpen(false)}
    />
  );

  return (
    <Box
      className="dashboard-root"
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <Drawer
        variant={isLgUp ? "permanent" : "temporary"}
        open={isLgUp ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "none",
            boxShadow: "1px 0 0 #E5EAEF",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {sidebarBody}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
        }}
      >
        <DashboardHeader
          user={user}
          nav={nav}
          showMenuButton={!isLgUp}
          onMenuClick={() => setMobileOpen(true)}
        />

        <Box
          className="dashboard-content"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3 },
            py: 3,
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
