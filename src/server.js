import fastify from "fastify";
import "dotenv/config";
import fastifyJwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import dbPlugin from "./database/config.js";
import seedReportRoutes from "./routes/seed-report.route.js";
import authRoutes from "./routes/auth.route.js";
import feedReportRoutes from "./routes/feed-report.route.js";
import userRoutes from "./routes/user.route.js";
import moratlityReportRoutes from "./routes/mortality-report.route.js";
import harvestReportRoutes from "./routes/harvest-report.route.js";
import appRoutes from "./routes/app.route.js";
import { errorResponse } from "./utils/response.js";
import poolRoutes from "./routes/pool.route.js";

const app = fastify({ logger: true });

app.register(dbPlugin);

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return errorResponse(reply, "token required", null, 401);
  }
});

app.register(formbody);
app.register(multipart, { attachFieldsToBody: true });
app.register(authRoutes, { prefix: "/api" });
app.register(appRoutes, { prefix: "/api" });
// app.register(userRoutes, { prefix: "/api" });
app.register(seedReportRoutes, { prefix: "/api" });
app.register(feedReportRoutes, { prefix: "/api" });
app.register(moratlityReportRoutes, { prefix: "/api" });
app.register(harvestReportRoutes, { prefix: "/api" });
app.register(poolRoutes, { prefix: "/api" });

const start = async () => {
  try {
    const address = await app.listen({ port: 3000 });
    app.log.info(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
