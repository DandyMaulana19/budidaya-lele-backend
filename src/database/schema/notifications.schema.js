import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pools } from "./pools.schema.js";

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    poolId: uuid("pool_id")
        .notNull()
        .references(() => pools.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // 'feeder_off', 'ph_alert', 'temp_alert'
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
    pool: one(pools, {
        fields: [notifications.poolId],
        references: [pools.id],
    }),
}));

export const poolsNotificationsRelations = relations(pools, ({ many }) => ({
    notifications: many(notifications),
}));
