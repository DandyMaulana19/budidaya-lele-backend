import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { errorResponse, successResponse } from "../helper/response.js";
import { harvestReports } from "../database/schema/harvest-reports.schema.js";
import { harvestReportSchema } from "../validations/harvest-report.validation.js";

export const getHarvestReports = async (request, reply) => {
  const db = request.server?.db;

  const data = await db.select().from(harvestReports).where(isNull(harvestReports.deletedAt));

  return successResponse(reply, "data fetched", data, 200);
};

export const getHarvestReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(harvestReports)
    .where(and(eq(harvestReports.id, id), isNull(harvestReports.deletedAt)));

  if (!data) return errorResponse(reply, `data with id ${id} not found`, null, 404);

  return successResponse(reply, "data fetched", data, 200);
};

export const createHarvestReport = async (request, reply) => {
  const db = request.server?.db;

  const validation = harvestReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);
    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const now = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).replace(" ", "T");

    const payload = {
      id: randomUUID(),
      userId: request.body.userId,
      poolId: request.body.poolId,
      ...validation.data,
      imageUrl: "https://example.com/harvest.jpg",
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(harvestReports).values(payload).returning();

    return successResponse(reply, "data created", data, 201);
  } catch (err) {
    request.log?.error(err);
    return errorResponse(reply, err, null, 500);
  }
};

export const updateHarvestReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const validation = harvestReportSchema.safeParse(request.body);

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);
    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const now = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" }).replace(" ", "T");

    const payload = {
      ...validation.data,
      imageUrl: "https://example.com/harvest.jpg",
      updatedAt: now,
    };

    const data = await db.update(harvestReports).set(payload).where(eq(harvestReports.id, id)).returning();

    console.log(data);

    if (!data || data.length === 0) return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data updated", data, 200);
  } catch (error) {
    return errorResponse(reply, error, null, 500);
  }
};

export const deleteHarvestReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const now = new Date()
      .toLocaleString("sv-SE", {
        timeZone: "Asia/Jakarta",
      })
      .replace(" ", "T");

    await db.update(harvestReports).set({ deletedAt: now }).where(eq(harvestReports.id, id)).returning();
  } catch (error) {
    return errorResponse(reply, "internal server error", null, 500);
  }
};
