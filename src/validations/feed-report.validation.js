import { z } from "zod";

export const feedReportSchema = z.object({
  poolId: z
    .string({ required_error: "Pool Id is required" })
    .nonempty("Pool Id is required"),

  reportDate: z
    .string({
      required_error: "Report Date is required",
    })
    .nonempty("Report Date is required")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
});
