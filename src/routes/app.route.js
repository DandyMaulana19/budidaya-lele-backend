import {
  getActivityLogs,
  getTotalReports,
  getTotalReportsbyPool,
} from "../controllers/app.controller.js";

export default function appRoutes(app) {
  app.get(
    "/activity-log",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getActivityLogs(request, reply);
    }
  );

  app.get(
    "/total-reports",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getTotalReports(request, reply);
    }
  );

  app.get(
    "/total-reports/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getTotalReportsbyPool(request, reply);
    }
  );
}
