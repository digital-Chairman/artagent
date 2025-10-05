import { FastifyInstance } from 'fastify';

export async function setupApiRoutes(server: FastifyInstance) {
  // Get server stats
  server.get('/stats', async (request, reply) => {
    const io = server.io;
    const sockets = await io.fetchSockets();
    
    return {
      connectedClients: sockets.length,
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  });
  
  // Get connected clients
  server.get('/clients', async (request, reply) => {
    const io = server.io;
    const sockets = await io.fetchSockets();
    
    return {
      total: sockets.length,
      clients: sockets.map(socket => ({
        id: socket.id,
        connectedAt: socket.data.connectedAt,
        currentRoom: socket.data.currentRoom,
        rooms: Array.from(socket.rooms)
      }))
    };
  });
  
  // Get rooms
  server.get('/rooms', async (request, reply) => {
    const io = server.io;
    const rooms = io.of('/').adapter.rooms;
    const roomList: any[] = [];
    
    rooms.forEach((sockets, roomName) => {
      // Skip default rooms (socket IDs)
      if (!io.of('/').sockets.has(roomName)) {
        roomList.push({
          name: roomName,
          size: sockets.size,
          sockets: Array.from(sockets)
        });
      }
    });
    
    return {
      total: roomList.length,
      rooms: roomList
    };
  });
  
  // Send message to specific client
  server.post<{
    Body: {
      clientId: string;
      event: string;
      data: any;
    }
  }>('/message/client', async (request, reply) => {
    const { clientId, event, data } = request.body;
    const io = server.io;
    
    io.to(clientId).emit(event as any, data);
    
    return {
      success: true,
      message: `Message sent to client ${clientId}`
    };
  });
  
  // Broadcast message to all clients
  server.post<{
    Body: {
      event: string;
      data: any;
    }
  }>('/message/broadcast', async (request, reply) => {
    const { event, data } = request.body;
    const io = server.io;
    
    io.emit(event as any, data);
    
    return {
      success: true,
      message: 'Message broadcasted to all clients'
    };
  });
  
  // Send message to room
  server.post<{
    Body: {
      roomName: string;
      event: string;
      data: any;
    }
  }>('/message/room', async (request, reply) => {
    const { roomName, event, data } = request.body;
    const io = server.io;
    
    io.to(roomName).emit(event as any, data);
    
    return {
      success: true,
      message: `Message sent to room ${roomName}`
    };
  });
  
  // Disconnect specific client
  server.delete<{
    Params: {
      clientId: string;
    }
  }>('/clients/:clientId', async (request, reply) => {
    const { clientId } = request.params;
    const io = server.io;
    
    const sockets = await io.fetchSockets();
    const socket = sockets.find(s => s.id === clientId);
    
    if (socket) {
      socket.disconnect(true);
      return {
        success: true,
        message: `Client ${clientId} disconnected`
      };
    }
    
    reply.code(404);
    return {
      success: false,
      message: `Client ${clientId} not found`
    };
  });
}
