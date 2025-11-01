/** @type {import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema>} */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";

// Postgres client plugin
export default fp(async (fastify, opts) => {
  const client = postgres(process.env.URL_POSTGRES);
  const db = drizzle(client, { schema });
  fastify.decorate("db", db);
});

// Postgres client
const client = postgres(process.env.URL_POSTGRES);
export const db = drizzle(client, { schema });
