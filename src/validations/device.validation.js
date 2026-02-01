import z from "zod";

export const registerDeviceSchema = z.object({
    fcmToken: z.string({ required_error: "fcmToken is required" }),
    deviceName: z.string().optional(),
    deviceType: z.enum(["android", "ios"], { required_error: "deviceType must be either 'android' or 'ios'" }),
});

export const unregisterDeviceSchema = z.object({
    fcmToken: z.string({ required_error: "fcmToken is required" }),
});
