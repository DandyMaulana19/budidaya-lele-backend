import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pools } from "./pools.schema.js";
import { users } from "./users.schema.js";

export const harvestReports = pgTable("harvest_reports", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pools.id, { onDelete: "cascade" }),
  reportDate: date("report_date").notNull(),
  quantity: integer("quantity").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
});

export const poolRelations = relations(pools, ({ many }) => ({
  harvestReports: many(harvestReports),
}));

export const userRelations = relations(users, ({ many }) => ({
  harvestReports: many(harvestReports),
}));

export const harvestReportRelations = relations(harvestReports, ({ one }) => ({
  user: one(users, {
    fields: [harvestReports.userId],
    references: [users.id],
  }),
  pool: one(pools, {
    fields: [harvestReports.poolId],
    references: [pools.id],
  }),
}));
