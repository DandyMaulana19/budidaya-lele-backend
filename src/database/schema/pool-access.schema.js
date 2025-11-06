import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema.js";
import { pool } from "./pool.schema.js";
import { relations } from "drizzle-orm";

export const poolAccess = pgTable("pool_access", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  poolId: uuid("pool_id")
    .notNull()
    .references(() => pool.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const poolRelations = relations(pool, ({ many }) => ({
  access: many(poolAccess),
}));

export const userRelations = relations(users, ({ many }) => ({
  poolAccess: many(poolAccess),
}));

export const poolAccessRelations = relations(poolAccess, ({ one }) => ({
  user: one(users, {
    fields: [poolAccess.userId],
    references: [users.id],
  }),
  pool: one(pool, {
    fields: [poolAccess.poolId],
    references: [pool.id],
  }),
}));
