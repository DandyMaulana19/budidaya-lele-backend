import { successResponse } from "../utils/response.js";
import {
  activityLogs,
  feedReports,
  harvestReports,
  mortalityReports,
  seedReports,
} from "../database/schema/index.js";
import { count, desc, eq } from "drizzle-orm";

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
    .from(feedReports);
  const totalHarvestReports = await db
    .select({ count: count() })
    .from(harvestReports);
  const totalMortalityReports = await db
    .select({ count: count() })
    .from(mortalityReports);
  const totalSeedReports = await db
    .select({ count: count() })
    .from(seedReports);

  return successResponse(
    reply,
    "data fetched",
    {
      totalFeedReports: totalFeedReports[0]["count"],
      totalHarvestReports: totalHarvestReports[0]["count"],
      totalMortalityReports: totalMortalityReports[0]["count"],
      totalSeedReports: totalSeedReports[0]["count"],
    },
    200
  );
};

export const getTotalReportsbyPool = async (request, reply) => {
  const db = request.server?.db;
  const poolId = request.params.id;

  const totalFeedReports = await db
    .select({ count: count() })
    .from(feedReports)
    .where(eq(feedReports.poolId, poolId));
  const totalHarvestReports = await db
    .select({ count: count() })
    .from(harvestReports)
    .where(eq(harvestReports.poolId, poolId));
  const totalMortalityReports = await db
    .select({ count: count() })
    .from(mortalityReports)
    .where(eq(mortalityReports.poolId, poolId));
  const totalSeedReports = await db
    .select({ count: count() })
    .from(seedReports)
    .where(eq(seedReports.poolId, poolId));

  return successResponse(
    reply,
    "data fetched",
    {
      totalFeedReports: totalFeedReports[0]["count"],
      totalHarvestReports: totalHarvestReports[0]["count"],
      totalMortalityReports: totalMortalityReports[0]["count"],
      totalSeedReports: totalSeedReports[0]["count"],
    },
    200
  );
};
