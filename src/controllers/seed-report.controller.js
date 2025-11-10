import { z } from "zod";
import { randomUUID } from "crypto";
import { seedReports } from "../database/schema/seed-reports.schema.js";
import { successResponse, errorResponse } from "../helper/response.js";

const seedReportSchema = z.object({
  reportDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  initialAmount: z.number().int().min(0).positive(),
  averageWeight: z.float32().min(0).positive(),
  currentAmount: z.number().int().min(0).positive(),
});

export const createSeedReport = async (req, reply) => {
  const db = req.server?.db;

  const validation = seedReportSchema.safeParse(req.body);
  if (!validation.success)
    return errorResponse(reply, validation.error.format(), null, 400);

  const { reportDate, initialAmount, currentAmount, averageWeight } =
    validation.data;

  const userId = req.user?.id || req.body.userId;
  if (!userId) {
    return errorResponse(reply, "Missing or unauthorized user", null, 401);
  }

  try {
    const now = new Date();

    const payload = {
      id: randomUUID(),
      userId,
      reportDate,
      initialAmount,
      currentAmount,
      averageWeight,
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(seedReports).values(payload).returning();

    return successResponse(reply, "Seed report created", data, 201);
  } catch (err) {
    req.log?.error(err);
    return errorResponse(reply, "Internal server error", null, 500);
  }
};
