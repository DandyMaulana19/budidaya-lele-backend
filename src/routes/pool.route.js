import { getPool, getPools } from "../controllers/pool.controller.js";

export default function poolRoutes(app) {
  app.get("/pool", { preHandler: [app.authenticate] }, async (request, reply) => {
    return getPools(request, reply);
  });

  app.get("/pool/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    return getPool(request, reply);
  });
}
