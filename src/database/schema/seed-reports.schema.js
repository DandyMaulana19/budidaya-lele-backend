import {
  pgTable,
  uuid,
  timestamp,
  integer,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pools } from "./pools.schema.js";
import { users } from "./users.schema.js";

export const seedReports = pgTable("seed_reports", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id")
    .notNull()
    .references(() => pools.id, { onDelete: "cascade" }),
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

export const poolRelations = relations(pools, ({ many }) => ({
  seedReports: many(seedReports),
}));

export const userRelations = relations(users, ({ many }) => ({
  seedReports: many(seedReports),
}));

export const seedReportRelations = relations(seedReports, ({ one }) => ({
  user: one(users, {
    fields: [seedReports.userId],
    references: [users.id],
  }),
  pool: one(pools, {
    fields: [seedReports.poolId],
    references: [pools.id],
  }),
}));
