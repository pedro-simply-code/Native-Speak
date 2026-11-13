import { and, count, eq, gte, sql, sum } from "drizzle-orm";
import { connection } from "next/server";
import { requireDbAtRequest } from "@/server/db";
import { classAppointments, payments } from "@/server/db/schema";

export type SeriesPoint = { label: string; value: number };

export type OverviewKpis = {
  revenueCents: number;
  revenueThisMonthCents: number;
  reservedClasses: number;
  completedClasses: number;
  upcomingClasses: number;
};

export type OverviewChartData = {
  kpis: OverviewKpis;
  revenueByMonth: SeriesPoint[];
  bookingsByWeek: SeriesPoint[];
  appointmentsByStatus: SeriesPoint[];
};

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatMonthLabel(d: Date, locale: "en" | "es" = "en") {
  if (locale === "es") {
    return MONTHS_ES[d.getMonth()] ?? d.toLocaleString("es", { month: "short" });
  }
  return d.toLocaleString("en", { month: "short" });
}

function formatWeekLabel(d: Date) {
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function emptyMonthSeries(monthsBack = 6): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ label: formatMonthLabel(d), value: 0 });
  }
  return out;
}

function emptyWeekSeries(weeksBack = 8): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  const now = new Date();
  for (let i = weeksBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    d.setHours(0, 0, 0, 0);
    out.push({ label: formatWeekLabel(d), value: 0 });
  }
  return out;
}

async function revenueSeries(monthsBack = 6, familyUserId?: string) {
  const db = await requireDbAtRequest();
  const since = new Date();
  since.setMonth(since.getMonth() - (monthsBack - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const monthBucket = sql<Date>`date_trunc('month', ${payments.createdAt})`;

  const conditions = [
    eq(payments.status, "succeeded"),
    gte(payments.createdAt, since),
  ];
  if (familyUserId) {
    conditions.push(eq(payments.userId, familyUserId));
  }

  const rows = await db
    .select({
      month: monthBucket,
      total: sum(payments.amountCents),
    })
    .from(payments)
    .where(and(...conditions))
    .groupBy(monthBucket)
    .orderBy(monthBucket);

  const byKey = new Map<string, number>();
  for (const row of rows) {
    if (!row.month) continue;
    const d = new Date(row.month);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    byKey.set(key, Number(row.total ?? 0));
  }

  const series = emptyMonthSeries(monthsBack);
  const now = new Date();
  return series.map((point, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - idx), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return { ...point, value: byKey.get(key) ?? 0 };
  });
}

async function bookingWeekSeries(weeksBack = 8, scope?: { teacherId?: string; familyId?: string }) {
  const db = await requireDbAtRequest();
  const since = new Date();
  since.setDate(since.getDate() - weeksBack * 7);
  since.setHours(0, 0, 0, 0);

  const weekBucket = sql<Date>`date_trunc('week', ${classAppointments.startsAt})`;

  const conditions = [gte(classAppointments.startsAt, since)];
  if (scope?.teacherId) {
    conditions.push(eq(classAppointments.teacherUserId, scope.teacherId));
  }
  if (scope?.familyId) {
    conditions.push(eq(classAppointments.familyUserId, scope.familyId));
  }

  const rows = await db
    .select({
      week: weekBucket,
      total: count(),
    })
    .from(classAppointments)
    .where(and(...conditions))
    .groupBy(weekBucket)
    .orderBy(weekBucket);

  const byTime = new Map<number, number>();
  for (const row of rows) {
    if (!row.week) continue;
    byTime.set(new Date(row.week).getTime(), Number(row.total ?? 0));
  }

  const series = emptyWeekSeries(weeksBack);
  const now = new Date();
  return series.map((point, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (weeksBack - 1 - idx) * 7);
    d.setHours(0, 0, 0, 0);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return { ...point, value: byTime.get(weekStart.getTime()) ?? 0 };
  });
}

