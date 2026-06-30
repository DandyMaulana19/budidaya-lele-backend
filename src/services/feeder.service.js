import mqtt from "mqtt";

let client = null;
let isConnected = false;

const feederData = {
  status: null,
  time: null,
  hopper: null,
};

export const connect = (brokerUrl, options = {}) => {
  client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    isConnected = true;
    console.log("Connected to MQTT feeder broker");

    subscribeToAllFeeders();
  });

  client.on("error", (error) => {
    console.error("MQTT Error:", error);
  });

  client.on("close", () => {
    isConnected = false;
    console.log("Disconnected from MQTT broker");
  });

  client.on("message", handleIncomingMessage);
};

export const disconnect = () => {
  if (client) {
    client.end();
  }

  feederData.status = null;
  feederData.time = null;
  feederData.hopper = null;
};

const subscribeToAllFeeders = () => {
  if (!isConnected) return;

  client.subscribe("fishfeeder/#", { qos: 1 }, (err) => {
    if (err) {
      console.error("Subscribe error:", err);
    } else {
      console.log("Subscribed to fishfeeder/#");
    }
  });
};

const handleIncomingMessage = (topic, payload) => {
  try {
    handleFeederData(topic, payload);
  } catch (err) {
    console.error("Handle MQTT Message Error:", err);
  }
};

const handleFeederData = (topic, payload) => {
  const message = payload.toString();

  switch (topic) {
    case "fishfeeder/status":
      try {
        feederData.status = JSON.parse(message);
      } catch {
        feederData.status = message;
      }
      break;

    case "fishfeeder/time":
      feederData.time = message;
      break;

    case "fishfeeder/hopper":
      feederData.hopper = Number(message);
      break;

    default:
      return;
  }

  console.log(feederData);
};

export const subscribe = (topic, callback) => {
  if (!isConnected) return;

  client.subscribe(topic, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Subscribed ${topic}`);
  });

  client.on("message", (receivedTopic, message) => {
    if (receivedTopic === topic) {
      callback(message.toString());
    }
  });
};

export const getFeederData = () => {
  return feederData;
};

export const getFeederStatusData = () => {
  return feederData.status;
};

export const getFeederTimeData = () => {
  return feederData.time;
};

export const getFeederHopperData = () => {
  return feederData.hopper;
};
