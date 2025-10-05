// Socket.IO Event Types

export interface ServerToClientEvents {
  welcome: (data: {
    message: string;
    serverTime: string;
    socketId: string;
  }) => void;
  
  'message:new': (message: {
    id: string;
    userId: string;
    content: string;
    roomName?: string;
    timestamp: string;
  }) => void;
  
  'user:joined': (data: {
    userId: string;
    roomName: string;
    timestamp: string;
  }) => void;
  
  'user:left': (data: {
    userId: string;
    roomName: string;
    timestamp: string;
  }) => void;
  
  'typing:update': (data: {
    userId: string;
    isTyping: boolean;
    roomName: string;
  }) => void;
  
  'custom:broadcast': (data: {
    from: string;
    data: any;
    timestamp: string;
  }) => void;

  'audio:received': () => void;
}

export interface ClientToServerEvents {
  'join:room': (
    roomName: string,
    callback?: (response: {
      success: boolean;
      message: string;
      roomName?: string;
    }) => void
  ) => void;
  
  'leave:room': (
    roomName: string,
    callback?: (response: {
      success: boolean;
      message: string;
      roomName?: string;
    }) => void
  ) => void;
  
  'message:send': (
    data: {
      content: string;
      roomName?: string;
    },
    callback?: (response: {
      success: boolean;
      message: string;
      messageId?: string;
    }) => void
  ) => void;
  
  'typing:start': (roomName: string) => void;
  
  'typing:stop': (roomName: string) => void;
  
  'custom:event': (
    data: any,
    callback?: (response: {
      success: boolean;
      message: string;
    }) => void
  ) => void;

  'audio:received': () => void;
}

export interface InterServerEvents {
  // Events for server-to-server communication in a cluster
  ping: () => void;
}

export interface SocketData {
  connectedAt?: Date;
  currentRoom?: string;
  userId?: string;
  // Add more socket-specific data as needed
}
