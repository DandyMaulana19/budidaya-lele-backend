import {
  getSeedReports,
  getSeedReport,
  createSeedReport,
  updateSeedReport,
  deleteSeedReport,
} from "../controllers/seed-report.controller.js";

export default function seedReportRoutes(app) {
  app.get(
    "/seed-reports",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return getSeedReports(request, reply);
    }
  );

  app.get(
    "/seed-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return getSeedReport(request, reply);
    }
  );

  app.post(
    "/seed-report",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return createSeedReport(request, reply);
    }
  );

  app.put(
    "/seed-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return updateSeedReport(request, reply);
    }
  );

  app.delete(
    "/seed-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return deleteSeedReport(request, reply);
    }
  );
}
