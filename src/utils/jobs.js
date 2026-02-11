import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { getAllMqttPoolData } from "../services/mqtt.service.js";
import { writeNodeLog } from "./helper.js";
import { createAndSendNotification } from "../services/notification.service.js";

const oldData = new Map();
const lastNotifState = new Map();

// Status pH
const getPhStatus = (ph) => {
    if (ph >= 7.0 && ph < 7.5) return "normal";
    if ((ph >= 6.9 && ph < 7.0) || (ph >= 7.5 && ph < 8.0)) return "warning";
    return "danger";
};

// Status Suhu
const getTempStatus = (temp) => {
    if (temp >= 25.0 && temp <= 32.0) return "normal";
    if ((temp >= 22.0 && temp < 25.0) || (temp > 32.0 && temp <= 34.0)) return "warning";
    return "danger";
};

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

const notif = new AsyncTask("iot-notif-task", async () => {
    const datas = getAllMqttPoolData();
    console.log(`Notification Job running: ${datas.length} pools received.`);

    datas.forEach(async (item) => {
        const nodeId = String(item.node_id);
        const ph = Number(parseFloat(item.ph).toFixed(1));
        const temp = Number(parseFloat(item.temp).toFixed(1));

        const phStatus = getPhStatus(ph);
        const tempStatus = getTempStatus(temp);

        const prevState = lastNotifState.get(nodeId) || { ph: "normal", temp: "normal" };

        // Handle pH Notification
        if (phStatus !== "normal" && phStatus !== prevState.ph) {
            const title = phStatus === "warning" ? "⚠️ Peringatan pH" : "🚨 Bahaya pH";
            const message = `Kolam ${nodeId}: pH saat ini ${ph}. Status: ${phStatus === "warning" ? "Peringatan" : "Perlu Dicek"}.`;
            await createAndSendNotification(nodeId, "ph_alert", title, message);
        }

        // Handle Temp Notification
        if (tempStatus !== "normal" && tempStatus !== prevState.temp) {
            const title = tempStatus === "warning" ? "⚠️ Peringatan Suhu" : "🚨 Bahaya Suhu";
            const message = `Kolam ${nodeId}: Suhu saat ini ${temp}°C. Status: ${tempStatus === "warning" ? "Peringatan" : "Perlu Dicek"}.`;
            await createAndSendNotification(nodeId, "temp_alert", title, message);
        }

        lastNotifState.set(nodeId, { ph: phStatus, temp: tempStatus });
    });
});

export const job = new SimpleIntervalJob({ seconds: 60 }, task);
export const notifJob = new SimpleIntervalJob({ seconds: 60 }, notif);
