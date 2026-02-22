const { Server } = require("socket.io");
const { verifyToken } = require("./utils/jwt.util");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    path: "/ws",
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("✓ Socket.io server initialized");

  io.use((socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!authToken) {
        return next(new Error("Unauthorized"));
      }

      const payload = verifyToken(authToken);
      if (!payload?.userId) {
        return next(new Error("Unauthorized"));
      }

      socket.userId = payload.userId;
      socket.join(payload.userId);
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✓ Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on("disconnect", () => {
      console.log(`✓ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => io;

const notifyUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(userId.toString()).emit(event, payload);
};

const broadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

module.exports = {
  initSocket,
  getIo,
  notifyUser,
  broadcast,
};
