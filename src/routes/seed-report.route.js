import { createSeedReport } from "../controllers/seed-report.controller.js";

export default function SeedReportRoutes(app) {
  app.post("/api/seed-report", async (request, reply) => {
    return createSeedReport(request, reply);
  });
}
