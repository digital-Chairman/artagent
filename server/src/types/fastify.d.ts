import { Server as SocketIOServer } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@artagent/shared';

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  }
}
