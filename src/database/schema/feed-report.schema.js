import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pool } from "./pool.schema.js";
import { users } from "./user.schema.js";

export const feedReport = pgTable("feed_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pool.id, { onDelete: "cascade" }),
  reportDate: timestamp("report_date").notNull(),
  imageUrl: text("image_url").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const poolRelations = relations(pool, ({ many }) => ({
  feedReports: many(feedReport),
}));

export const userRelations = relations(users, ({ many }) => ({
  feedReports: many(feedReport),
}));

export const feedReportRelations = relations(feedReport, ({ one }) => ({
  user: one(users, {
    fields: [feedReport.userId],
    references: [users.id],
  }),
  pool: one(pool, {
    fields: [feedReport.poolId],
    references: [pool.id],
  }),
}));
