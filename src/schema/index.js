import { uuid } from "drizzle-orm/gel-core";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  pgEnum,
  time,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "owner", "employee"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 12 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pool = pgTable("pool", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  temprature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  acidity: decimal("acidity", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const harvestReport = pgTable("harvest_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  poolId: uuid("pool_id")
    .references(() => pool.id)
    .notNull(),
  reportDate: date("report_date").notNull(),
  quantity: integer("quantity").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const feedReport = pgTable("feed_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  poolId: uuid("pool_id")
    .references(() => pool.id)
    .notNull(),
  reportDate: timestamp("report_date").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const seedReport = pgTable("seed_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  poolId: uuid("pool_id")
    .references(() => pool.id)
    .notNull(),
  reportDate: date("report_date").notNull(),
  initialAmount: integer("initial_amount", { length: 10 }).notNull(),
  currentAmount: integer("current_amount", { length: 10 }).notNull(),
  averageWeight: decimal("average_weight", {
    precision: 5,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mortalityReport = pgTable("mortality_report", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  poolId: uuid("pool_id")
    .references(() => pool.id)
    .notNull(),
  reportDate: date("report_date").notNull(),
  quantity: integer("quantity").notNull(),
  imageUrl: text("image_url").notNull(),
});
