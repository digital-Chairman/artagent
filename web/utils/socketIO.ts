import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@artagent/shared';

// Re-export types for convenience
export type { ServerToClientEvents, ClientToServerEvents } from '@artagent/shared';

// Socket.IO singleton instance
let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// Socket.IO configuration
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Socket options
const socketOptions = {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Don't auto-connect on creation
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};

// Get or create socket instance
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socketInstance) {
    socketInstance = io(SOCKET_SERVER_URL, socketOptions);
    
    // Set up global event listeners
    socketInstance.on('connect', () => {
      console.log('🔌 Socket.IO connected:', socketInstance?.id);
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error.message);
    });
  }
  
  return socketInstance;
}

// Connect to Socket.IO server
export function connectSocket(): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    
    if (socket.connected) {
      resolve(socket.id || 'connected');
      return;
    }
    
    // Set up one-time listeners for this connection attempt
    const connectHandler = () => {
      socket.off('connect', connectHandler);
      socket.off('connect_error', errorHandler);
      resolve(socket.id || 'connected');
    };
    
    const errorHandler = (error: Error) => {
      socket.off('connect', connectHandler);
      socket.off('connect_error', errorHandler);
      reject(error);
    };
    
    socket.once('connect', connectHandler);
    socket.once('connect_error', errorHandler);
    
    // Connect
    socket.connect();
  });
}

// Disconnect from Socket.IO server
export function disconnectSocket(): void {
  const socket = getSocket();
  if (socket.connected) {
    socket.disconnect();
  }
}

// Check if socket is connected
export function isSocketConnected(): boolean {
  return socketInstance?.connected || false;
}

// Clean up socket instance (for complete cleanup)
export function destroySocket(): void {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// Handle page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    disconnectSocket();
  });
}
