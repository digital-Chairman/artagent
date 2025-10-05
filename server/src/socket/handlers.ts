import { Server as SocketIOServer, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@artagent/shared';

export function setupSocketHandlers(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  // Middleware for authentication (optional)
  io.use(async (socket, next) => {
    // Add authentication logic here if needed
    // const token = socket.handshake.auth.token;
    // if (!isValidToken(token)) {
    //   return next(new Error('Authentication failed'));
    // }
    next();
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    // Store connection metadata
    socket.data.connectedAt = new Date();
    
    // Send welcome message
    socket.emit('welcome', {
      message: 'Welcome to the Socket.IO server!',
      serverTime: new Date().toISOString(),
      socketId: socket.id
    });

    // Handle joining rooms
    socket.on('join:room', (roomName: string, callback) => {
      socket.join(roomName);
      socket.data.currentRoom = roomName;
      
      // Notify others in the room
      socket.to(roomName).emit('user:joined', {
        userId: socket.id,
        roomName,
        timestamp: new Date().toISOString()
      });
      
      // Acknowledge join
      if (callback) {
        callback({
          success: true,
          message: `Successfully joined room: ${roomName}`,
          roomName
        });
      }
      
      console.log(`📍 Socket ${socket.id} joined room: ${roomName}`);
    });

    // Handle leaving rooms
    socket.on('leave:room', (roomName: string, callback) => {
      socket.leave(roomName);
      
      // Notify others in the room
      socket.to(roomName).emit('user:left', {
        userId: socket.id,
        roomName,
        timestamp: new Date().toISOString()
      });
      
      if (socket.data.currentRoom === roomName) {
        socket.data.currentRoom = undefined;
      }
      
      // Acknowledge leave
      if (callback) {
        callback({
          success: true,
          message: `Successfully left room: ${roomName}`,
          roomName
        });
      }
      
      console.log(`📤 Socket ${socket.id} left room: ${roomName}`);
    });

    // Handle sending messages
    socket.on('message:send', (data, callback) => {
      const message = {
        id: generateMessageId(),
        userId: socket.id,
        content: data.content,
        roomName: data.roomName,
        timestamp: new Date().toISOString()
      };
      
      // Send to room or broadcast
      if (data.roomName) {
        socket.to(data.roomName).emit('message:new', message);
      } else {
        socket.broadcast.emit('message:new', message);
      }
      
      // Acknowledge message sent
      if (callback) {
        callback({
          success: true,
          message: 'Message sent successfully',
          messageId: message.id
        });
      }
      
      console.log(`💬 Message from ${socket.id}: ${data.content.substring(0, 50)}...`);
    });

    // Handle typing indicators
    socket.on('typing:start', (roomName) => {
      socket.to(roomName).emit('typing:update', {
        userId: socket.id,
        isTyping: true,
        roomName
      });
    });

    socket.on('typing:stop', (roomName) => {
      socket.to(roomName).emit('typing:update', {
        userId: socket.id,
        isTyping: false,
        roomName
      });
    });

    // Handle custom events
    socket.on('custom:event', (data, callback) => {
      // Process custom event
      console.log(`🎯 Custom event from ${socket.id}:`, data);
      
      // Broadcast to others
      socket.broadcast.emit('custom:broadcast', {
        from: socket.id,
        data,
        timestamp: new Date().toISOString()
      });
      
      if (callback) {
        callback({
          success: true,
          message: 'Custom event processed'
        });
      }
    });

    // Handle audio received
    socket.on('audio:received', () => {
      console.log('Audio received');
      socket.in('art').emit('audio:received');
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
      
      // Notify room members if in a room
      if (socket.data.currentRoom) {
        socket.to(socket.data.currentRoom).emit('user:left', {
          userId: socket.id,
          roomName: socket.data.currentRoom,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error);
    });
  });
}

// Helper function to generate message IDs
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