async function fetchAppointmentsByStatus(scope?: { teacherId?: string; familyId?: string }) {
  const db = await requireDbAtRequest();
  const conditions = [];
  if (scope?.teacherId) {
    conditions.push(eq(classAppointments.teacherUserId, scope.teacherId));
  }
  if (scope?.familyId) {
    conditions.push(eq(classAppointments.familyUserId, scope.familyId));
  }

  const rows = await db
    .select({
      status: classAppointments.status,
      total: count(),
    })
    .from(classAppointments)
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(classAppointments.status);

  return rows.map((r) => ({
    label: r.status,
    value: Number(r.total ?? 0),
  }));
}

async function loadKpis(scope?: { teacherId?: string; familyId?: string }): Promise<OverviewKpis> {
  const db = await requireDbAtRequest();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paymentScope = scope?.familyId
    ? eq(payments.userId, scope.familyId)
    : undefined;

  const [revenueRow] = await db
    .select({ total: sum(payments.amountCents) })
    .from(payments)
    .where(
      and(
        eq(payments.status, "succeeded"),
        paymentScope,
      ),
    );

  const [revenueMonthRow] = await db
    .select({ total: sum(payments.amountCents) })
    .from(payments)
    .where(
      and(
        eq(payments.status, "succeeded"),
        gte(payments.createdAt, monthStart),
        paymentScope,
      ),
    );

  const apptConditions = [];
  if (scope?.teacherId) {
    apptConditions.push(eq(classAppointments.teacherUserId, scope.teacherId));
  }
  if (scope?.familyId) {
    apptConditions.push(eq(classAppointments.familyUserId, scope.familyId));
  }

  const [reservedRow] = await db
    .select({ total: count() })
    .from(classAppointments)
    .where(
      and(
        eq(classAppointments.status, "scheduled"),
        gte(classAppointments.startsAt, now),
        ...(apptConditions.length ? apptConditions : []),
      ),
    );

  const [completedRow] = await db
    .select({ total: count() })
    .from(classAppointments)
    .where(
      and(
        eq(classAppointments.status, "completed"),
        ...(apptConditions.length ? apptConditions : []),
      ),
    );

  const [upcomingRow] = await db
    .select({ total: count() })
    .from(classAppointments)
    .where(
      and(
        gte(classAppointments.startsAt, now),
        ...(apptConditions.length ? apptConditions : []),
      ),
    );

  return {
    revenueCents: Number(revenueRow?.total ?? 0),
    revenueThisMonthCents: Number(revenueMonthRow?.total ?? 0),
    reservedClasses: Number(reservedRow?.total ?? 0),
    completedClasses: Number(completedRow?.total ?? 0),
    upcomingClasses: Number(upcomingRow?.total ?? 0),
  };
}

export async function getPlatformOverviewCharts(): Promise<OverviewChartData> {
  await connection();
  const [kpis, revenueByMonth, bookingsByWeek, appointmentsByStatus] =
    await Promise.all([
      loadKpis(),
      revenueSeries(6),
      bookingWeekSeries(8),
      fetchAppointmentsByStatus(),
    ]);
  return { kpis, revenueByMonth, bookingsByWeek, appointmentsByStatus };
}

export async function getFamilyOverviewCharts(
  familyUserId: string,
): Promise<OverviewChartData> {
  await connection();
  const [kpis, revenueByMonth, bookingsByWeek, appointmentsByStatus] =
    await Promise.all([
      loadKpis({ familyId: familyUserId }),
      revenueSeries(6, familyUserId),
      bookingWeekSeries(8, { familyId: familyUserId }),
      fetchAppointmentsByStatus({ familyId: familyUserId }),
    ]);
  return { kpis, revenueByMonth, bookingsByWeek, appointmentsByStatus };
}

export async function getTeacherOverviewCharts(
  teacherUserId: string,
): Promise<OverviewChartData> {
  await connection();
  const [kpis, bookingsByWeek, appointmentsByStatus] = await Promise.all([
    loadKpis({ teacherId: teacherUserId }),
    bookingWeekSeries(8, { teacherId: teacherUserId }),
    fetchAppointmentsByStatus({ teacherId: teacherUserId }),
  ]);
  const revenueByMonth = emptyMonthSeries(6);
  return { kpis, revenueByMonth, bookingsByWeek, appointmentsByStatus };
}
