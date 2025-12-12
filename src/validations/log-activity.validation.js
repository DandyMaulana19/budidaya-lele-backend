import { z } from "zod";

export const logActivitySchema = z.object({
  reportId: z
    .string({ required_error: "Report Id is required" })
    .nonempty("Report Id is required"),

  user: z
    .string({ required_error: "User is required" })
    .nonempty("User is required"),

  poolName: z
    .string({ required_error: "Pool Name is required" })
    .nonempty("Pool Name is required"),

  activity: z
    .string({ required_error: "Activity is required" })
    .nonempty("Activity is required"),
});
