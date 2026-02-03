import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { getAllMqttPoolData } from "../services/mqtt.service.js";
import { writeNodeLog } from "./helper.js";

let oldPh = new Map();
let oldTemperature = new Map();

const task = new AsyncTask("iot-data-task", async () => {
  const datas = getAllMqttPoolData();
  // const data = datas.map((item) => item);
  // console.log("data", data);

  const newTemperature = datas.map((item) => parseFloat(item.temp).toFixed(1));
  const newPh = datas.map((item) => parseFloat(item.ph).toFixed(1));

  if (!oldPh || !oldTemperature) {
    oldPh = newPh;
    oldTemperature = newTemperature;
    console.log("Initial data saved");
    return;
  }

  datas.forEach((item, index) => {
    const ph = newPh[index];
    const temp = newTemperature[index];

    const phDiff = +(ph - oldPh[index]).toFixed(1);
    const tempDiff = +(temp - oldTemperature[index]).toFixed(1);

    if (phDiff !== 0 || tempDiff !== 0) {
      writeNodeLog({
        node_id: item.node_id,
        ph,
        temp,
        createdAt: new Date(),
      });
    }
  });

  oldPh = newPh;
  oldTemperature = newTemperature;

  const phChanges = newPh.map((value, index) => ({
    index,
    old: oldPh[index],
    new: value,
    diff: +(value - oldPh[index]).toFixed(1),
  }));

  const tempChanges = newTemperature.map((value, index) => ({
    index,
    old: oldTemperature[index],
    new: value,
    diff: +(value - oldTemperature[index]).toFixed(1),
  }));

  const hasPhChanges = phChanges.some((c) => c.diff !== 0);
  const hasTempChanges = tempChanges.some((c) => c.diff !== 0);

  if (hasPhChanges) oldPh = newPh;
  if (hasTempChanges) oldTemperature = newTemperature;
});

export const job = new SimpleIntervalJob({ seconds: 10 }, task);
