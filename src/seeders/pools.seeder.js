import { db } from "../database/config/index.js";
import { pools } from "../database/schema/pools.schema.js";
import { randomUUID } from "crypto";

export async function poolSeeder(userRows) {
  const now = new Date().toISOString();

  const employees = userRows.filter((u) => u.role === "employee");

  const seeder = Array.from({ length: 12 }, (_, i) => {
    const assignedEmployee = employees[i % employees.length];

    return {
      id: randomUUID(),
      userId: assignedEmployee.id,
      name: `Kolam ${i + 1}`,
      temperature: 28.5,
      acidity: 7.2,
      createdAt: now,
      updatedAt: now,
    };
  });

  const data = await db.insert(pools).values(seeder).returning();

  return data;
}
