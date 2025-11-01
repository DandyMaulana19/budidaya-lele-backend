import {
  pgTable,
  uuid,
  timestamp,
  integer,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pool } from "./pool.schema.js";
import { users } from "./users.schema.js";

export const seedReport = pgTable("seed_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pool.id, { onDelete: "cascade" }),
  reportDate: date("report_date").notNull(),
  initialAmount: integer("initial_amount", { length: 10 }).notNull(),
  currentAmount: integer("current_amount", { length: 10 }).notNull(),
  averageWeight: decimal("average_weight", {
    precision: 5,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const poolRelations = relations(pool, ({ many }) => ({
  seedReports: many(seedReport),
}));

export const userRelations = relations(users, ({ many }) => ({
  seedReports: many(seedReport),
}));

export const seedReportRelations = relations(seedReport, ({ one }) => ({
  user: one(users, {
    fields: [seedReport.userId],
    references: [users.id],
  }),
  pool: one(pool, {
    fields: [seedReport.poolId],
    references: [pool.id],
  }),
}));
