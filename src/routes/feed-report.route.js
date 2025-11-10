import { createFeedReport } from "../controllers/feed-report.controller.js";

export default function feedReportRoutes(app) {
  app.post("/api/feed-report", async (request, reply) => {
    return createFeedReport(request, reply);
  });
}
