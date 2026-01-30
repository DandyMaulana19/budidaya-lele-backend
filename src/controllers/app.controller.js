import { errorResponse, successResponse } from "../utils/response.js";
import {
  activityLogs,
  feedReports,
  harvestReports,
  mortalityReports,
  poolDatas,
  seedReports,
} from "../database/schema/index.js";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export const getActivityLogs = async (request, reply) => {
  const db = request.server?.db;

  const data = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(3);

  return successResponse(reply, "data fetched", data, 200);
};

export const getTotalReports = async (request, reply) => {
  const db = request.server?.db;

  const totalFeedReports = await db
    .select({ count: count() })
    .from(feedReports)
    .where(isNull(feedReports.deletedAt));
  const totalHarvestReports = await db
    .select({ count: count() })
    .from(harvestReports)
    .where(isNull(harvestReports.deletedAt));
  const totalMortalityReports = await db
    .select({ count: count() })
    .from(mortalityReports)
    .where(isNull(mortalityReports.deletedAt));
  const totalSeedReports = await db
    .select({ count: count() })
    .from(seedReports)
    .where(isNull(seedReports.deletedAt));

  return successResponse(
    reply,
    "data fetched",
    {
      totalFeedReports: totalFeedReports[0]["count"],
      totalHarvestReports: totalHarvestReports[0]["count"],
      totalMortalityReports: totalMortalityReports[0]["count"],
      totalSeedReports: totalSeedReports[0]["count"],
    },
    200,
  );
};

export const getTotalReportsbyPool = async (request, reply) => {
  const db = request.server?.db;
  const poolId = request.params.id;

  const totalFeedReports = await db
    .select({ count: count() })
    .from(feedReports)
    .where(and(eq(feedReports.poolId, poolId), isNull(feedReports.deletedAt)));
  const totalHarvestReports = await db
    .select({ count: count() })
    .from(harvestReports)
    .where(
      and(eq(harvestReports.poolId, poolId), isNull(harvestReports.deletedAt)),
    );
  const totalMortalityReports = await db
    .select({ count: count() })
    .from(mortalityReports)
    .where(
      and(
        eq(mortalityReports.poolId, poolId),
        isNull(mortalityReports.deletedAt),
      ),
    );
  const totalSeedReports = await db
    .select({ count: count() })
    .from(seedReports)
    .where(and(eq(seedReports.poolId, poolId), isNull(seedReports.deletedAt)));

  return successResponse(
    reply,
    "data fetched",
    {
      totalFeedReports: totalFeedReports[0]["count"],
      totalHarvestReports: totalHarvestReports[0]["count"],
      totalMortalityReports: totalMortalityReports[0]["count"],
      totalSeedReports: totalSeedReports[0]["count"],
    },
    200,
  );
};

export const getChartAllPool = async (request, reply) => {
  const db = request.server?.db;

  try {
    const data = await db.select().from(poolDatas);

    return successResponse(
      reply,
      "All pool data retrieved successfully",
      data,
      200,
    );
  } catch (error) {
    console.log(error);
    return errorResponse(reply, "Failed to retrieve pool data", error, 500);
  }
};

export const getChartPool = async (request, reply) => {
  const db = request.server?.db;
  const id = request.params?.id;

  try {
    const data = await db
      .select()
      .from(poolDatas)
      .where(eq(poolDatas.poolId, id));

    return successResponse(
      reply,
      `Pool ${id} data retrieved successfully`,
      data,
      200,
    );
  } catch (error) {
    console.log(error);
    return errorResponse(reply, "Failed to retrieve pool data", error, 500);
  }
};
