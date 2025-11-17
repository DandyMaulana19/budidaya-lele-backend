import { z } from "zod";

export const feedReportSchema = z.object({
  reportDate: z
    .string({
      required_error: "Report date is required",
    })
    .nonempty("Report date is required")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
});
