export const successResponse = (reply, message, data = null, status = 200) => {
  return reply.statusCode(status).send({
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
