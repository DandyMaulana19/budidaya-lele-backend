import { z } from "zod";

export const seedReportSchema = z.object({
  reportDate: z
    .string({
      required_error: "Report date is required",
    })
    .nonempty("Report date is required")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),

  initialAmount: z
    .int("Initial amount must be an integer")
    .min(1, "Initial amount must be at least 1"),

  averageWeight: z
    .int("Average weight must be an integer")
    .min(1, "Average weight must be at least 1"),

  currentAmount: z
    .int("Current amount must be an integer")
    .min(1, "Current amount must be at least 1"),

  poolId: z
    .string({ required_error: "Pool Id is required" })
    .nonempty("Pool Id is required"),
});
