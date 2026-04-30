const { Server } = require("socket.io");

let io;
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // join user
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("User joined:", userId);
    });

    // send message
    socket.on("sendMessage", ({ matchId, senderId, receiverId, text }) => {
      const receiverSocket = onlineUsers.get(receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", {
          matchId,
          senderId,
          text
        });
      }
    });

    // disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };