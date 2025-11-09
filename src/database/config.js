/** @type {import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema>} */
import fp from "fastify-plugin";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";

// Postgres client plugin
export default fp(async (fastify, opts) => {
  try {
    const client = postgres(process.env.URL_POSTGRES);
    const db = drizzle(client, { schema });
    fastify.decorate("db", db);
  } catch (error) {
    fastify.log.error("Failed to connect to database:", error);
    throw new Error("Database connection error");
  }
});
