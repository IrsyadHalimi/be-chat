const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/chats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const users = await db.query(
            `SELECT id, username FROM users where id != $1 ORDER BY username`, [userId]
        );

        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/messages/:user1Id/:user2Id', async (req, res) => {
    const { user1Id, user2Id } = req.params;
    const result = await db.query(`
        SELECT * FROM private_messages
        WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY created_at ASC
    `, [user1Id, user2Id]);

    res.json(result.rows);
});

module.exports = router;