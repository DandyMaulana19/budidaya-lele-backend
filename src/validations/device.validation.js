import z from "zod";

export const deviceSchema = z.object({
    fcm_token: z.string({ required_error: "fcm_token is required" }),
    device_name: z.string().optional(),
    device_type: z.enum(["android", "ios"], { required_error: "device_type must be either 'android' or 'ios'" }),
});

export const unregisterSchema = z.object({
    fcm_token: z.string({ required_error: "fcm_token is required" }),
});
