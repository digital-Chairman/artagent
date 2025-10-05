import { FastifyInstance } from 'fastify';

export async function setupWebSocketRoutes(server: FastifyInstance) {
  // WebSocket connection info endpoint
  server.get('/info', async (request, reply) => {
    return {
      transport: ['websocket', 'polling'],
      path: '/socket.io/',
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true
      },
      connectTimeout: 45000,
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1000000 // 1MB
    };
  });
  
  // Test WebSocket connection endpoint
  server.get('/test', async (request, reply) => {
    reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Socket.IO Test</title>
        <script src="/socket.io/socket.io.js"></script>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
          }
          .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
          }
          .connected { background-color: #d4edda; color: #155724; }
          .disconnected { background-color: #f8d7da; color: #721c24; }
          .message {
            padding: 8px;
            margin: 5px 0;
            background-color: #f0f0f0;
            border-radius: 3px;
          }
          button {
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: white;
          }
          button:hover {
            background-color: #0056b3;
          }
          input {
            padding: 8px;
            margin: 5px;
            width: 300px;
            border: 1px solid #ddd;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <h1>Socket.IO Test Client</h1>
        <div id="status" class="status disconnected">Disconnected</div>
        <div>
          <input type="text" id="messageInput" placeholder="Enter a message">
          <button onclick="sendMessage()">Send Message</button>
          <button onclick="joinRoom()">Join Room</button>
          <button onclick="leaveRoom()">Leave Room</button>
        </div>
        <div>
          <input type="text" id="roomInput" placeholder="Enter room name" value="test-room">
        </div>
        <h3>Messages:</h3>
        <div id="messages"></div>
        
        <script>
          const socket = io('http://localhost:3001', {
            transports: ['websocket', 'polling']
          });
          
          const statusDiv = document.getElementById('status');
          const messagesDiv = document.getElementById('messages');
          
          socket.on('connect', () => {
            statusDiv.className = 'status connected';
            statusDiv.textContent = 'Connected - ID: ' + socket.id;
            addMessage('Connected to server');
          });
          
          socket.on('disconnect', () => {
            statusDiv.className = 'status disconnected';
            statusDiv.textContent = 'Disconnected';
            addMessage('Disconnected from server');
          });
          
          socket.on('welcome', (data) => {
            addMessage('Server: ' + data.message);
          });
          
          socket.on('message:new', (message) => {
            addMessage('Message: ' + message.content + ' (from ' + message.userId + ')');
          });
          
          socket.on('user:joined', (data) => {
            addMessage('User ' + data.userId + ' joined room: ' + data.roomName);
          });
          
          socket.on('user:left', (data) => {
            addMessage('User ' + data.userId + ' left room: ' + data.roomName);
          });
          
          function sendMessage() {
            const input = document.getElementById('messageInput');
            const roomInput = document.getElementById('roomInput');
            if (input.value) {
              socket.emit('message:send', {
                content: input.value,
                roomName: roomInput.value || undefined
              }, (response) => {
                addMessage('Sent: ' + input.value + ' - ' + response.message);
              });
              input.value = '';
            }
          }
          
          function joinRoom() {
            const roomInput = document.getElementById('roomInput');
            if (roomInput.value) {
              socket.emit('join:room', roomInput.value, (response) => {
                addMessage(response.message);
              });
            }
          }
          
          function leaveRoom() {
            const roomInput = document.getElementById('roomInput');
            if (roomInput.value) {
              socket.emit('leave:room', roomInput.value, (response) => {
                addMessage(response.message);
              });
            }
          }
          
          function addMessage(text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = new Date().toLocaleTimeString() + ' - ' + text;
            messagesDiv.insertBefore(messageDiv, messagesDiv.firstChild);
            
            // Keep only last 20 messages
            while (messagesDiv.children.length > 20) {
              messagesDiv.removeChild(messagesDiv.lastChild);
            }
          }
          
          // Allow Enter key to send message
          document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          });
        </script>
      </body>
      </html>
    `);
  });
}
