import { successResponse } from "../utils/response.js";
import { activityLogs } from "../database/schema/index.js";
import { desc } from "drizzle-orm";

export const getActivityLogs = async (request, reply) => {
  const db = request.server?.db;

  const data = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(3);

  return successResponse(reply, "data fetched", data, 200);
};
