import z from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, { message: "Old password must be at least 6 characters long" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" }),
});
