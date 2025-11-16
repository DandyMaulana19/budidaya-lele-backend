import { z } from "zod";
import { randomUUID } from "crypto";
import { seedReports } from "../database/schema/seed-reports.schema.js";
import { successResponse, errorResponse } from "../helper/response.js";
import { eq } from "drizzle-orm";

const seedReportSchema = z.object({
  reportDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  initialAmount: z.number().int().min(0).positive(),
  averageWeight: z.float32().min(0).positive(),
  currentAmount: z.number().int().min(0).positive(),
});

export const getSeedReports = async (request, reply) => {
  const db = request.server?.db;

  const data = await db
    .select()
    .from(seedReports)
    .where(eq(seedReports.deletedAt, null));

  return successResponse(reply, "data fetched", data, 200);
};

export const getSeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(seedReports)
    .where(eq(seedReports.id, id))
    .where(eq(seedReports.deletedAt, null));

  if (!data)
    return errorResponse(reply, `data with id ${id} not found`, null, 404);

  return successResponse(reply, "data fetched", data, 200);
};

export const createSeedReport = async (request, reply) => {
  const db = request.server?.db;

  const validation = seedReportSchema.safeParse(request.body);
  if (!validation.success)
    return errorResponse(reply, validation.error.message(), null, 400);

  try {
    const now = new Date();

    const payload = {
      id: randomUUID(),
      poolId: request.body.poolId,
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
  if (!validation.success)
    return errorResponse(reply, validation.error.message(), null, 400);

  try {
    const payload = {
      ...validation.data,
      updatedAt: new Date(),
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
    return errorResponse(reply, "internal server error", null, 500);
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
