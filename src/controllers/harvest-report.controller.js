import fs from "fs";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { generateUploadPath } from "../utils/helper.js";
import { errorResponse, successResponse } from "../utils/response.js";
import {
  harvestReportSchema,
  fileSchema,
  updateFileSchema,
} from "../validations/index.js";
import {
  pools,
  harvestReports,
  activityEnum,
  activityLogs,
} from "../database/schema/index.js";

export const getHarvestReports = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  const data = await db
    .select()
    .from(harvestReports)
    .where(
      and(eq(harvestReports.poolId, id), isNull(harvestReports.deletedAt))
    );

  return successResponse(reply, "data fetched", data, 200);
};

export const getHarvestReportsByUser = async (request, reply) => {
  const db = request.server?.db;
  const userId = request.user.id;
  const { id } = request.params;

  const data = await db
    .select()
    .from(harvestReports)
    .where(
      and(
        eq(harvestReports.userId, userId),
        eq(harvestReports.poolId, id),
        isNull(harvestReports.deletedAt)
      )
    );

  return successResponse(reply, "data fetched", data, 200);
};

export const getHarvestReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const data = await db
      .select()
      .from(harvestReports)
      .where(and(eq(harvestReports.id, id), isNull(harvestReports.deletedAt)));

    if (data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data fetched", data, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};

export const createHarvestReport = async (request, reply) => {
  const db = request.server?.db;
  const body = request.body;

  const fileValidation = fileSchema.safeParse({
    fieldname: body.imageUrl.fieldname,
    mimetype: body.imageUrl.mimetype,
    filename: body.imageUrl.filename,
  });

  const validation = harvestReportSchema.safeParse({
    reportDate: body.reportDate.value ?? body.reportDate,
    quantity: Number(body.quantity.value),
    poolId: body.poolId.value ?? body.poolId,
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
    const { filePath, urlPath } = await generateUploadPath(
      body.imageUrl.filename,
      "harvest-reports",
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
      imageUrl: urlPath,
      createdAt: now,
      updatedAt: now,
    };

    const data = await db.insert(harvestReports).values(payload).returning();

    const [{ poolName }] = await db
      .select({ poolName: pools.name })
      .from(pools)
      .where(eq(pools.id, payload.poolId));

    const activity = {
      id: randomUUID(),
      reportId: payload.id,
      user: request.user.name,
      poolName: poolName,
      activity: activityEnum.enumValues[1],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(activityLogs).values(activity);

    return successResponse(reply, "data created", data, 201);
  } catch (error) {
    error.cause.code === "22P02" || "23503"
      ? errorResponse(reply, `Pool Id not found`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};

export const updateHarvestReport = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;
  const body = request.body;

  const fileValidation = updateFileSchema.safeParse({
    fieldname: body.imageUrl?.fieldname,
    mimetype: body.imageUrl?.mimetype,
    filename: body.imageUrl?.filename,
  });

  const validation = harvestReportSchema.safeParse({
    reportDate: body.reportDate.value,
    quantity: Number(body.quantity.value),
    poolId: body.poolId.value,
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
    let urlPath;

    if (fileValidation.data.filename) {
      const { filePath, urlPath: uploadedUrlPath } = await generateUploadPath(
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
      urlPath = uploadedUrlPath;
    }

    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    const userId = request.user?.id;

    if (!userId) {
      return errorResponse(reply, "User ID is required", null, 400);
    }

    const payloadWithFile = {
      reportDate: validation.data.reportDate,
      imageUrl: urlPath,
      updatedAt: now,
    };

    const payloadWithoutFile = {
      reportDate: validation.data.reportDate,
      updatedAt: now,
    };

    const payload = fileValidation ? payloadWithFile : payloadWithoutFile;

    const data = await db
      .update(harvestReports)
      .set(payload)
      .where(eq(harvestReports.id, id))
      .returning();

    if (!data || data.length === 0)
      return errorResponse(reply, `data with id ${id} not found`, null, 404);

    const [{ poolName }] = await db
      .select({ poolName: pools.name })
      .from(pools)
      .where(eq(pools.id, body.poolId.value));

    const activity = {
      id: randomUUID(),
      reportId: id,
      user: request.user.name,
      poolName,
      activity: activityEnum.enumValues[5],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(activityLogs).values(activity);

    return successResponse(reply, "data updated", data, 200);
  } catch (error) {
    console.log(error);
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, error, null, 500);
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

    await db
      .update(harvestReports)
      .set({ deletedAt: now })
      .where(eq(harvestReports.id, id))
      .returning();

    return successResponse(reply, "data deleted", null, 200);
  } catch (error) {
    error.cause.code === "22P02"
      ? errorResponse(reply, `invalid uuid format ${id}`, null, 403)
      : errorResponse(reply, "internal server error", null, 500);
  }
};
