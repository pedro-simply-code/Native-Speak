import { desc } from "drizzle-orm";
import { requireDb } from "@/server/db";
import { siteMedia } from "@/server/db/schema";

export async function listSiteMediaForAdmin() {
  const db = requireDb();
  return db.select().from(siteMedia).orderBy(desc(siteMedia.createdAt));
}
