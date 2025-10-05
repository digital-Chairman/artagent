import { FastifyInstance } from 'fastify';
import { setupApiRoutes } from './api.js';
import { setupWebSocketRoutes } from './websocket.js';

export async function setupRoutes(server: FastifyInstance) {
  // API routes
  await server.register(setupApiRoutes, { prefix: '/api' });
  
  // WebSocket-related HTTP routes
  await server.register(setupWebSocketRoutes, { prefix: '/ws' });
  
  // Root route
  server.get('/', async (request, reply) => {
    return {
      name: 'Fastify Socket.IO Server',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api',
        websocket: 'ws://localhost:3001',
        socketio: 'http://localhost:3001/socket.io/'
      }
    };
  });
}
