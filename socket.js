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
        })
    })
}