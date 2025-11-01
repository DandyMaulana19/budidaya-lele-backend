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

export const mortalityReport = pgTable("mortality_report", {
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
  createdat: timestamp("created_at").defaultNow().notNull(),
  updatedat: timestamp("updated_at").defaultNow().notNull(),
  deletedat: timestamp("deleted_at"),
});

export const poolRelations = relations(pool, ({ many }) => ({
  mortalityReports: many(mortalityReport),
}));

export const userRelations = relations(users, ({ many }) => ({
  mortalityReports: many(mortalityReport),
}));

export const mortalityReportRelations = relations(
  mortalityReport,
  ({ one }) => ({
    user: one(users, {
      fields: [mortalityReport.userId],
      references: [users.id],
    }),
    pool: one(pool, {
      fields: [mortalityReport.poolId],
      references: [pool.id],
    }),
  })
);
