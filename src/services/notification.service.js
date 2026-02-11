import { eq, or, and, inArray, like } from "drizzle-orm";
import { db } from "../database/config/index.js";
import { notifications, users, poolAccesses, userDeviceTokens, pools } from "../database/schema/index.js";
import { sendNotification } from "./fcm.service.js";
import { randomUUID } from "crypto";

export const createAndSendNotification = async (nodeId, type, title, message) => {
    try {
        const poolList = await db.select().from(pools).where(like(pools.name, `%Kolam ${nodeId}%`)).limit(1);

        if (poolList.length === 0) {
            console.warn(`Pool for nodeId ${nodeId} not found. Skipping notification.`);
            return;
        }

        const pool = poolList[0];

        // Create notification record
        await db.insert(notifications).values({
            id: randomUUID(),
            poolId: pool.id,
            type: type,
            title: title,
            message: message,
        });

        // Find recipients Owners + Employees with access to this pool
        const recipients = await db.select({ id: users.id })
            .from(users)
            .leftJoin(poolAccesses, eq(users.id, poolAccesses.userId))
            .where(
                or(
                    eq(users.role, "owner"),
                    and(
                        eq(users.role, "employee"),
                        eq(poolAccesses.poolId, pool.id)
                    )
                )
            );

        const userIds = [...new Set(recipients.map(r => r.id))];

        if (userIds.length === 0) return;

        // Get FCM tokens
        const tokenRecords = await db.select({ token: userDeviceTokens.fcmToken })
            .from(userDeviceTokens)
            .where(inArray(userDeviceTokens.userId, userIds));

        const tokens = tokenRecords.map(t => t.token);

        if (tokens.length > 0) {
            console.log(`Sending FCM notification for Node ${nodeId} to ${tokens.length} tokens...`);
            await sendNotification(tokens, title, message);
        }
    } catch (error) {
        console.error("Error in createAndSendNotification:", error);
    }
};
