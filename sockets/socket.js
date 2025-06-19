const userSocketMap = {};

module.exports = (io, redisClient) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} registered to socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (const [uid, sid] of Object.entries(userSocketMap)) {
        if (sid === socket.id) delete userSocketMap[uid];
      }
      console.log("User disconnected:", socket.id);
    });

    // Redis subscriber listens for new post
    redisClient.subscribe("new_post");
    redisClient.on("message", (channel, message) => {
      if (channel === "new_post") {
        const data = JSON.parse(message);
        const { post, followers } = data;

        followers.forEach((followerId) => {
          const socketId = userSocketMap[followerId];
          if (socketId) {
            io.to(socketId).emit("new_post_notify", {
              post,
              authorUsername: data.authorUsername || "A celeb",
            });
          }
        });
      }
    });
  });
};
