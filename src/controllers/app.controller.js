import { successResponse } from "../utils/response.js";
import {
  activityLogs,
  feedReports,
  harvestReports,
  mortalityReports,
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
