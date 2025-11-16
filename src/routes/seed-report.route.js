import {
  getSeedReports,
  getSeedReport,
  createSeedReport,
  updateSeedReport,
  deleteSeedReport,
} from "../controllers/seed-report.controller.js";

export default function SeedReportRoutes(app) {
  app.get("/api/seed-report", async (request, reply) => {
    return getSeedReports(request, reply);
  });

  app.get("/api/seed-report/:id", async (request, reply) => {
    return getSeedReport(request, reply);
  });

  app.post("/api/seed-report", async (request, reply) => {
    return createSeedReport(request, reply);
  });

  app.put("/api/seed-report/:id", async (request, reply) => {
    return updateSeedReport(request, reply);
  });

  app.delete("/api/seed-report/:id", async (request, reply) => {
    return deleteSeedReport(request, reply);
  });
}
