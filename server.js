require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const invitationRoutes = require('./routes/invitation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', messageRoutes);
app.use('/api', invitationRoutes);

require('./socket')(io);

server.listen(3000, () => console.log('listening on port 3000'));