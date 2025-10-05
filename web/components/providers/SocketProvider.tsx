'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSocketIO } from '@/hooks/useSocketIO';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/utils/socketIO';

interface SocketContextType {
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

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export function SocketProvider({ 
  children, 
  autoConnect = false,
}: SocketProviderProps) {
  const socketIO = useSocketIO({
    autoConnect,
    onConnect: (socketId) => {
      console.log('Socket.IO Provider: Connected', socketId);
    },
    onDisconnect: (reason) => {
      console.log('Socket.IO Provider: Disconnected', reason);
    },
    onError: (error) => {
      console.error('Socket.IO Provider: Error', error);
    },
  });

  return (
    <SocketContext.Provider value={socketIO}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
