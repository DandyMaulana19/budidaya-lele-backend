import { db } from "../database/config/index.js";
import { feedReports } from "../database/schema/feed-reports.schema.js";
import { randomUUID } from "crypto";

export async function feedReportSeeder(userRows, poolRows) {
  const now = new Date().toISOString();

  await db.delete(feedReports).execute();

  const seeder = poolRows.map((p, i) => ({
    id: randomUUID(),
    userId: userRows[i % userRows.length].id,
    poolId: p.id,
    reportDate: now,
    imageUrl: "https://example.com/feed.jpg",
    createdAt: now,
    updatedAt: now,
  }));

  const data = await db.insert(feedReports).values(seeder).returning();

  return data;
}
