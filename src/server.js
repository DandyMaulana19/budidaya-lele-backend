import fastify from "fastify";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fastifyJwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import dbPlugin from "./database/config.js";
import seedReportRoutes from "./routes/seed-report.route.js";
import authRoutes from "./routes/auth.route.js";
import feedReportRoutes from "./routes/feed-report.route.js";
import userRoutes from "./routes/user.route.js";
import moratlityReportRoutes from "./routes/mortality-report.route.js";
import harvestReportRoutes from "./routes/harvest-report.route.js";
import appRoutes from "./routes/app.route.js";
import poolRoutes from "./routes/pool.route.js";
import mqttRoutes from "./routes/mqtt.route.js";
import deviceRoutes from "./routes/device.route.js";
import { errorResponse } from "./utils/response.js";
import * as mqttService from "./services/mqtt.service.js";
import socketPlugin from "./plugins/socket.js";
import mqtt from "mqtt";

const app = fastify({ logger: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.register(dbPlugin);
app.register(socketPlugin);

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

mqttService.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttService.setIO(app.io);

app.decorate("mqttService", mqttService);

app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return errorResponse(reply, "token required", null, 401);
  }
});

app.register(formbody);
app.register(multipart, {
  attachFieldsToBody: true,
  limits: { fileSize: 10000000 },
});
app.register(fastifyStatic, {
  root: path.join(__dirname, "uploads"),
  prefix: "/src/uploads/",
});

// Graceful shutdown
process.on("SIGINT", async () => {
  app.log.info("SIGINT received, shutting down gracefully");
  mqttService.disconnect();
  await app.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  app.log.info("SIGTERM received, shutting down gracefully");
  mqttService.disconnect();
  await app.close();
  process.exit(0);
});

app.register(authRoutes, { prefix: "/api" });
app.register(appRoutes, { prefix: "/api" });
app.register(userRoutes, { prefix: "/api" });
app.register(seedReportRoutes, { prefix: "/api" });
app.register(feedReportRoutes, { prefix: "/api" });
app.register(moratlityReportRoutes, { prefix: "/api" });
app.register(harvestReportRoutes, { prefix: "/api" });
app.register(poolRoutes, { prefix: "/api" });
app.register(mqttRoutes, { prefix: "/api" });
app.register(deviceRoutes, { prefix: "/api" });

const start = async () => {
  try {
    const address = await app.listen({
      port: 3000,
      // host: process.env.HOST,
    });
    app.log.info(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
