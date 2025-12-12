import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { successResponse, errorResponse } from "../utils/response.js";
import { seedReports } from "../database/schema/seed-reports.schema.js";
import { seedReportSchema } from "../validations/seed-report.validation.js";
import {
  activityEnum,
  activityLogs,
} from "../database/schema/log-activity.schema.js";
import { pools } from "../database/schema/pools.schema.js";

export const getSeedReports = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(seedReports)
    .where(eq(seedReports.poolId, id), isNull(seedReports.deletedAt));

  if (!data) {
    return successResponse(reply, "internal server error", data, 500);
  }

  return successResponse(reply, "data fetched", data, 200);
};

export const getSeedReportsByUser = async (request, reply) => {
  const db = request.server?.db;
  const userId = request.user.id;
  const { id } = request.params;

  const data = await db
    .select()
    .from(seedReports)
    .where(
      and(
        eq(seedReports.userId, userId),
        eq(seedReports.poolId, id),
        isNull(seedReports.deletedAt)
      )
    );

  if (!data) {
    return successResponse(reply, "internal server error", data, 500);
  }

  return successResponse(reply, "data fetched", data, 200);
};

export const getSeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const data = await db
      .select()
      .from(seedReports)
      .where(and(eq(seedReports.id, id), isNull(seedReports.deletedAt)));

    if (data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data fetched", data, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};

export const createSeedReport = async (request, reply) => {
  const db = request.server?.db;

  const validation = seedReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);

    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    const payload = {
      id: randomUUID(),
      poolId: request.body.poolId || "4e276316-32c3-455e-b7b3-df61c429cfdc",
      userId: request.user?.id,
      ...validation.data,
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(seedReports).values(payload).returning();

    const [{ poolName }] = await db
      .select({ poolName: pools.name })
      .from(pools)
      .where(eq(pools.id, payload.poolId));

    const activity = {
      id: randomUUID(),
      reportId: payload.id,
      userId: payload.userId,
      poolName,
      activity: activityEnum.enumValues[2],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(activityLogs).values(activity);

    return successResponse(reply, "data created", data, 201);
  } catch (err) {
    request.log?.error(err);
    return errorResponse(reply, "internal server error", null, 500);
  }
};

export const updateSeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const validation = seedReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);

    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    const payload = {
      ...validation.data,
      updatedAt: now,
    };

    const data = await db
      .update(seedReports)
      .set(payload)
      .where(eq(seedReports.id, id))
      .returning();

    if (!data || data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data updated", data, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};

export const deleteSeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    await db
      .update(seedReports)
      .set({ deletedAt: now })
      .where(eq(seedReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};
