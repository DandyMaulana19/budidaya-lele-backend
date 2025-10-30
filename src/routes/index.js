const routes = [
  {
    method: "GET",
    url: "/hello",
    handler: async (request, reply) => {
      reply.send({ hello: "world" });
    },
  },
];

routes.prefix = "/api";

module.exports = routes;
