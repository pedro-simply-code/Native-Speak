"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import type { OverviewChartData } from "@/server/queries/overview-analytics";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#5D87FF",
  completed: "#13DEB9",
  cancelled: "#FA896B",
  no_show: "#FFAE1F",
};

type Variant = "platform" | "family" | "teacher";

export function OverviewChartsPanel({
  data,
  variant = "platform",
}: {
  data: OverviewChartData;
  variant?: Variant;
}) {
  const { t } = useDashboardI18n();
  const { kpis, revenueByMonth, bookingsByWeek, appointmentsByStatus } = data;

  const kpiCards = [
    {
      key: "revenue",
      label: t("overviewCharts.kpiRevenue"),
      value: formatUsd(kpis.revenueCents),
      hidden: variant === "teacher",
      color: "#5D87FF",
      bg: "#ECF2FF",
      Icon: AttachMoneyOutlinedIcon,
    },
    {
      key: "month",
      label: t("overviewCharts.kpiRevenueMonth"),
      value: formatUsd(kpis.revenueThisMonthCents),
      hidden: variant === "teacher",
      color: "#49BEFF",
      bg: "#E8F7FF",
      Icon: AttachMoneyOutlinedIcon,
    },
    {
      key: "reserved",
      label: t("overviewCharts.kpiReserved"),
      value: String(kpis.reservedClasses),
      color: "#FFAE1F",
      bg: "#FEF5E5",
      Icon: EventAvailableOutlinedIcon,
    },
    {
      key: "completed",
      label: t("overviewCharts.kpiCompleted"),
      value: String(kpis.completedClasses),
      color: "#13DEB9",
      bg: "#E6FFFA",
      Icon: CheckCircleOutlineOutlinedIcon,
    },
    {
      key: "upcoming",
      label: t("overviewCharts.kpiUpcoming"),
      value: String(kpis.upcomingClasses),
      hidden: variant === "platform",
      color: "#5D87FF",
      bg: "#ECF2FF",
      Icon: CalendarMonthOutlinedIcon,
    },
  ].filter((c) => !c.hidden);

  const pieData = appointmentsByStatus
    .filter((s) => s.value > 0)
    .map((s, id) => ({
      id,
      value: s.value,
      label: s.label,
      color: STATUS_COLORS[s.label] ?? "#5A6A85",
    }));

  const revenueLabels = revenueByMonth.map((p) => p.label);
  const revenueValues = revenueByMonth.map((p) => p.value / 100);
  const bookingLabels = bookingsByWeek.map((p) => p.label);
  const bookingValues = bookingsByWeek.map((p) => p.value);

  const showRevenue = variant !== "teacher" && revenueValues.some((v) => v > 0);

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {kpiCards.map(({ key, label, value, color, bg, Icon }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: "100%" }}>
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
                    {label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ mt: 0.5, fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    {value}
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

      <Grid container spacing={2.5}>
        {variant !== "teacher" ? (
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  {t("overviewCharts.revenueTitle")}
                </Typography>
                {showRevenue ? (
                  <LineChart
                    height={280}
                    margin={{ left: 56, right: 16, top: 8, bottom: 32 }}
                    xAxis={[
                      {
                        data: revenueLabels,
                        scaleType: "point",
                      },
                    ]}
                    yAxis={[{ width: 52 }]}
                    series={[
                      {
                        data: revenueValues,
                        area: true,
                        color: "#5D87FF",
                        showMark: false,
                      },
                    ]}
                    sx={{
                      "& .MuiAreaElement-root": { fillOpacity: 0.15 },
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("overviewCharts.noRevenue")}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : null}

        <Grid
          size={{
            xs: 12,
            lg: variant === "teacher" ? 7 : 5,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {t("overviewCharts.bookingsTitle")}
              </Typography>
              <BarChart
                height={280}
                margin={{ left: 40, right: 8, top: 8, bottom: 56 }}
                xAxis={[
                  {
                    data: bookingLabels,
                    scaleType: "band",
                    tickLabelStyle: { fontSize: 10 },
                  },
                ]}
                series={[
                  {
                    data: bookingValues,
                    color: "#49BEFF",
                    label: t("overviewCharts.bookingsSeries"),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: variant === "teacher" ? 5 : 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {t("overviewCharts.statusTitle")}
              </Typography>
              {pieData.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        innerRadius: 52,
                        outerRadius: 88,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={240}
                    width={260}
                    hideLegend
                  />
                  <Box component="ul" sx={{ m: 0, pl: 2, flex: 1, minWidth: 140 }}>
                    {pieData.map((d) => (
                      <Box
                        component="li"
                        key={d.label}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.75,
                          typography: "body2",
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: d.color,
                          }}
                        />
                        <span style={{ textTransform: "capitalize" }}>{d.label}</span>
                        <Box component="span" sx={{ ml: "auto", fontWeight: 600 }}>
                          {d.value}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("overviewCharts.noBookings")}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
