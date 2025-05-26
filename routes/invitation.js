const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/invite', async (req, res) => {
    const { senderId, receiverId } = req.body;
    
    try {
        const receiver = await db.query('SELECT id FROM users WHERE id = $1', [receiverId]);
        
        if (receiver.rows.length === 0) {
            return res.status(404).json({ error: 'User with this id not found.' });
        }

        const existing = await db.query(
            `SELECT * FROM chat_invitations WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`,
            [senderId, receiverId]
        );

        console.log(existing.rows);

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Invitation already sent.' });
        }

        await db.query(
            'INSERT INTO chat_invitations (sender_id, receiver_email, receiver_id) VALUES ($1, $2, $3)',
            [senderId, receiverId, receiverId]
        );

        res.json({ message: 'Invitation sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send invitation.' });
    }
});

router.get('/invitations/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const invitation = await db.query(
            `SELECT ci.*, u.username AS sender_name FROM chat_invitations ci JOIN users u ON u.id = ci.sender_id WHERE ci.receiver_id = $1 AND ci.status = 'pending'`,
            [userId]
        );
        res.json(invitation.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch invitations.' });
    }
});

router.post('/invitations/:id/respond', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid response' });
    }

    try {
        await db.query(
            'UPDATE chat_invitations SET status = $1 WHERE id = $2', [status, id]
        );
        res.json({ message: `Invitation ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to respond to invitation.' });
    }
});

module.exports = router;