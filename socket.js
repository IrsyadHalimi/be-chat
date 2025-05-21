const db = require('./models/db');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('user connected');
        
        socket.on('chat message', async ({ userId, message }) => {
            await db.query('INSERT INTO messages (sender_id, message) VALUES ($1, $2)', [userId, message]);
            io.emit('chat message', { userId, message, time: new Date() });
        });
        
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('joinRoom', ({ userId, targetId }) => {
            const roomName = [userId, targetId].sort().join('-');
            socket.join(roomName);
        });

        socket.on('private message', async ({ senderId, receiverId, message }) => {
            const roomName = [senderId, receiverId].sort().join('-');

            await db.query(
                'INSERT INTO private_messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)',
                [senderId, receiverId, message]
            );

            io.to(roomName).emit('private message', { 
                senderId, 
                receiverId, 
                message, 
                time: new Date() 
            });
        });
    })
}