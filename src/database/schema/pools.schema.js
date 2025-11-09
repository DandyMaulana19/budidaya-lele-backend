import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";

export const pools = pgTable("pools", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  acidity: decimal("acidity", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
