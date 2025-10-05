'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  isSocketConnected,
  destroySocket,
  type ServerToClientEvents,
  type ClientToServerEvents,
} from '@/utils/socketIO';
import type { Socket } from 'socket.io-client';

interface UseSocketIOOptions {
  autoConnect?: boolean;
  onConnect?: (socketId: string) => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  room?: string;
}

interface UseSocketIOReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
  connecting: boolean;
  socketId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinRoom: (roomName: string) => Promise<void>;
  leaveRoom: (roomName: string) => Promise<void>;
  sendMessage: (content: string, roomName?: string) => Promise<string | undefined>;
  emit: <K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) => void;
  on: <K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) => void;
  off: <K extends keyof ServerToClientEvents>(
    event: K,
    handler?: ServerToClientEvents[K]
  ) => void;
}

export function useSocketIO(options: UseSocketIOOptions = {}): UseSocketIOReturn {
  const {
    autoConnect = false,
    onConnect,
    onDisconnect,
    onError,
  } = options;
  const room = String(process.env['NEXT_PUBLIC_SOCKET_ROOM']);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const mountedRef = useRef(true);

  // Initialize socket
  useEffect(() => {
    socketRef.current = getSocket();
    setConnected(isSocketConnected());
    setSocketId(socketRef.current.id || null);

    // Set up event listeners
    const handleConnect = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setConnecting(false);
      setSocketId(socketRef.current?.id || null);
      onConnect?.(socketRef.current?.id || 'connected');
    };

    const handleDisconnect = (reason: string) => {
      if (!mountedRef.current) return;
      setConnected(false);
      setConnecting(false);
      setSocketId(null);
      onDisconnect?.(reason);
    };

    const handleError = (error: Error) => {
      if (!mountedRef.current) return;
      setConnecting(false);
      onError?.(error);
    };

    socketRef.current.on('connect', handleConnect);
    socketRef.current.on('disconnect', handleDisconnect);
    socketRef.current.on('connect_error', handleError);

    // Auto-connect if requested
    if (autoConnect && !isSocketConnected()) {
      connect();
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.off('connect', handleConnect);
        socketRef.current.off('disconnect', handleDisconnect);
        socketRef.current.off('connect_error', handleError);
      }
    };
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    // Check current connection status directly from socket
    const socket = getSocket();
    if (socket.connected) {
      console.log('Socket already connected');
      return;
    }
    
    if (connecting) {
      console.log('Connection already in progress');
      return;
    }
    
    setConnecting(true);
    try {
      const id = await connectSocket();
      console.log('Socket connected with ID:', id);
      
      // Join room if specified
      if (room && room.trim() !== '') {
        console.log('Joining room:', room);
        await joinRoom(room);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error; // Re-throw to let caller handle it
    } finally {
      // Always set connecting to false when done
      setConnecting(false);
    }
  }, [connecting, room]);

  // Disconnect function
  const disconnect = useCallback(() => {
    disconnectSocket();
    // Force state update to reflect disconnection
    setConnected(false);
    setConnecting(false);
    setSocketId(null);
  }, []);

  // Join room
  const joinRoom = useCallback((roomName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('join:room', roomName, (response) => {
        if (response?.success) {
          console.log(`Joined room: ${roomName}`);
          resolve();
        } else {
          reject(new Error(response?.message || 'Failed to join room'));
        }
      });
    });
  }, []);

  // Leave room
  const leaveRoom = useCallback((roomName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('leave:room', roomName, (response) => {
        if (response?.success) {
          console.log(`Left room: ${roomName}`);
          resolve();
        } else {
          reject(new Error(response?.message || 'Failed to leave room'));
        }
      });
    });
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, roomName?: string): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('message:send', { content, roomName }, (response) => {
        if (response?.success) {
          resolve(response.messageId);
        } else {
          reject(new Error(response?.message || 'Failed to send message'));
        }
      });
    });
  }, []);

  // Generic emit function
  const emit = useCallback(<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) => {
    if (socketRef.current?.connected) {
      (socketRef.current.emit as any)(event, ...args);
    }
  }, []);

  // Event listener management
  const on = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) => {
    socketRef.current?.on(event, handler as any);
  }, []);

  const off = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    handler?: ServerToClientEvents[K]
  ) => {
    if (handler) {
      socketRef.current?.off(event, handler as any);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    connecting,
    socketId,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    emit,
    on,
    off,
  };
}
