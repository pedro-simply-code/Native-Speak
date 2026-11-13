import { requireDb } from "@/server/db";
import { auditLogs } from "@/server/db/schema";

export async function recordSecurityAudit(
  action: string,
  opts: {
    actorUserId?: string | null;
    target?: string;
    meta?: Record<string, unknown>;
    ip?: string | null;
  },
) {
  try {
    const db = requireDb();
    await db.insert(auditLogs).values({
      actorUserId: opts.actorUserId ?? null,
      action,
      target: opts.target,
      meta: opts.meta ?? {},
      ip: opts.ip ?? null,
    });
  } catch {
    /* audit must not break auth */
  }
}
