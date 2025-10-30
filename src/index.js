const fastify = require("fastify")({ logger: true });
const routes = require("./routes");

require("dotenv").config();

fastify.register(require("@fastify/postgres"), {
  connectionString: process.env.URL_POSTGRES,
});

routes.forEach((route, index) => {
  fastify.route(route);
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
