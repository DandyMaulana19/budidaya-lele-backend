import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pool } from "./pool.schema.js";
import { users } from "./users.schema.js";

export const harvestReport = pgTable("harvest_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pool.id, { onDelete: "cascade" }),
  reportDate: date("report_date").notNull(),
  quantity: integer("quantity").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const poolRelations = relations(pool, ({ many }) => ({
  harvestReports: many(harvestReport),
}));

export const userRelations = relations(users, ({ many }) => ({
  harvestReports: many(harvestReport),
}));

export const harvestReportRelations = relations(harvestReport, ({ one }) => ({
  user: one(users, {
    fields: [harvestReport.userId],
    references: [users.id],
  }),
  pool: one(pool, {
    fields: [harvestReport.poolId],
    references: [pool.id],
  }),
}));
