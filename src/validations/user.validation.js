import { z } from "zod";

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({
        required_error: "Old Password is required",
      })
      .nonempty("Old Password is required")
      .min(6, { message: "Old password must be at least 6 characters long" }),

    newPassword: z
      .string({
        required_error: "New Password is required",
      })
      .nonempty("New Password is required")
      .min(6, { message: "New password must be at least 6 characters long" }),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });
