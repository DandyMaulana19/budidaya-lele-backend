import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { getAllMqttPoolData } from "../services/mqtt.service.js";

const task = new AsyncTask("iot-data-task", async () => {
  const datas = getAllMqttPoolData();
  const data = datas.map((item) => item);
  console.log("data", data);

  const tempTemperature = new Map();
  const tempPh = new Map();
  if (tempTemperature.size === 0 || tempPh.size === 0) {
    const phData = datas.map((item) => item.ph);
    const tempData = datas.map((item) => item.temp);
    tempTemperature.set("oldTemperature", tempData);
    tempPh.set("oldPh", phData);
  }

  const oldPh = tempPh.get("oldPh").map((value) => parseInt(value));
  const oldTemperature = tempTemperature
    .get("oldTemperature")
    .map((value) => parseInt(value));

  console.log("Old pH:", oldPh);
  console.log("Old Temperature:", oldTemperature);

  const newTemperature = datas.map((item) => parseInt(item.temp));
  const newPh = datas.map((item) => parseInt(item.ph));

  console.log("New pH:", newPh);
  console.log("New Temperature:", newTemperature);

  const phChanges = newPh.map((value, index) => ({
    index,
    old: oldPh[index],
    new: value,
    diff: value - oldPh[index],
  }));

  const tempChanges = newTemperature.map((value, index) => ({
    index,
    old: oldTemperature[index],
    new: value,
    diff: value - oldTemperature[index],
  }));

  const hasPhChanges = phChanges.some((change) => change.diff !== 0);
  const hasTempChanges = tempChanges.some((change) => change.diff !== 0);

  hasPhChanges ?? tempPh.set("oldPh", newPh);

  hasTempChanges ?? tempTemperature.set("oldTemperature", newTemperature);
});

export const job = new SimpleIntervalJob({ seconds: 10 }, task);
