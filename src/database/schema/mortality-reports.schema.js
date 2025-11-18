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

export const mortalityReports = pgTable("mortality_reports", {
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
  mortalityReports: many(mortalityReports),
}));

export const userRelations = relations(users, ({ many }) => ({
  mortalityReports: many(mortalityReports),
}));

export const mortalityReportRelations = relations(
  mortalityReports,
  ({ one }) => ({
    user: one(users, {
      fields: [mortalityReports.userId],
      references: [users.id],
    }),
    pool: one(pools, {
      fields: [mortalityReports.poolId],
      references: [pools.id],
    }),
  })
);
