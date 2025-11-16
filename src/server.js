import fastify from "fastify";
import dbPlugin from "./database/config.js";
import SeedReportRoutes from "./routes/seed-report.route.js";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
import feedReportRoutes from "./routes/feed-report.route.js";
import fastifyJwt from "@fastify/jwt";

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
app.register(SeedReportRoutes);
app.register(authRoutes);
app.register(feedReportRoutes);

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
