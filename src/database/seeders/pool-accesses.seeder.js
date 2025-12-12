import { db } from "../database/config/index.js";
import { randomUUID } from "crypto";
import { poolAccesses } from "../database/schema/pool-accesses.schema.js";

export async function poolAccessSeeder(userRows = [], poolRows = []) {
  const now = new Date().toISOString();

  await db.delete(poolAccesses).execute();

  const owner = userRows.find((u) => u.role === "owner");
  const employees = userRows.filter((u) => u.role === "employee");

  const entries = [];

  if (owner) {
    for (const p of poolRows) {
      entries.push({
        id: randomUUID(),
        userId: owner.id,
        poolId: p.id,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const poolsPerEmployee = 6;
  poolRows = poolRows || [];

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    const start = i * poolsPerEmployee;
    const end = start + poolsPerEmployee;
    const assigned = poolRows.slice(start, end);

    for (const p of assigned) {
      entries.push({
        id: randomUUID(),
        userId: employee.id,
        poolId: p.id,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  if (entries.length === 0) return [];

  const data = await db.insert(poolAccesses).values(entries).returning();

  return data;
}
