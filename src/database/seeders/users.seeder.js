import bcrypt from "bcrypt";
import { db } from "../config/index.js";
import { users } from "../schema/index.js";
import { randomUUID } from "crypto";

export async function userSeeder() {
  const now = new Date().toISOString();

  await db.delete(users).execute();

  const data = await db
    .insert(users)
    .values([
      {
        id: randomUUID(),
        name: "Owner User",
        password: await bcrypt.hash("password123", 12),
        email: "owner@example.com",
        role: "owner",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Employee User 1",
        password: await bcrypt.hash("password123", 12),
        email: "employee1@example.com",
        role: "employee",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Employee User 2",
        password: await bcrypt.hash("password123", 12),
        email: "employee2@example.com",
        role: "employee",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  return data;
}
