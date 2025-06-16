// sockets/socket.js

module.exports = (io, redisClient) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Example message listener
    socket.on("chat message", (msg) => {
      console.log("Received message:", msg);
      io.emit("chat message", msg); // broadcast
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
