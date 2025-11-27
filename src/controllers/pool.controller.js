import { and, eq, isNull } from "drizzle-orm";
import { successResponse, errorResponse } from "../utils/response.js";
import { pools } from "../database/schema/pools.schema.js";

export const getPools = async (request, reply) => {
  const db = request.server?.db;

  const data = await db.select().from(pools);

  if (!data) {
    return successResponse(reply, "internal server error", data, 500);
  }
  console.log(data);

  return successResponse(reply, "data fetched", data, 200);
};

export const getPool = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.params;

  try {
    const data = await db
      .select()
      .from(pools)
      .where(and(eq(pools.id, id)));

    if (data.length === 0) return errorResponse(reply, `data with id ${id} not found`, null, 404);

    return successResponse(reply, "data fetched", data, 200);
  } catch (error) {
    error.cause.code === "22P02" ? errorResponse(reply, `invalid uuid format ${id}`, null, 403) : errorResponse(reply, "internal server error", null, 500);
  }
};
