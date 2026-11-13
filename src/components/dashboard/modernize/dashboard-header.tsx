"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { DashboardNotifications } from "@/components/dashboard/modernize/dashboard-notifications";
import {
  IconCalendar,
  IconChevronDown,
  IconLayoutGrid,
  IconMail,
  IconMenu2,
  IconMessages,
  IconMoon,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";
import type { DashNavItem } from "@/components/dashboard/modernize/nav-config";
import { DashboardLanguageMenu } from "@/components/dashboard/i18n/dashboard-language-menu";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import { NativeSpeakLogo } from "@/components/dashboard/modernize/native-speak-logo";

type HeaderUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const linkSx = {
  color: "text.secondary",
  fontWeight: 500,
  fontSize: "0.875rem",
  px: 1.25,
  py: 0.75,
  borderRadius: 1,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  "&:hover": { color: "primary.main", bgcolor: "primary.light" },
} as const;

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email || "U";
  const parts = base.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

type DashboardHeaderProps = {
  user: HeaderUser;
  nav: DashNavItem[];
  onMenuClick: () => void;
  showMenuButton: boolean;
};

export function DashboardHeader({
  user,
  nav,
  onMenuClick,
  showMenuButton,
}: DashboardHeaderProps) {
  const { t } = useDashboardI18n();
  const [appsAnchor, setAppsAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const appsOpen = Boolean(appsAnchor);
  const profileOpen = Boolean(profileAnchor);

  const roleLine = user.name?.split(" ")[0] ?? t("common.user");

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          gap: { xs: 0.5, md: 1.5 },
          px: { xs: 1.5, md: 3 },
        }}
      >
        {showMenuButton ? (
          <IconButton
            aria-label={t("header.menu")}
            onClick={onMenuClick}
            edge="start"
            sx={{ color: "text.secondary", mr: 0.5 }}
          >
            <IconMenu2 size={22} stroke={1.5} />
          </IconButton>
        ) : (
          <Box
            component={Link}
            href="/dashboard"
            sx={{
              display: { xs: "none", lg: "none" },
              mr: 1,
              textDecoration: "none",
            }}
          >
            <NativeSpeakLogo compact />
          </Box>
        )}

        <IconButton
          aria-label={t("common.search")}
          sx={{ color: "text.secondary", display: { xs: "inline-flex", md: "none" } }}
        >
          <IconSearch size={22} stroke={1.5} />
        </IconButton>

        <OutlinedInput
          placeholder={t("common.search")}
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <IconSearch size={20} stroke={1.5} color="#5A6A85" />
            </InputAdornment>
          }
          sx={{
            display: { xs: "none", md: "flex" },
            width: 220,
            bgcolor: "#F6F9FC",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5EAEF" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#C9D4E0" },
            fontSize: "0.875rem",
          }}
        />

        <Stack
          direction="row"
          spacing={0.25}
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            ml: 1,
          }}
        >
          <Button
            color="inherit"
            onClick={(e) => setAppsAnchor(e.currentTarget)}
            endIcon={<IconChevronDown size={16} stroke={1.5} />}
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              px: 1.25,
            }}
          >
            {t("header.apps")}
          </Button>
          <Box component={Link} href="/dashboard" sx={linkSx}>
            <IconMessages size={18} stroke={1.5} />
            {t("header.chat")}
          </Box>
          <Box
            component={Link}
            href={
              nav.find((n) => n.icon === "calendar")?.href ?? "/dashboard"
            }
            sx={linkSx}
          >
            <IconCalendar size={18} stroke={1.5} />
            {t("header.calendar")}
          </Box>
          <Box
            component={Link}
            href={
              nav.find((n) => n.icon === "mail")?.href ??
              "/dashboard/admin/invitations"
            }
            sx={linkSx}
          >
            <IconMail size={18} stroke={1.5} />
            {t("header.email")}
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={0.25} sx={{ alignItems: "center" }}>
          <DashboardLanguageMenu />
          <IconButton aria-label={t("header.cart")} sx={{ color: "text.secondary" }}>
            <Badge badgeContent={0} color="error" variant="standard">
              <IconShoppingCart size={22} stroke={1.5} />
            </Badge>
          </IconButton>
          <IconButton aria-label={t("header.theme")} sx={{ color: "text.secondary" }}>
            <IconMoon size={22} stroke={1.5} />
          </IconButton>
          <DashboardNotifications />
          <IconButton
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{ p: 0.5, ml: 0.5 }}
          >
            <Avatar
              src={user.image ?? undefined}
              alt=""
              sx={{ width: 35, height: 35, bgcolor: "primary.main" }}
            >
              {!user.image ? initials(user.name, user.email) : null}
            </Avatar>
          </IconButton>
        </Stack>
      </Toolbar>

      <Menu
        anchorEl={appsAnchor}
        open={appsOpen}
        onClose={() => setAppsAnchor(null)}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        {nav.slice(0, 8).map((item) => (
          <MenuItem
            key={item.href}
            component={Link}
            href={item.href}
            onClick={() => setAppsAnchor(null)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <IconLayoutGrid size={18} stroke={1.5} />
            </ListItemIcon>
            <ListItemText primary={t(item.labelKey)} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={profileAnchor}
        open={profileOpen}
        onClose={() => setProfileAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {user.name ?? t("common.user")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} href="/" onClick={() => setProfileAnchor(null)}>
          {t("common.publicSite")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            signOut({ callbackUrl: "/" });
          }}
        >
          {t("common.signOut")}
        </MenuItem>
      </Menu>

      <Box sx={{ display: { xs: "block", lg: "none" }, px: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {t("header.hi", { name: roleLine })}
        </Typography>
      </Box>
    </AppBar>
  );
}
