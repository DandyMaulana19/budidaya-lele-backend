import z from "zod";
import { randomUUID } from "crypto";
import { errorResponse, successResponse } from "../helper/response.js";
import { feedReports } from "../database/schema/feed-reports.schema.js";

const feedReportSchema = z.object({
  reportDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "invalid format",
  }),
  image: z.string(),
});

export const createFeedReport = async (req, reply) => {
  const db = req.server?.db;

  const validation = feedReportSchema.safeParse(req.body);
  if (!validation.success)
    return errorResponse(reply, validation.error.format(), null, 400);

  const { reportDate, image } = validation.data;

  const userId = req.user?.id || req.body.userId;
  if (!user) return errorResponse(reply, "Auth required", null, 401);

  try {
    const date = new Date();

    const payload = {
      id: randomUUID(),
      userId,
      reportDate,
      image,
      createdAt: date,
      updatedAt: date,
    };

    const data = await db.insert(feedReports).values(payload).returning();

    return successResponse(reply, "Data Created!", data, 200);
  } catch (err) {
    const msg = req.log?.error(err);
    return errorResponse(reply, msg, null, 400);
  }
};
