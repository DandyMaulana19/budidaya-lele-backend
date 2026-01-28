import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema.js";

export const deviceTypeEnum = pgEnum("device_type", ["android", "ios"]);

export const userDeviceTokens = pgTable("user_device_tokens", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    fcmToken: varchar("fcm_token").notNull(),
    deviceType: deviceTypeEnum("device_type").notNull(),
    deviceName: varchar("device_name", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    lastActive: timestamp("last_active", { mode: "string" }).defaultNow().notNull(),
});

export const userDeviceTokensRelations = relations(userDeviceTokens, ({ one }) => ({
    user: one(users, {
        fields: [userDeviceTokens.userId],
        references: [users.id],
    }),
}));

export const usersDeviceTokensRelations = relations(users, ({ many }) => ({
    deviceTokens: many(userDeviceTokens),
}));
