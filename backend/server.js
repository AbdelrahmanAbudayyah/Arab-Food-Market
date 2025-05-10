const app = require('./app');
const http = require('http');

const { connectDB } = require('./config/mysql-db'); 
const  {connectDBMongoose}  = require('./config/mongoDB/mongo-db'); 
const { setupSocketIO } = require('./socket/socketServer.js'); 


const PORT = process.env.PORT || 1800;

// Connect to databases
connectDB();
connectDBMongoose();

// Create HTTP server to use with socket.io
const server = http.createServer(app);

// Set up socket.io
setupSocketIO(server);


// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
