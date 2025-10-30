import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema",
  dbCredentials: {
    url: process.env.URL_POSTGRES,
  },
  migrations: {
    table: "journal",
    schema: "drizzle",
  },
});
