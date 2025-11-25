import { getActivityLogs } from "../controllers/app.controller.js";

export default function appRoutes(app) {
  app.get(
    "/activity-log",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getActivityLogs(request, reply);
    }
  );
}
