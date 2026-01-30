import { relations } from "drizzle-orm";
import { pools } from "./pools.schema.js";
import { pgTable, uuid, timestamp, decimal } from "drizzle-orm/pg-core";

export const poolDatas = pgTable("pool_datas", {
  id: uuid("id").primaryKey(),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pools.id, { onDelete: "cascade" }),
  acidity: decimal("acidity", { precision: 5, scale: 2 }).notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const poolRelations = relations(pools, ({ many }) => ({
  poolDatas: many(poolDatas),
}));

export const poolDatasRelations = relations(poolDatas, ({ one }) => ({
  pool: one(pools, {
    fields: [poolDatas.poolId],
    references: [pools.id],
  }),
}));
