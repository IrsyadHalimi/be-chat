const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/chats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const users = await db.query(
            `SELECT id, username FROM users where id != $1 AND (
            id IN (SELECT sender_id FROM chat_invitations WHERE receiver_id = $1 AND status = 'accepted') OR id IN (SELECT receiver_id FROM chat_invitations WHERE sender_id = $1 AND status = 'accepted')) ORDER BY username`, [userId]
        );

        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/messages/:user1Id/:user2Id', async (req, res) => {
    const { user1Id, user2Id } = req.params;

    try {
        const check = await db.query(`
            SELECT 1 FROM chat_invitations
            WHERE (
                    (sender_id = $1 AND receiver_id = $2) OR
                    (sender_id = $2 AND receiver_id = $1)
                  )
            AND status = 'accepted'
            LIMIT 1
        `, [user1Id, user2Id]);

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const result = await db.query(`
            SELECT * FROM private_messages
            WHERE (sender_id = $1 AND receiver_id = $2) 
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `, [user1Id, user2Id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;