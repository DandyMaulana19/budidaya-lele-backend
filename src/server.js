import fastify from "fastify";
import "dotenv/config";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
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

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
  hook: "preHandler",
});

app.addHook("preHandler", async (request, reply) => {
  request.server.jwt = app.jwt;
  return;
});

app.decorate("revokedTokens", new Set());

app.decorate("authenticate", async (request, reply) => {
  const headerAuth =
    request.headers.authorization || request.headers.Authorization;
  let token = undefined;

  if (request.cookies && request.cookies.token) {
    token = request.cookies.token;
  } else if (headerAuth && headerAuth.startsWith("Bearer ")) {
    token = headerAuth.split(" ")[1];
  }

  if (!token) {
    return errorResponse(reply, "Token required", 401);
  }

  if (request.server.revokedTokens.has(token)) {
    return errorResponse(reply, "Token revoked", 401);
  }

  try {
    const decoded = await request.server.jwt.verify(token);
    request.user = decoded;
  } catch (error) {
    return errorResponse(reply, "Invalid token", 401);
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
