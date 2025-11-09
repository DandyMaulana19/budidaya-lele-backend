import fastify from "fastify";
import dbPlugin from "./database/config.js";
import SeedReportRoutes from "./routes/seed-report.route.js";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";

const app = fastify({ logger: true });

app.register(dbPlugin);
app.register(SeedReportRoutes);
app.register(authRoutes);

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
