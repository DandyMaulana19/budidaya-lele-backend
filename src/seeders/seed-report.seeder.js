import { db } from "../database/config/index.js";
import { seedReport } from "../database/schema/seedReport.schema.js";
import { randomUUID } from "crypto";

export async function seedReportSeeder(userRows, poolRows) {
  const now = new Date();

  const seeder = poolRows.map((p, i) => ({
    id: randomUUID(),
    userId: userRows[i % userRows.length].id,
    poolId: p.id,
    reportDate: "2025-01-01",
    initialAmount: 1000,
    currentAmount: 980,
    averageWeight: 0.45,
    createdAt: now,
    updatedAt: now,
  }));

  const data = await db.insert(seedReport).values(seeder).returning();

  return data;
}
