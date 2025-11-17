export const successResponse = (reply, message, data, status = 200) => {
  return reply.status(status).send({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (reply, message, data = null, status = 400) => {
  return reply.status(status).send({
    success: false,
    message,
    data,
  });
};
