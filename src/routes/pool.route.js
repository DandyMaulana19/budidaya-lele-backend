import { getPools } from "../controllers/pool.controller.js";

export default function poolRoutes(app) {
  app.get(
    "/pools",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getPools(request, reply);
    }
  );
}
