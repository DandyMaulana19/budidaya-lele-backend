import z from "zod";

export const authSchema = z.object({
  email: z.email({ required_error: "Email is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Invalid email or password")
    .max(100),
});
