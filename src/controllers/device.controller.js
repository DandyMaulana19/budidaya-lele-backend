import { eq, and } from "drizzle-orm";
import { userDeviceTokens } from "../database/schema/index.js";
import { registerDeviceSchema, unregisterDeviceSchema } from "../validations/index.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { randomUUID } from "crypto";

export const registerDevice = async (request, reply) => {
    const db = request.server.db;
    const validation = registerDeviceSchema.safeParse(request.body);

    if (!validation.success) {
        return reply.status(400).send({
            success: false,
            error: "Invalid input",
            details: validation.error.issues
        });
    }

    const { fcmToken, deviceName, deviceType } = validation.data;
    const userId = request.user.id; // From JWT

    try {
        // Check if token already exists for this user
        const existing = await db
            .select()
            .from(userDeviceTokens)
            .where(
                and(
                    eq(userDeviceTokens.userId, userId),
                    eq(userDeviceTokens.fcmToken, fcmToken)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            // Update existing record
            await db
                .update(userDeviceTokens)
                .set({
                    deviceName: deviceName || existing[0].deviceName,
                    deviceType: deviceType || existing[0].deviceType,
                    lastActive: new Date().toISOString(),
                })
                .where(eq(userDeviceTokens.id, existing[0].id));

            return successResponse(reply, "Device token updated successfully", null, 200);
        } else {
            // Insert new record
            await db.insert(userDeviceTokens).values({
                id: randomUUID(),
                userId: userId,
                fcmToken: fcmToken,
                deviceName: deviceName,
                deviceType: deviceType,
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

export const unregisterDevice = async (request, reply) => {
    const db = request.server.db;
    const validation = unregisterDeviceSchema.safeParse(request.body);

    if (!validation.success) {
        return reply.status(400).send({
            success: false,
            error: "Invalid input",
            details: validation.error.issues,
        });
    }

    const { fcmToken } = validation.data;
    const userId = request.user.id; // From JWT

    try {
        await db
            .delete(userDeviceTokens)
            .where(
                and(
                    eq(userDeviceTokens.userId, userId),
                    eq(userDeviceTokens.fcmToken, fcmToken)
                )
            );

        return successResponse(reply, "Device token removed successfully", null, 200);
    } catch (err) {
        request.log?.error(err);
        return errorResponse(reply, "Internal server error", null, 500);
    }
};
