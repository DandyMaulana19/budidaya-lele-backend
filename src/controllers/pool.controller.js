import { eq } from "drizzle-orm";
import { successResponse } from "../utils/response.js";
import { poolAccesses, pools } from "../database/schema/index.js";

export const getPools = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.user;

  const data = await db
    .select({ poolId: pools.id, poolName: pools.name })
    .from(poolAccesses)
    .leftJoin(pools, eq(pools.id, poolAccesses.poolId))
    .where(eq(poolAccesses.userId, id));

  if (!data) {
    return successResponse(reply, "internal server error", data, 500);
  }

  return successResponse(reply, "data fetched", data, 200);
};
