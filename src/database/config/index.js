import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../schema/index.js";
import "dotenv/config";

const client = postgres(process.env.URL_POSTGRES);
export const db = drizzle(client, { schema });
