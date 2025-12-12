import fs from "fs";
import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { generateUploadPath } from "../utils/helper.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { mortalityReports } from "../database/schema/mortality-reports.schema.js";
import { mortalityReportSchema } from "../validations/mortality-report.validation.js";
import { fileSchema } from "../validations/file.validation.js";
import {
  activityEnum,
  activityLogs,
} from "../database/schema/log-activity.schema.js";
import { pools } from "../database/schema/pools.schema.js";
import sharp from "sharp";

export const getMortalityReports = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(mortalityReports)
    .where(eq(mortalityReports.poolId, id), isNull(mortalityReports.deletedAt));

  return successResponse(reply, "data fetched", data, 200);
};

export const getMortalityReportsByUser = async (request, reply) => {
  const db = request.server?.db;
  const userId = request.user.id;
  const { id } = request.params;

  const data = await db
    .select()
    .from(mortalityReports)
    .where(
      and(
        eq(mortalityReports.userId, userId),
        eq(mortalityReports.poolId, id),
        isNull(mortalityReports.deletedAt)
      )
    );

  return successResponse(reply, "data fetched", data, 200);
};

export const getMortalityReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const data = await db
      .select()
      .from(mortalityReports)
      .where(
        and(eq(mortalityReports.id, id), isNull(mortalityReports.deletedAt))
      );

    if (data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data fetched", data, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};

export const createMortalityReport = async (request, reply) => {
  const db = request.server?.db;
  const body = request.body;

  if (!body || !body.imageUrl) {
    return errorResponse(reply, "imageUrl file is required", null, 400);
  }

  const fileValidation = fileSchema.safeParse({
    fieldname: body.imageUrl.fieldname,
    mimetype: body.imageUrl.mimetype,
    filename: body.imageUrl.filename,
  });

  const validation = mortalityReportSchema.safeParse({
    reportDate: body.reportDate.value,
    quantity: Number(body.quantity.value),
  });

  if (!fileValidation.success || !validation.success) {
    const fileIssues = fileValidation.success
      ? []
      : fileValidation.error.issues;
    const validationIssues = validation.success ? [] : validation.error.issues;
    const errorMessages = [...fileIssues, ...validationIssues].map(
      (issue) => issue.message
    );
    request.log?.error("Validation errors:", errorMessages);
    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const { filePath } = await generateUploadPath(
      body.imageUrl.filename,
      "mortality-reports",
      body.imageUrl.mimetype
    );

    const buffer = await body.imageUrl.toBuffer();
    let processedBuffer;

    try {
      processedBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer();
    } catch (err) {
      request.log?.error("Image processing failed, saving original:", err);
      processedBuffer = buffer;
    }

    fs.writeFileSync(filePath, processedBuffer);

    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    const payload = {
      id: randomUUID(),
      userId: request.user.id,
      poolId: body.poolId.value,
      ...validation.data,
      imageUrl: filePath,
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(mortalityReports).values(payload).returning();

    const [{ poolName }] = await db
      .select({ poolName: pools.name })
      .from(pools)
      .where(eq(pools.id, payload.poolId));

    const activity = {
      id: randomUUID(),
      reportId: payload.id,
      user: request.user.name,
      poolName: poolName,
      activity: activityEnum.enumValues[3],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(activityLogs).values(activity);

    return successResponse(reply, "data created", data, 201);
  } catch (err) {
    request.log?.error(err);
    return errorResponse(reply, err, null, 500);
  }
};

export const updateMortalityReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;
  const body = request.body;

  if (!body || !body.imageUrl) {
    return errorResponse(reply, "imageUrl file is required", null, 400);
  }

  const fileValidation = fileSchema.safeParse({
    fieldname: body.imageUrl.fieldname,
    mimetype: body.imageUrl.mimetype,
    filename: body.imageUrl.filename,
  });

  const validation = mortalityReportSchema.safeParse({
    reportDate: body.reportDate.value,
    quantity: Number(body.quantity.value),
  });

  if (!fileValidation.success || !validation.success) {
    const fileIssues = fileValidation.success
      ? []
      : fileValidation.error.issues;
    const validationIssues = validation.success ? [] : validation.error.issues;
    const errorMessages = [...fileIssues, ...validationIssues].map(
      (issue) => issue.message
    );
    return errorResponse(reply, errorMessages, null, 400);
  }

  try {
    const { filePath, publicPath } = await generateUploadPath(
      body.imageUrl.filename,
      "mortality-reports",
      body.imageUrl.mimetype
    );

    const buffer = await body.imageUrl.toBuffer();
    fs.writeFileSync(filePath, buffer);

    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    const userId = request.user?.id || "cb1d213a-245b-4a2a-9e31-575d74e6fd9e";

    if (!userId) {
      return errorResponse(reply, "User ID is required", null, 400);
    }
    const payload = {
      ...validation.data,
      imageUrl: filePath,
      updatedAt: now,
    };

    const data = await db
      .update(mortalityReports)
      .set(payload)
      .where(eq(mortalityReports.id, id))
      .returning();

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
    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    await db
      .update(mortalityReports)
      .set({ deletedAt: now })
      .where(eq(mortalityReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};
