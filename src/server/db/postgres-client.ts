import postgres from "postgres";

export function postgresClientOptions(
  url: string,
): postgres.Options<Record<string, postgres.PostgresType>> {
  const needsSsl =
    url.includes("sslmode=require") ||
    url.includes("neon.tech") ||
    url.includes("supabase.co");
  return {
    max: 10,
    prepare: false,
    connect_timeout: 30,
    ...(needsSsl ? { ssl: "require" as const } : {}),
  };
}

export function createPostgres(url: string, max?: number) {
  const base = postgresClientOptions(url);
  return postgres(url, { ...base, max: max ?? base.max });
}
