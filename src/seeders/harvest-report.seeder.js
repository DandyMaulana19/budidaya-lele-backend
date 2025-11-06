import { db } from "../database/config/index.js";
import { harvestReport } from "../database/schema/harvestReport.schema.js";
import { randomUUID } from "crypto";

export async function harvestReportSeeder(userRows, poolRows) {
  const now = new Date();

  const seeder = poolRows.map((p, i) => ({
    id: randomUUID(),
    userId: userRows[i % userRows.length].id,
    poolId: p.id,
    reportDate: "2025-01-01",
    quantity: 100,
    imageUrl: "https://example.com/harvest.jpg",
    createdAt: now,
    updatedAt: now,
  }));

  const data = await db.insert(harvestReport).values(seeder).returning();

  return data;
}
