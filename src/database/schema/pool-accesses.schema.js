import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";
import { pools } from "./pools.schema.js";
import { relations } from "drizzle-orm";

export const poolAccesses = pgTable("pool_accesses", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  poolId: uuid("pool_id")
    .notNull()
    .references(() => pools.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const poolRelations = relations(pools, ({ many }) => ({
  access: many(poolAccesses),
}));

export const userRelations = relations(users, ({ many }) => ({
  poolAccess: many(poolAccesses),
}));

export const poolAccessRelations = relations(poolAccesses, ({ one }) => ({
  user: one(users, {
    fields: [poolAccesses.userId],
    references: [users.id],
  }),
  pool: one(pools, {
    fields: [poolAccesses.poolId],
    references: [pools.id],
  }),
}));
