import fastify from "fastify";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fastifyJwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import dbPlugin from "./src/database/config.js";
import seedReportRoutes from "./src/routes/seed-report.route.js";
import authRoutes from "./src/routes/auth.route.js";
import feedReportRoutes from "./src/routes/feed-report.route.js";
import userRoutes from "./src/routes/user.route.js";
import moratlityReportRoutes from "./src/routes/mortality-report.route.js";
import harvestReportRoutes from "./src/routes/harvest-report.route.js";
import appRoutes from "./src/routes/app.route.js";
import poolRoutes from "./src/routes/pool.route.js";
import mqttRoutes from "./src/routes/mqtt.route.js";
import deviceRoutes from "./src/routes/device.route.js";
import notificationRoutes from "./src/routes/notification.route.js";
import { errorResponse } from "./src/utils/response.js";
import * as mqttService from "./src/services/mqtt.service.js";
import * as feederService from "./src/services/feeder.service.js";
import socketPlugin from "./src/plugins/socket.js";
import fastifySchedule from "@fastify/schedule";
import { job, notifJob } from "./src/utils/jobs.js";

const app = fastify({ logger: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.register(dbPlugin);
app.register(socketPlugin);
app.register(fastifySchedule);

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

mqttService.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

feederService.connect(process.env.FEEDER_URL, {
  username: process.env.FEEDER_USERNAME,
  password: process.env.FEEDER_PASSWORD,
});

app.decorate("mqttService", mqttService);
app.decorate("feederService", feederService);

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
  root: path.join(__dirname, "src", "uploads"),
  prefix: "/src/uploads/",
});

// Graceful shutdown
// process.on("SIGINT", async () => {
//   app.log.info("SIGINT received, shutting down gracefully");
//   mqttService.disconnect();
//   await app.close();
//   process.exit(0);
// });

// process.on("SIGTERM", async () => {
//   app.log.info("SIGTERM received, shutting down gracefully");
//   mqttService.disconnect();
//   await app.close();
//   process.exit(0);
// });

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
app.register(notificationRoutes, { prefix: "/api" });

app.ready().then(() => {
  // app.scheduler.addSimpleIntervalJob(feederJob);
  app.scheduler.addSimpleIntervalJob(job);
  app.scheduler.addSimpleIntervalJob(notifJob);
});

const start = async () => {
  try {
    const address = await app.listen({
      port: 3000,
      //   host: process.env.HOST,
    });
    app.log.info(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
