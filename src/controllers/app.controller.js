import { successResponse } from "../utils/response.js";
import { activityLogs } from "../database/schema/log-activity.schema.js";

export const getActivityLogs = async (request, reply) => {
  const db = request.server?.db;

  const data = await db.select().from(activityLogs).limit(3);

  return successResponse(reply, "data fetched", data, 200);
};
