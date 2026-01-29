import { successResponse, errorResponse } from "../utils/response.js";

export const sendTemperatureLimit = async (request, reply) => {
  try {
    const { warn_low, warn_high, alarm_low, alarm_high } = request.body;

    const success = await request.server.mqttService.sendMqttTempLimit({
      warn_low,
      warn_high,
      alarm_low,
      alarm_high,
    });

    if (success) {
      return successResponse(
        reply,
        "Temperature limit configuration broadcasted to all devices",
        {
          topic: "iot/config/limit/temp",
          limits: { warn_low, warn_high, alarm_low, alarm_high },
        },
      );
    } else {
      return errorResponse(
        reply,
        "Failed to send temperature limit configuration",
        null,
        500,
      );
    }
  } catch (error) {
    request.server.log.error(error);
    return errorResponse(
      reply,
      "Failed to send temperature limit configuration",
      error.message,
      500,
    );
  }
};

export const sendPhLimit = async (request, reply) => {
  try {
    const { warn_low, warn_high, alarm_low, alarm_high } = request.body;

    const success = await request.server.mqttService.sendMqttPhLimit({
      warn_low,
      warn_high,
      alarm_low,
      alarm_high,
    });

    if (success) {
      return successResponse(
        reply,
        "pH limit configuration broadcasted to all devices",
        {
          topic: "iot/config/limit/ph",
          limits: { warn_low, warn_high, alarm_low, alarm_high },
        },
      );
    } else {
      return errorResponse(
        reply,
        "Failed to send pH limit configuration",
        null,
        500,
      );
    }
  } catch (error) {
    request.server.log.error(error);
    return errorResponse(
      reply,
      "Failed to send pH limit configuration",
      error.message,
      500,
    );
  }
};

export const getPoolData = async (request, reply) => {
  try {
    const { nodeId } = request.params;
    const data = await request.server.mqttService.getMqttPoolData(nodeId);

    if (data) {
      return successResponse(
        reply,
        `Pool ${nodeId} data retrieved successfully`,
        data,
        200,
      );
    } else {
      return errorResponse(
        reply,
        `No data available for node ${nodeId}. Waiting for device to send data...`,
        null,
        404,
      );
    }
  } catch (error) {
    request.server.log.error(error);
    return errorResponse(
      reply,
      "Failed to retrieve pool data",
      error.message,
      500,
    );
  }
};

export const getAllPoolData = async (request, reply) => {
  try {
    const data = await request.server.mqttService.getAllMqttPoolData();

    return successResponse(
      reply,
      "All pool data retrieved successfully",
      data,
      200,
    );
  } catch (error) {
    request.server.log.error(error);
    return errorResponse(
      reply,
      "Failed to retrieve pool data",
      error.message,
      500,
    );
  }
};

export const publishMessage = async (request, reply) => {
  try {
    const { topic, message, options } = request.body;

    request.server.mqttService.publish(topic, message, options || {});

    return successResponse(reply, "Message published successfully", {
      topic,
      message,
    });
  } catch (error) {
    request.server.log.error(error);
    return errorResponse(
      reply,
      "Failed to publish message",
      error.message,
      500,
    );
  }
};
