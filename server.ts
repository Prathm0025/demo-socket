import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// Create an Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with basic CORS settings (adjust origin as needed)
const io = new Server(server, {
  cors: {
    origin: "*", // Update with your frontend's origin in production
    methods: ["GET", "POST"]
  }
});

// Use your secure Redis connection string (rediss://)
const redisURL = 'rediss://red-cuipq5i3esus739kckc0:nhZ1QrJoJv0xilrQ7TkrdnH6a0vthmkB@singapore-redis.render.com:6379';

async function setupRedisAdapter() {
  // Create the Redis clients for publishing and subscribing
  const pubClient = createClient({ url: redisURL });
  const subClient = pubClient.duplicate();
  
  // Connect both clients
  await Promise.all([pubClient.connect(), subClient.connect()]);
  
  // Attach the Redis adapter to Socket.IO
  io.adapter(createAdapter(pubClient, subClient));
}

setupRedisAdapter().catch((err) => {
  console.error('Redis Adapter Setup Error:', err);
});

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for 'message' events from clients
  socket.on('message', (msg: string) => {
    console.log(`Received message from ${socket.id}: ${msg}`);
    // Broadcast the message to all connected clients
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the backend server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server is running on port ${PORT}`);
});
