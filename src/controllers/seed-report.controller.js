import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { successResponse, errorResponse } from "../helper/response.js";
import { seedReports } from "../database/schema/seed-reports.schema.js";
import { seedReportSchema } from "../validations/seed-report.validation.js";

export const getSeedReports = async (request, reply) => {
  const db = request.server?.db;

  const data = await db
    .select()
    .from(seedReports)
    .where(isNull(seedReports.deletedAt));

  if (!data) {
    return successResponse(reply, "internal server error", data, 500);
  }
  console.log(data);

  return successResponse(reply, "data fetched", data, 200);
};

export const getSeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(seedReports)
    .where(and(eq(seedReports.id, id), isNull(seedReports.deletedAt)));

  if (!data)
    return errorResponse(reply, `data with id ${id} not found`, null, 404);

  return successResponse(reply, "data fetched", data, 200);
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
      poolId: "4e276316-32c3-455e-b7b3-df61c429cfdc",
      userId: "1054cf7b-ffb9-42e3-ad28-9917b8a00e30",
      // userId: request.user.user_id
      // poolId: request.body.poolId,
      ...validation.data,
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(seedReports).values(payload).returning();

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

    console.log(data);

    if (!data || data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data updated", data, 200);
  } catch (error) {
    return errorResponse(reply, error, null, 500);
  }
};

export const deleteSeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const date = new Date();

    await db
      .update(seedReports)
      .set({ deletedAt: date })
      .where(eq(seedReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    return errorResponse(reply, "internal server error", null, 500);
  }
};
