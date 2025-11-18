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
    .number({
      required_error: "Initial amount is required",
    })
    .int("Initial amount must be an integer")
    .min(0, "Initial amount must be at least 0"),

  averageWeight: z
    .number({
      required_error: "Average weight is required",
    })
    .min(1, "Average weight must be at least 1")
    .positive("Average weight must be positive"),

  currentAmount: z
    .number({
      required_error: "Current amount is required",
    })
    .int("Current amount must be an integer")
    .min(1, "Current amount must be at least 1")
    .positive("Current amount must be positive"),
});
