import { randomUUID } from "crypto";
import parse from "postgres-date";
import { and, eq, isNull } from "drizzle-orm";
import { errorResponse, successResponse } from "../helper/response.js";
import { feedReports } from "../database/schema/feed-reports.schema.js";
import { feedReportSchema } from "../validations/feed-report.validation.js";

export const getFeedReports = async (request, reply) => {
  const db = request.server?.db;

  const data = await db
    .select()
    .from(feedReports)
    .where(isNull(feedReports.deletedAt));

  return successResponse(reply, "data fetched", data, 200);
};

export const getFeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(feedReports)
    .where(and(eq(feedReports.id, id), isNull(feedReports.deletedAt)));

  if (!data)
    return errorResponse(reply, `data with id ${id} not found`, null, 404);

  return successResponse(reply, "data fetched", data, 200);
};

export const createFeedReport = async (request, reply) => {
  const db = request.server?.db;

  const validation = feedReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);

    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const now = new Date();
    const reportDate = parse(validation.data.reportDate);

    const payload = {
      id: randomUUID(),
      poolId: "766c2b09-a780-45e0-9518-bd03986c93b6",
      userId: "0fd00030-c5c0-4ce7-ba66-6dd79bdbcad4",
      // userId: request.user.user_id
      // poolId: request.body.poolId,
      reportDate,
      imageUrl: "https://example.com/mortality.jpg",
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(feedReports).values(payload).returning();

    return successResponse(reply, "data created", data, 201);
  } catch (err) {
    request.log?.error(err);
    return errorResponse(reply, "internal server error", null, 500);
  }
};

export const updateFeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const validation = feedReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);

    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const reportDate = parse(validation.data.reportDate);

    const payload = {
      reportDate: reportDate,
      updatedAt: new Date(),
    };

    const data = await db
      .update(feedReports)
      .set(payload)
      .where(eq(feedReports.id, id))
      .returning();

    console.log(data);

    if (!data || data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data updated", data, 200);
  } catch (error) {
    return errorResponse(reply, error, null, 500);
  }
};

export const deleteFeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const date = new Date();

    await db
      .update(feedReports)
      .set({ deletedAt: date })
      .where(eq(feedReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    return errorResponse(reply, "internal server error", null, 500);
  }
};
