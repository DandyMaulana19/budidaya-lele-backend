import {
  createFeedReport,
  deleteFeedReport,
  getFeedReport,
  getFeedReports,
  getFeedReportsByUser,
  updateFeedReport,
} from "../controllers/feed-report.controller.js";

export default function feedReportRoutes(app) {
  app.get(
    "/feed-reports",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getFeedReports(request, reply);
    }
  );

  app.get(
    "/feed-reports/user/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getFeedReportsByUser(request, reply);
    }
  );

  app.get(
    "/feed-report/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return getFeedReport(request, reply);
    }
  );

  app.post(
    "/feed-report",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return createFeedReport(request, reply);
    }
  );

  app.put(
    "/feed-report/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return updateFeedReport(request, reply);
    }
  );

  app.delete(
    "/feed-report/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return deleteFeedReport(request, reply);
    }
  );
}
