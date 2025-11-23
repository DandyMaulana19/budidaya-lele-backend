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
import { errorResponse } from "./helper/response.js";

const app = fastify({ logger: true });

app.register(dbPlugin);

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

app.decorate("revokedTokens", new Set());

app.decorate("authenticate", async (request, reply) => {
  const auth = request.headers.authorization || request.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer")) {
    return errorResponse(reply, "Token required", 401);
  }

  const token = auth.split(" ")[1];

  if (request.server.revokedTokens.has(token)) {
    return errorResponse(reply, "Token required", 401);
  }

  try {
    await request.jwtVerify();
  } catch (error) {
    reply.send(error);
  }
});

app.register(formbody);
app.register(multipart, { attachFieldsToBody: true });
app.register(authRoutes, { prefix: "/api" });
// app.register(userRoutes, { prefix: "/api" });
app.register(seedReportRoutes, { prefix: "/api" });
app.register(feedReportRoutes, { prefix: "/api" });
app.register(moratlityReportRoutes, { prefix: "/api" });
app.register(harvestReportRoutes, { prefix: "/api" });

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
