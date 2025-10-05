# Socket.IO Integration Guide

This guide explains how to use the Socket.IO integration with your Hume AI application.

## Setup

### 1. Environment Variables

Add the Socket.IO server URL to your `.env.local` file:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 2. Install Dependencies

Dependencies are already added to `package.json`. Run:

```bash
pnpm install
```

## Usage Options

### Option 1: Direct Hook Usage

Use the `useSocketIO` hook directly in your components:

```tsx
import { useSocketIO } from '@/hooks/useSocketIO';

function MyComponent() {
  const {
    connected,
    connect,
    disconnect,
    sendMessage,
    on,
    off
  } = useSocketIO({
    autoConnect: false
  });

  // Connect when needed
  const handleConnect = async () => {
    await connect();
    await sendMessage('Hello from client!');
  };

  return (
    <button onClick={handleConnect}>
      {connected ? 'Connected' : 'Connect'}
    </button>
  );
}
```

### Option 2: With StartCall Integration

Use the enhanced `StartCallWithSocket` component that automatically manages Socket.IO alongside Hume:

```tsx
import StartCallWithSocket from '@/components/StartCallWithSocket';

function App() {
  return (
    <StartCallWithSocket 
      configId={configId}
      accessToken={accessToken}
    />
  );
}
```

### Option 3: Global Provider Pattern

Wrap your app with the `SocketProvider` for global access:

```tsx
// app/layout.tsx or app/page.tsx
import { SocketProvider } from '@/components/providers/SocketProvider';

export default function Layout({ children }) {
  return (
    <SocketProvider autoConnect={false}>
      {children}
    </SocketProvider>
  );
}

// In any child component
import { useSocket } from '@/components/providers/SocketProvider';

function ChildComponent() {
  const { connected, sendMessage } = useSocket();
  
  // Use socket functionality
}
```

## Features

### Singleton Connection
- Only ONE Socket.IO client per browser tab
- Connection persists across component re-renders
- Automatic cleanup on page close

### Auto-Connect with Hume
The Socket.IO connection can be automatically managed based on Hume's connection status:

```tsx
// Socket connects when Hume connects
// Socket disconnects when Hume disconnects
useEffect(() => {
  if (humeConnected) {
    connectSocket();
  } else {
    disconnectSocket();
  }
}, [humeConnected]);
```

### Room Management
Join and leave rooms for organized communication:

```tsx
const { joinRoom, leaveRoom } = useSocketIO();

// Join a session room
await joinRoom('session-123');

// Leave when done
await leaveRoom('session-123');
```

### Message Sending
Send messages to specific rooms or broadcast:

```tsx
// Send to specific room
await sendMessage('Hello room!', 'room-123');

// Broadcast to all
await sendMessage('Hello everyone!');
```

### Event Listening
Listen to server events with type safety:

```tsx
useEffect(() => {
  const handleMessage = (message) => {
    console.log('New message:', message);
  };

  on('message:new', handleMessage);

  return () => {
    off('message:new', handleMessage);
  };
}, [on, off]);
```

## Available Events

### Client to Server
- `join:room` - Join a room
- `leave:room` - Leave a room
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `custom:event` - Custom events

### Server to Client
- `welcome` - Welcome message on connect
- `message:new` - New message received
- `user:joined` - User joined room
- `user:left` - User left room
- `typing:update` - Typing status update
- `custom:broadcast` - Custom broadcast

## Integration Flow

1. **User starts Hume call** → StartCall component
2. **Hume connects** → Socket.IO connects automatically
3. **Socket joins room** → Ready for collaboration
4. **During call** → Real-time message exchange
5. **User ends call** → Hume disconnects → Socket.IO disconnects

## Testing

1. Start the server: `pnpm dev:server`
2. Start the web app: `pnpm dev:web`
3. Open the test client: http://localhost:3001/ws/test
4. Start a Hume call and watch the Socket.IO connection establish

## Troubleshooting

### Connection Issues
- Ensure server is running on port 3001
- Check CORS settings in server configuration
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly

### Memory Leaks
- Always clean up event listeners in `useEffect` return
- Use the `off` method to remove listeners
- Socket automatically disconnects on page unload

### TypeScript Errors
- Event types are defined in `utils/socketIO.ts`
- Update types if adding new events on server
