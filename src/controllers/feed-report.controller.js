import { randomUUID } from "crypto";
import { errorResponse, successResponse } from "../helper/response.js";
import { feedReports } from "../database/schema/feed-reports.schema.js";
import { feedReportSchema } from "../validations/feed-report.validation.js";

export const createFeedReport = async (req, reply) => {
  const db = req.server?.db;

  const validation = feedReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);

    return errorResponse(reply, errorMessages, null, 400);
  }

  const { reportDate, image } = validation.data;

  try {
    const date = new Date();

    const payload = {
      id: randomUUID(),
      userId,
      reportDate,
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
