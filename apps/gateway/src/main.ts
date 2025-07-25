import {
  config,
  initializeCloudinary,
  initializeMongoDB,
  initializeRedis,
  nodeClient,
} from '@server/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://shop-hub.devmun.xyz',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    socket.broadcast.emit('message', msg);
  });

  socket.on('join', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', { from: socket.id, data });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Utility: Graceful shutdown
async function gracefulShutdown(server: http.Server, signal: string) {
  console.log(`\n${signal} signal received: Closing HTTP server...`);

  // Close server
  server.close(async () => {
    console.log('✅ HTTP server closed 🛑');

    // Disconnect Redis clients
    try {
      await nodeClient.quit();
      console.log('✅ Node Redis client disconnected 🔌');
    } catch (error) {
      console.error(
        '❌ Error disconnecting Node Redis client 🔌:',
        (error as Error).message
      );
    }

    process.exit(0);
  });
}

// Initialize MongoDB, Redis, Cloudinary, etc.
(async function initializeApplication() {
  try {
    await initializeMongoDB();
    await initializeRedis();
    await initializeCloudinary();
  } catch (error) {
    console.error(
      '❌ Application Initialization Failed 💥:',
      (error as Error).message
    );
    process.exit(1);
  }
})();

httpServer.listen(Number(config.GATEWAY_PORT), () => {
  console.log(
    `🚀 Gateway server is running on port ${config.GATEWAY_PORT} in ${config.NODE_ENV}`
  );
});

// Graceful shutdown on termination signals
['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.on(signal, () => gracefulShutdown(httpServer, signal))
);

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED PROMISE REJECTION 💥:', err.message);
  process.exit(1);
});
