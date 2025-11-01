import { db } from "../database/config/index.js";
import { mortalityReport } from "../database/schema/mortalityReport.schema.js";
import { randomUUID } from "crypto";

export async function mortalityReportSeeder(userRows, poolRows) {
  const now = new Date();

  const seeder = poolRows.map((p, i) => ({
    id: randomUUID(),
    userId: userRows[i % userRows.length].id,
    poolId: p.id,
    reportDate: "2025-01-01",
    quantity: 5,
    imageUrl: "https://example.com/mortality.jpg",
    createdAt: now,
    updatedAt: now,
  }));

  const data = await db.insert(mortalityReport).values(seeder).returning();

  return data;
}
