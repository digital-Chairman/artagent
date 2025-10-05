export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',
  isDevelopment: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  
  // Socket.IO specific config
  socketIO: {
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6 // 1MB
  }
} as const;
