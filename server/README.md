# Fastify Socket.IO Server

A high-performance WebSocket server built with Fastify and Socket.IO, running on port 3001.

## Features

- ⚡ **Fastify** - Fast and low overhead web framework
- 🔌 **Socket.IO** - Real-time bidirectional event-based communication
- 📝 **TypeScript** - Full type safety and modern JavaScript features
- 🔒 **CORS Support** - Configured for cross-origin requests
- 🛡️ **Helmet** - Security headers for production
- 📊 **API Endpoints** - RESTful API for server management
- 🧪 **Test Client** - Built-in HTML client for testing

## Installation

```bash
# From the root directory
pnpm install

# Or from the server directory
cd server
pnpm install
```

## Development

```bash
# From root directory
pnpm dev:server

# Or run both web and server
pnpm dev

# Or from server directory
cd server
pnpm dev
```

The server will start on `http://localhost:3001`

## Testing

### Built-in Test Client
Navigate to `http://localhost:3001/ws/test` for an interactive Socket.IO test client.

### Standalone HTML Client
Open `server/client-example.html` in your browser for a standalone test client.

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /` - Server information and available endpoints

### Statistics & Monitoring
- `GET /api/stats` - Server statistics (connected clients, uptime, memory)
- `GET /api/clients` - List all connected clients
- `GET /api/rooms` - List all active rooms

### Message Sending
- `POST /api/message/client` - Send message to specific client
- `POST /api/message/room` - Send message to room
- `POST /api/message/broadcast` - Broadcast to all clients

### Client Management
- `DELETE /api/clients/:clientId` - Disconnect specific client

### WebSocket Info
- `GET /ws/info` - WebSocket configuration info
- `GET /ws/test` - Interactive test client

## Socket.IO Events

### Client to Server Events

```typescript
// Join a room
socket.emit('join:room', roomName, callback);

// Leave a room
socket.emit('leave:room', roomName, callback);

// Send a message
socket.emit('message:send', {
  content: string,
  roomName?: string
}, callback);

// Typing indicators
socket.emit('typing:start', roomName);
socket.emit('typing:stop', roomName);

// Custom events
socket.emit('custom:event', data, callback);
```

### Server to Client Events

```typescript
// Welcome message on connection
socket.on('welcome', (data) => { });

// New message received
socket.on('message:new', (message) => { });

// User joined room
socket.on('user:joined', (data) => { });

// User left room
socket.on('user:left', (data) => { });

// Typing updates
socket.on('typing:update', (data) => { });

// Custom broadcasts
socket.on('custom:broadcast', (data) => { });
```

## Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3001
HOST=localhost
NODE_ENV=development
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── routes/         # API and WebSocket routes
│   ├── socket/         # Socket.IO handlers
│   ├── types/          # TypeScript type definitions
│   ├── index.ts        # Entry point
│   └── server.ts       # Fastify server setup
├── client-example.html # Standalone test client
├── package.json
├── tsconfig.json
└── README.md
```

## Building for Production

```bash
# Build the server
pnpm build:server

# Run production build
NODE_ENV=production pnpm start
```

## Security Considerations

- CORS is configured - update `CORS_ORIGIN` for production
- Helmet is enabled for security headers
- Input validation with Fastify schemas (can be extended)
- Rate limiting can be added with `@fastify/rate-limit`

## Performance

- Fastify provides 2x faster performance than Express
- Socket.IO configured with WebSocket transport priority
- Efficient room management and broadcasting
- Configurable ping/pong intervals for connection management

## Troubleshooting

### Connection Issues
- Ensure port 3001 is not in use
- Check CORS_ORIGIN includes your client URL
- Verify WebSocket transport is not blocked by proxies

### Development Tips
- Use the built-in test client at `/ws/test`
- Monitor server logs for connection events
- Check `/api/stats` for server metrics

## License

MIT
