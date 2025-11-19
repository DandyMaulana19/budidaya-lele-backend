import fastify from "fastify";
import "dotenv/config";
import fastifyJwt from "@fastify/jwt";
import dbPlugin from "./database/config.js";
import seedReportRoutes from "./routes/seed-report.route.js";
// import authRoutes from "./routes/auth.route.js";
import feedReportRoutes from "./routes/feed-report.route.js";
import userRoutes from "./routes/user.route.js";
import moratlityReportRoutes from "./routes/mortality-report.route.js";
import harvestReportRoutes from "./routes/harvest-report.route.js";

const app = fastify({ logger: true });

// app.register(fastifyJwt, {
//   secret: process.env.JWT_SECRET,
// });
// app.addHook("onRequest", async (request, reply) => {
//   try {
//     await request.jwtVerify();
//   } catch (error) {
//     reply.send(error);
//   }
// });

app.register(dbPlugin);
app.register(userRoutes, { prefix: "/api" });
app.register(seedReportRoutes, { prefix: "/api" });
// app.register(authRoutes, {prefix: "/api"});
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
