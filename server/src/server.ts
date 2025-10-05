import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import fastifySocketIO from 'fastify-socket.io';
import { config } from './config/index.js';
import { setupRoutes } from './routes/index.js';

export async function createServer() {
  const server = Fastify({
    logger: {
      level: config.logLevel
    }
  });

  // Register plugins
  await server.register(helmet, {
    contentSecurityPolicy: false // Disable CSP for Socket.IO compatibility
  });

  await server.register(cors, {
    origin: config.corsOrigin,
    credentials: true
  });

  await server.register(sensible);

  // Register Socket.IO
  await server.register(fastifySocketIO, {
    cors: {
      origin: config.corsOrigin,
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Setup API routes
  await setupRoutes(server);

  // Health check endpoint
  server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return server;
}
