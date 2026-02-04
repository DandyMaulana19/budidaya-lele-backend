import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { getAllMqttPoolData } from "../services/mqtt.service.js";
import { writeNodeLog } from "./helper.js";

const oldData = new Map();

const task = new AsyncTask("iot-data-task", async () => {
  const datas = getAllMqttPoolData();

  datas.forEach((item) => {
    const nodeId = String(item.node_id);

    const ph = Number(parseFloat(item.ph).toFixed(1));
    const temp = Number(parseFloat(item.temp).toFixed(1));

    const prev = oldData.get(nodeId);

    if (!prev) {
      oldData.set(nodeId, { ph, temp });
      return;
    }

    const phDiff = Number((ph - prev.ph).toFixed(1));
    const tempDiff = Number((temp - prev.temp).toFixed(1));

    if (phDiff !== 0 || tempDiff !== 0) {
      writeNodeLog({
        node_id: nodeId,
        ph,
        temp,
        createdAt: new Date(item.timestamp * 1000),
      });

      oldData.set(nodeId, { ph, temp });
    }
  });
});

export const job = new SimpleIntervalJob({ seconds: 60 }, task);
