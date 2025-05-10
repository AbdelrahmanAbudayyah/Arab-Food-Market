const { Server } = require('socket.io');

let io;

function setupSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:49267', // frontend port
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log('user joined conversation:', conversationId);

    });

    socket.on('send-message', (data) => {
        console.log("socket id :",socket.id);
        console.log("conversationId",data.conversationId, " - data:",data);
        
      socket.broadcast.to(data.conversationId).emit('receive-message', data);
      console.log('user send message:', data);

    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocketIO };
