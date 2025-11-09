import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pools } from "./pools.schema.js";
import { users } from "./users.schema.js";

export const feedReports = pgTable("feed_reports", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pools.id, { onDelete: "cascade" }),
  reportDate: timestamp("report_date").notNull(),
  imageUrl: text("image_url").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const poolRelations = relations(pools, ({ many }) => ({
  feedReports: many(feedReports),
}));

export const userRelations = relations(users, ({ many }) => ({
  feedReports: many(feedReports),
}));

export const feedReportRelations = relations(feedReports, ({ one }) => ({
  user: one(users, {
    fields: [feedReports.userId],
    references: [users.id],
  }),
  pool: one(pools, {
    fields: [feedReports.poolId],
    references: [pools.id],
  }),
}));
