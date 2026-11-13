"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconSearch } from "@tabler/icons-react";
import {
  grantUserRoleAdmin,
  refreshAdminUser,
  revokeUserRoleAdmin,
  searchUsersForRoleAdmin,
} from "@/server/actions/admin-user-roles";
import type { AdminUserRoleView } from "@/server/queries/admin-users";
import type { AppRole } from "@/lib/auth/roles";
import { pickPrimaryRole, ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import { DashField, dashInputClass, dashInputStyle } from "@/components/dashboard/dash-field";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

const ROLE_ACCENT: Record<
  AppRole,
  { main: string; soft: string; onSoft: string }
> = {
  admin: { main: "#5D87FF", soft: "#ECF2FF", onSoft: "#2A3547" },
  manager: { main: "#7C8FAC", soft: "#F0F4F8", onSoft: "#2A3547" },
  teacher: { main: "#49BEFF", soft: "#E8F7FF", onSoft: "#1B3A4B" },
  family: { main: "#13DEB9", soft: "#E6FFFA", onSoft: "#0F3D34" },
};

function userInitials(name: string | null, email: string) {
  const source = name?.trim() || email.split("@")[0] || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function roleChipSx(role: AppRole, active: boolean) {
  const tone = ROLE_ACCENT[role];
  if (active) {
    return {
      fontWeight: 700,
      bgcolor: tone.main,
      color: "#fff",
      border: "none",
      "&:hover": { bgcolor: tone.main, filter: "brightness(0.95)" },
    };
  }
  return {
    fontWeight: 600,
    bgcolor: tone.soft,
    color: tone.onSoft,
    border: `1px solid color-mix(in srgb, ${tone.main} 28%, transparent)`,
    "&:hover": {
      bgcolor: tone.soft,
      borderColor: tone.main,
    },
  };
}

function UserRoleCard({
  user,
  onUpdated,
}: {
  user: AdminUserRoleView;
  onUpdated: (user: AdminUserRoleView) => void;
}) {
  const { t } = useDashboardI18n();
  const [busy, setBusy] = useState<AppRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accentRole =
    pickPrimaryRole(user.roles) ?? ("family" satisfies AppRole);
  const accent = ROLE_ACCENT[accentRole];

  async function toggle(role: AppRole, hasRole: boolean) {
    setBusy(role);
    setError(null);
    const result = hasRole
      ? await revokeUserRoleAdmin({ userId: user.id, role })
      : await grantUserRoleAdmin({ userId: user.id, role });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const fresh = await refreshAdminUser(user.id);
    if (fresh.ok) onUpdated(fresh.user);
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0 2px 14px rgba(42, 53, 71, 0.06)",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 14px 36px rgba(42, 53, 71, 0.1)",
          },
        },
      }}
    >
      <Box sx={{ height: 4, bgcolor: accent.main }} />
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              fontWeight: 700,
              fontSize: "0.95rem",
              bgcolor: accent.soft,
              color: accent.onSoft,
              border: `2px solid ${accent.main}`,
            }}
          >
            {userInitials(user.name, user.email)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.3 }}
              noWrap
            >
              {user.name ?? t("common.user")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
              noWrap
              title={user.email}
            >
              {user.email}
            </Typography>
            <Chip
              label={user.status.replace(/_/g, " ")}
              size="small"
              sx={{
                mt: 1,
                height: 22,
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "capitalize",
                bgcolor: "action.hover",
              }}
            />
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          {t("adminUserRoles.joined")}{" "}
          {new Date(user.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="overline"
          sx={{
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "text.secondary",
          }}
        >
          {t("adminUserRoles.rolesLabel")}
        </Typography>

        <Stack
          direction="row"
          sx={{ mt: 1.25, flexWrap: "wrap", gap: "2px" }}
        >
          {ROLES.map((role) => {
            const has = user.roles.includes(role);
            const label =
              busy === role
                ? t("adminUserRoles.working")
                : ROLE_LABELS[role];
            return (
              <Chip
                key={role}
                label={label}
                size="small"
                disabled={busy !== null}
                onClick={() => void toggle(role, has)}
                title={
                  has
                    ? `${t("adminUserRoles.remove")} ${ROLE_LABELS[role]}`
                    : `${t("adminUserRoles.add")} ${ROLE_LABELS[role]}`
                }
                sx={{
                  ...roleChipSx(role, has),
                  opacity: has ? 1 : 0.92,
                }}
              />
            );
          })}
        </Stack>

        {user.roles.includes("teacher") ? (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: ROLE_ACCENT.teacher.soft,
              border: "1px solid",
              borderColor: "color-mix(in srgb, #49BEFF 35%, transparent)",
            }}
          >
            <Typography variant="caption" sx={{ color: ROLE_ACCENT.teacher.onSoft, lineHeight: 1.45 }}>
              {t("adminUserRoles.teacherNote")}
              {user.teacherProfileStatus
                ? ` ${t("adminUserRoles.profileStatus")}: ${user.teacherProfileStatus}.`
                : ` ${t("adminUserRoles.noTeacherProfile")}`}
              {user.teacherApplicationStatus
                ? ` ${t("adminUserRoles.applicationStatus")}: ${user.teacherApplicationStatus}.`
                : null}
            </Typography>
          </Box>
        ) : null}

        {error ? (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminUserRolesPanel({
  initialUsers,
}: {
  initialUsers: AdminUserRoleView[];
}) {
  const { t } = useDashboardI18n();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRoleView[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const skipInitialFetch = useRef(true);

  const runSearch = useCallback(async (value: string) => {
    setLoading(true);
    setMessage(null);
    const res = await searchUsersForRoleAdmin(value.trim());
    setLoading(false);
    if (!res.ok) {
      setMessage(res.error);
      return;
    }
    setUsers(res.users);
    if (value.trim().length >= 2 && res.users.length === 0) {
      setMessage(t("adminUserRoles.noResults"));
    }
  }, [t]);

  useEffect(() => {
    if (skipInitialFetch.current && query === "") {
      skipInitialFetch.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      void runSearch(query);
    }, 350);
    return () => window.clearTimeout(id);
  }, [query, runSearch]);

  function patchUser(updated: AdminUserRoleView) {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u)),
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(93, 135, 255, 0.07) 0%, rgba(19, 222, 185, 0.06) 100%)",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
            {t("adminUserRoles.intro")}
          </Typography>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mb: 2.5,
          p: 2.5,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <DashField label={t("adminUserRoles.searchLabel")}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("adminUserRoles.searchPlaceholder")}
              className={dashInputClass}
              style={{ ...dashInputStyle(), flex: "1 1 12rem" }}
              autoComplete="off"
            />
            <Button
              variant="contained"
              disableElevation
              startIcon={<IconSearch size={18} />}
              onClick={() => void runSearch(query)}
              disabled={loading}
            >
              {loading ? t("adminUserRoles.searching") : t("common.search")}
            </Button>
          </Box>
        </DashField>
      </Card>

      {message ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {message}
        </Typography>
      ) : null}

      <Grid container spacing={2.5}>
        {users.map((user) => (
          <Grid key={user.id} size={{ xs: 12, sm: 6, xl: 4 }}>
            <UserRoleCard user={user} onUpdated={patchUser} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
