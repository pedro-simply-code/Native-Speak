export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureDatabaseSchema } = await import("@/server/db/ensure-schema");
  try {
    await ensureDatabaseSchema();
  } catch (error) {
    console.error("[db] Could not apply schema on startup:", error);
  }
}
