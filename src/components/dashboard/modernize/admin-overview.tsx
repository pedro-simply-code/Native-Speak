"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { OverviewChartsPanel } from "@/components/dashboard/modernize/overview-charts-panel";
import type { OverviewChartData } from "@/server/queries/overview-analytics";

type Props = {
  stats: {
    managers: number;
    teachers: number;
    families: number;
    openInvites: number;
  };
  charts: OverviewChartData;
};

export function AdminOverview({ stats, charts }: Props) {
  const { t } = useDashboardI18n();

  const statCards = [
    {
      key: "managers",
      labelKey: "adminOverview.statManagers",
      field: "managers" as const,
      color: "#5D87FF",
      bg: "#ECF2FF",
      Icon: PeopleOutlineOutlinedIcon,
    },
    {
      key: "teachers",
      labelKey: "adminOverview.statTeachers",
      field: "teachers" as const,
      color: "#49BEFF",
      bg: "#E8F7FF",
      Icon: SchoolOutlinedIcon,
    },
    {
      key: "families",
      labelKey: "adminOverview.statFamilies",
      field: "families" as const,
      color: "#13DEB9",
      bg: "#E6FFFA",
      Icon: FamilyRestroomOutlinedIcon,
    },
    {
      key: "invites",
      labelKey: "adminOverview.statInvites",
      field: "openInvites" as const,
      color: "#FFAE1F",
      bg: "#FEF5E5",
      Icon: MailOutlineOutlinedIcon,
    },
  ];

  const quickLinks = [
    { href: "/dashboard/admin/users", labelKey: "adminOverview.quickUserRoles" },
    { href: "/dashboard/admin/managers", labelKey: "adminOverview.quickManagers" },
    { href: "/dashboard/teachers", labelKey: "adminOverview.quickTeachers" },
    { href: "/dashboard/admin/families", labelKey: "adminOverview.quickFamilies" },
    { href: "/dashboard/admin/invitations", labelKey: "adminOverview.quickInvitations" },
    { href: "/dashboard/billing", labelKey: "adminOverview.quickBilling" },
    { href: "/dashboard/manager/applications", labelKey: "adminOverview.quickApplications" },
  ];

  return (
    <Stack spacing={3.5}>
      <DashboardPageHeader
        eyebrow={t("roles.admin")}
        title={t("adminOverview.title")}
        description={t("adminOverview.subtitle")}
      />

      <Grid container spacing={2.5}>
        {statCards.map(({ key, labelKey, field, color, bg, Icon }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "@media (prefers-reduced-motion: no-preference)": {
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 28px rgba(42, 53, 71, 0.1)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t(labelKey)}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ mt: 0.5, fontSize: "1.75rem", fontWeight: 700 }}
                  >
                    {stats[field]}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: bg,
                    color,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <OverviewChartsPanel data={charts} variant="platform" />

      <Grid container spacing={2}>
        {quickLinks.map((item) => (
          <Grid key={item.href} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "@media (prefers-reduced-motion: no-preference)": {
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 28px rgba(42, 53, 71, 0.1)",
                  },
                },
              }}
            >
              <CardActionArea
                component={Link}
                href={item.href}
                sx={{ px: 2, py: 1.75 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t(item.labelKey)}
                  </Typography>
                  <ChevronRightIcon fontSize="small" color="action" />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
