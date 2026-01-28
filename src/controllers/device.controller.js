import { eq, and } from "drizzle-orm";
import { userDeviceTokens } from "../database/schema/index.js";
import { deviceSchema, unregisterSchema } from "../validations/index.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { randomUUID } from "crypto";

export const registerDeviceController = async (request, reply) => {
    const db = request.server.db;
    const validation = deviceSchema.safeParse(request.body);

    if (!validation.success) {
        return reply.status(400).send({
            success: false,
            error: "Invalid input",
            details: validation.error.issues
        });
    }

    const { fcm_token, device_name, device_type } = validation.data;
    const userId = request.user.id; // From JWT

    try {
        // Check if token already exists for this user
        const existing = await db
            .select()
            .from(userDeviceTokens)
            .where(
                and(
                    eq(userDeviceTokens.userId, userId),
                    eq(userDeviceTokens.fcmToken, fcm_token)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            // Update existing record
            await db
                .update(userDeviceTokens)
                .set({
                    deviceName: device_name || existing[0].deviceName,
                    deviceType: device_type,
                    lastActive: new Date().toISOString(),
                })
                .where(eq(userDeviceTokens.id, existing[0].id));

            return successResponse(reply, "Device token updated successfully", null, 200);
        } else {
            // Insert new record
            await db.insert(userDeviceTokens).values({
                id: randomUUID(),
                userId: userId,
                fcmToken: fcm_token,
                deviceName: device_name,
                deviceType: device_type,
                lastActive: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            });

            return successResponse(reply, "Device token registered successfully", null, 201);
        }
    } catch (err) {
        request.log?.error(err);
        return errorResponse(reply, "Internal server error", null, 500);
    }
};

export const unregisterDeviceController = async (request, reply) => {
    const db = request.server.db;
    const validation = unregisterSchema.safeParse(request.body);

    if (!validation.success) {
        return reply.status(400).send({
            success: false,
            error: "Invalid input",
            details: validation.error.issues,
        });
    }

    const { fcm_token } = validation.data;
    const userId = request.user.id; // From JWT

    try {
        await db
            .delete(userDeviceTokens)
            .where(
                and(
                    eq(userDeviceTokens.userId, userId),
                    eq(userDeviceTokens.fcmToken, fcm_token)
                )
            );

        return successResponse(reply, "Device token removed successfully", null, 200);
    } catch (err) {
        request.log?.error(err);
        return errorResponse(reply, "Internal server error", null, 500);
    }
};
