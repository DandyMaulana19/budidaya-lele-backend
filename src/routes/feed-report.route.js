import {
  createFeedReport,
  deleteFeedReport,
  getFeedReport,
  getFeedReports,
  updateFeedReport,
} from "../controllers/feed-report.controller.js";

export default function feedReportRoutes(app) {
  app.get("/feed-reports", async (request, reply) => {
    return getFeedReports(request, reply);
  });

  app.get("/feed-report/:id", async (request, reply) => {
    return getFeedReport(request, reply);
  });

  app.post("/feed-report", async (request, reply) => {
    return createFeedReport(request, reply);
  });

  app.put("/feed-report/:id", async (request, reply) => {
    return updateFeedReport(request, reply);
  });

  app.delete("/feed-report/:id", async (request, reply) => {
    return deleteFeedReport(request, reply);
  });
}
