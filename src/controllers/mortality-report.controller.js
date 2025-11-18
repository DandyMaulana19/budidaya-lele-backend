import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { errorResponse, successResponse } from "../helper/response.js";
import { mortalityReports } from "../database/schema/mortality-reports.schema.js";
import { mortalityReportSchema } from "../validations/mortality-report.validation.js";

export const getMortalityReports = async (request, reply) => {
  const db = request.server?.db;

  const data = await db
    .select()
    .from(mortalityReports)
    .where(isNull(mortalityReports.deletedAt));

  return successResponse(reply, "data fetched", data, 200);
};

export const getMortalityReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(mortalityReports)
    .where(
      and(eq(mortalityReports.id, id), isNull(mortalityReports.deletedAt))
    );

  if (!data)
    return errorResponse(reply, `data with id ${id} not found`, null, 404);

  return successResponse(reply, "data fetched", data, 200);
};

export const createMortalityReport = async (request, reply) => {
  const db = request.server?.db;

  const validation = mortalityReportSchema.safeParse(request.body);

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
      poolId: "fc0f38a2-4003-4db2-b1ed-d212df9bb725",
      userId: "85c1ea3a-ea88-4ce8-9a61-6cf593c0df76",
      // userId: request.user.user_id
      // poolId: request.body.poolId,
      ...validation.data,
      imageUrl: "https://example.com/mortality.jpg",
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(mortalityReports).values(payload).returning();

    return successResponse(reply, "data created", data, 201);
  } catch (err) {
    request.log?.error(err);
    return errorResponse(reply, err, null, 500);
  }
};

export const updateMortalityReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const validation = mortalityReportSchema.safeParse(request.body);

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
      imageUrl: "https://example.com/mortality.jpg",
      updatedAt: now,
    };

    const data = await db
      .update(mortalityReports)
      .set(payload)
      .where(eq(mortalityReports.id, id))
      .returning();

    console.log(data);

    if (!data || data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data updated", data, 200);
  } catch (error) {
    return errorResponse(reply, error, null, 500);
  }
};

export const deleteMortalityReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const date = new Date();

    await db
      .update(mortalityReports)
      .set({ deletedAt: date })
      .where(eq(mortalityReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    return errorResponse(reply, "internal server error", null, 500);
  }
};
