import * as mqttController from "../controllers/mqtt.controller.js";

async function mqttRoutes(app) {
  app.get(
    "/iot/pool/:nodeId",
    { onRequest: [app.authenticate] },
    mqttController.getPoolData,
  );

  app.get(
    "/iot/pool/data",
    { onRequest: [app.authenticate] },
    mqttController.getAllPoolData,
  );

  app.post(
    "/iot/temp",
    { onRequest: [app.authenticate] },
    mqttController.sendTemperatureLimit,
  );

  app.post(
    "/iot/ph",
    { onRequest: [app.authenticate] },
    mqttController.sendPhLimit,
  );
}

export default mqttRoutes;
