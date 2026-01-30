import mqtt from "mqtt";

let client = null;
let isConnected = false;
const poolData = new Map();

// Connection Management
export const connect = (brokerUrl, options = {}) => {
  client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    isConnected = true;
    console.log("Connected to MQTT broker");
    subscribeToAllPools();
  });

  client.on("error", (error) => {
    console.error("MQTT connection error:", error);
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
    poolData.clear();
  }
};

// Message Handlers
const handleIncomingMessage = (topic, payload) => {
  try {
    if (topic.startsWith("iot/kolam/")) {
      handlePoolData(topic, payload);
    }
  } catch (error) {
    console.error("Error handling MQTT message:", error);
  }
};

const handlePoolData = (topic, payload) => {
  const nodeId = topic.replace("iot/kolam/", "");
  const datas = JSON.parse(payload.toString());

  console.log(datas);

  const data = {
    ...datas,
    receivedAt: new Date().toISOString(),
  };

  poolData.set(nodeId, data);
  // console.log(`📩 Node ${nodeId}:`, data);
};

// Subscribe Operations
const subscribeToAllPools = () => {
  if (!isConnected) return;

  client.subscribe("iot/kolam/#", { qos: 1 }, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    }
  });
};

export const subscribe = (topic, callback) => {
  if (!isConnected) {
    console.error("MQTT client is not connected");
    return;
  }

  client.subscribe(topic, (error) => {
    if (error) {
      console.error("Error subscribing to topic:", error);
    }
  });

  client.on("message", (receivedTopic, message) => {
    if (receivedTopic === topic) {
      callback(message.toString());
    }
  });
};

// Publish Operations
export const publish = (topic, message, options = {}) => {
  if (!isConnected) {
    console.error("MQTT client is not connected");
    return;
  }

  const payload =
    typeof message === "string" ? message : JSON.stringify(message);

  client.publish(topic, payload, { qos: 1, ...options }, (error) => {
    if (error) {
      console.error("Error publishing message:", error);
    } else {
      console.log(`📤 Published to ${topic}`);
    }
  });
};

export const sendMqttTempLimit = (payload) => {
  try {
    publish("iot/config/limit/temp", payload, { retain: true });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const sendMqttPhLimit = (payload) => {
  try {
    publish("iot/config/limit/ph", payload, { retain: true });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Data Retrieval
export const getMqttPoolData = (nodeId) => {
  try {
    return poolData.get(nodeId.toString()) || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllMqttPoolData = () => {
  try {
    return Object.values(Object.fromEntries(poolData));
  } catch (error) {
    console.error(error);
    return {};
  }
};
