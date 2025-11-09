import { db } from "../database/config/index.js";
import { users } from "../database/schema/users.schema.js";
import { randomUUID } from "crypto";

export async function userSeeder() {
  const now = new Date();

  const data = await db
    .insert(users)
    .values([
      {
        id: randomUUID(),
        name: "Owner User",
        password: "password123",
        email: "owner@example.com",
        role: "owner",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Employee User 1",
        password: "password123",
        email: "employee@example.com",
        role: "employee",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Employee User 2",
        password: "password123",
        email: "employee@example.com",
        role: "employee",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  return data;
}
