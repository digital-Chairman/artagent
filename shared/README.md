# @artagent/shared

This package contains shared types and interfaces used by both the server and web client.

## Types

### Socket.IO Event Types

- `ServerToClientEvents` - Events sent from server to client
- `ClientToServerEvents` - Events sent from client to server
- `InterServerEvents` - Events for server-to-server communication
- `SocketData` - Socket-specific data structure

## Usage

### In Server

```typescript
import { ServerToClientEvents, ClientToServerEvents } from '@artagent/shared';
```

### In Client

```typescript
import { ServerToClientEvents, ClientToServerEvents } from '@artagent/shared';
```

## Development

This package is part of the monorepo workspace managed by pnpm. Any changes to types here will be immediately available to both server and client packages.
