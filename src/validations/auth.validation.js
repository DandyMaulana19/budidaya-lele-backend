import z from "zod";

export const loginSchema = z.object({
  email: z.email({ required_error: "Email is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Invalid email or password")
    .max(100),
});

export const registerSchema = z.object({
  username: z.string().min(5).max(50),
  email: z.string(),
  password: z.string().min(8).max(100),
});
