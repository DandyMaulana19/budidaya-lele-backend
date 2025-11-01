import { forEach } from "./routes";
import dbPlugin from "./plugins/db.js";
import "dotenv/config";

const fastify = require("fastify")({ logger: true });

fastify.register(dbPlugin);

forEach((route) => {
  fastify.route(route);
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
