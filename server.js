const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

const app = express();
const server = require("http").createServer(app);

// Socket.IO setup
const allowedOrigins = [
  'https://social-feed-client.vercel.app', // ✅ Replace with your actual deployed frontend
  'http://localhost:3000',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});
// Redis clients
const redisPublisher = new Redis(process.env.REDIS_URL, {
  tls: {}, // Required for Upstash
  maxRetriesPerRequest: 5,
  reconnectOnError: () => true,
});

const redisSubscriber = new Redis(process.env.REDIS_URL, {
  tls: {}, // Required for Upstash
  maxRetriesPerRequest: 5,
  reconnectOnError: () => true,
});

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes')(redisPublisher)); // pass publisher to postRoutes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Socket.IO Logic ---
const userSocketMap = new Map(); // userId => socket.id

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered to socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, sId] of userSocketMap.entries()) {
      if (sId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// --- Redis Subscriber ---
redisSubscriber.subscribe('new_post', () => {
  console.log('Subscribed to Redis channel: new_post');
});

redisSubscriber.on('message', (channel, message) => {
  if (channel === 'new_post') {
    const data = JSON.parse(message); // { authorId, followers, post }
    data.followers.forEach((followerId) => {
      const socketId = userSocketMap.get(followerId);
      if (socketId) {
        io.to(socketId).emit('new_post_notification', {
          authorId: data.authorId,
          post: data.post,
        });
      }
    });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
