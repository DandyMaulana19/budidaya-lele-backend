import fs from "fs";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { generateUploadPath } from "../utils/helper.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { pools } from "../database/schema/pools.schema.js";
import { feedReports } from "../database/schema/feed-reports.schema.js";
import { feedReportSchema } from "../validations/feed-report.validation.js";
import { fileSchema } from "../validations/file.validation.js";
import {
  activityLogs,
  activityEnum,
} from "../database/schema/log-activiity.schema.js";

export const getFeedReports = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(feedReports)
    .where(eq(feedReports.poolId, id), isNull(feedReports.deletedAt));

  return successResponse(reply, "data fetched", data, 200);
};

export const getFeedReportsByUser = async (request, reply) => {
  const db = request.server?.db;
  const userId = request.user.id;
  const { id } = request.params;

  const data = await db
    .select()
    .from(feedReports)
    .where(
      and(
        eq(feedReports.userId, userId),
        eq(feedReports.poolId, id),
        isNull(feedReports.deletedAt)
      )
    );

  return successResponse(reply, "data fetched", data, 200);
};

export const getFeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const data = await db
      .select()
      .from(feedReports)
      .where(and(eq(feedReports.id, id), isNull(feedReports.deletedAt)));

    if (data.length === 0 || error.cause.code === "22P02")
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data fetched", data, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};

export const createFeedReport = async (request, reply) => {
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

  const validation = feedReportSchema.safeParse({
    reportDate: body.reportDate.value,
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
    const { filePath } = await generateUploadPath(
      body.imageUrl.filename,
      "feed-reports",
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
      poolId: body.poolId?.value || "5de94eb5-39ff-49a5-8000-f2f4f7a6618f",
      userId: request.user.id,
      reportDate: validation.data.reportDate,
      imageUrl: filePath,
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(feedReports).values(payload).returning();

    const [{ poolName }] = await db
      .select({ poolName: pools.name })
      .from(pools)
      .where(eq(pools.id, payload.poolId));

    const activity = {
      id: randomUUID(),
      reportId: payload.id,
      userId: payload.userId,
      poolName,
      activity: activityEnum.enumValues[0],
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

export const updateFeedReport = async (request, reply) => {
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

  const validation = feedReportSchema.safeParse({
    reportDate: body.reportDate.value,
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
      "feed-reports",
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

    const userId = request.user?.id || "cb1d213a-245b-4a2a-9e31-575d74e6fd9e";

    if (!userId) {
      return errorResponse(reply, "User ID is required", null, 400);
    }
    const payload = {
      reportDate: validation.data.reportDate,
      imageUrl: filePath,
      updatedAt: now,
    };

    const data = await db
      .update(feedReports)
      .set(payload)
      .where(eq(feedReports.id, id))
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

export const deleteFeedReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    await db
      .update(feedReports)
      .set({ deletedAt: now })
      .where(eq(feedReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};
