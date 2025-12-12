import { pgTable, uuid, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";

export const activityEnum = pgEnum("condition", [
  "Create Feed Report",
  "Create Harvest Report",
  "Create Seed Report",
  "Create Mortality Report",
]);

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey(),
  reportId: uuid("report_id").notNull(),
  user: varchar("user").notNull(),
  poolName: varchar("name", { length: 255 }).notNull(),
  activity: activityEnum().notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
});
