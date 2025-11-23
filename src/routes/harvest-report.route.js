import { getHarvestReports, getHarvestReport, createHarvestReport, updateHarvestReport, deleteHarvestReport } from "../controllers/harvest-report.controller.js";

export default function harvestReportRoutes(app) {
  app.get(
    "/harvest-reports",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return getHarvestReports(request, reply);
    }
  );

  app.get(
    "/harvest-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return getHarvestReport(request, reply);
    }
  );

  app.post(
    "/harvest-report",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return createHarvestReport(request, reply);
    }
  );

  app.put(
    "/harvest-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return updateHarvestReport(request, reply);
    }
  );

  app.delete(
    "/harvest-report/:id",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return deleteHarvestReport(request, reply);
    }
  );
}
