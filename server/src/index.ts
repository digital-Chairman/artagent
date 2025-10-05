import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import fastifySocketIO from 'fastify-socket.io';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from './server.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { config } from './config/index.js';

const start = async () => {
  const server = await createServer();
  
  try {
    await server.listen({
      port: config.port,
      host: config.host
    });
    
    console.log(`🚀 Server running at http://${config.host}:${config.port}`);
    console.log(`🔌 Socket.IO server ready for connections`);
    
    // Setup Socket.IO handlers after server starts
    setupSocketHandlers(server.io);
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📛 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n📛 Shutting down gracefully...');
  process.exit(0);
});

start();