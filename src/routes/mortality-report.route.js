import {
  getMortalityReports,
  getMortalityReport,
  createMortalityReport,
  updateMortalityReport,
  deleteMortalityReport,
} from "../controllers/mortality-report.controller.js";

export default function moratlityReportRoutes(app) {
  app.get(
    "/mortality-reports",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return getMortalityReports(request, reply);
    }
  );

  app.get(
    "/mortality-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return getMortalityReport(request, reply);
    }
  );

  app.post(
    "/mortality-report",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return createMortalityReport(request, reply);
    }
  );

  app.put(
    "/mortality-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return updateMortalityReport(request, reply);
    }
  );

  app.delete(
    "/mortality-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return deleteMortalityReport(request, reply);
    }
  );
}
