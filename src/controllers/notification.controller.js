import { eq, desc } from "drizzle-orm";
import { notifications, pools, poolAccesses } from "../database/schema/index.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getNotifications = async (request, reply) => {
    const db = request.server.db;
    const { id: userId, role } = request.user;

    try {
        let query;
        if (role === "owner") {
            query = db
                .select({
                    id: notifications.id,
                    poolName: pools.name,
                    type: notifications.type,
                    title: notifications.title,
                    message: notifications.message,
                    createdAt: notifications.createdAt,
                })
                .from(notifications)
                .leftJoin(pools, eq(notifications.poolId, pools.id))
                .orderBy(desc(notifications.createdAt));
        } else {
            query = db
                .select({
                    id: notifications.id,
                    poolName: pools.name,
                    type: notifications.type,
                    title: notifications.title,
                    message: notifications.message,
                    createdAt: notifications.createdAt,
                })
                .from(notifications)
                .innerJoin(pools, eq(notifications.poolId, pools.id))
                .innerJoin(poolAccesses, eq(pools.id, poolAccesses.poolId))
                .where(eq(poolAccesses.userId, userId))
                .orderBy(desc(notifications.createdAt));
        }

        const data = await query;

        return successResponse(reply, "Notification fetched", data, 200);
    } catch (err) {
        request.log?.error(err);
        return errorResponse(reply, "Internal server error", null, 500);
    }
};
