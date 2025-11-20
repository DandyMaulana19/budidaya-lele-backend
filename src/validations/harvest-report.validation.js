import { z } from "zod";

export const harvestReportSchema = z.object({
  reportDate: z
    .string({
      required_error: "Report date is required",
    })
    .nonempty("Report date is required")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),

  quantity: z
    .number({
      required_error: "Quantity is required",
    })
    .min(1, "Quantity must be at least 1"),
});
