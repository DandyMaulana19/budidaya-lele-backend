import fp from "fastify-plugin";
import { Server as SocketIOServer } from "socket.io";

export default fp(async (app) => {
  const io = new SocketIOServer(app.server, {
    cors: { origin: "*" },
  });

  app.decorate("io", io);

  io.on("connection", (socket) => {
    app.log.info(`Socket connected ${socket.id}`);

    socket.on("join-pool", ({ nodeId }) => {
      socket.join(`pool:${nodeId}`);
    });

    socket.on("leave-pool", ({ nodeId }) => {
      socket.leave(`pool:${nodeId}`);
    });
  });
});
