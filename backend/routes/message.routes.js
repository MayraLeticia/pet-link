const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/messageSchema');
const { decrypt } = require('../utils/encrypt');

// Buscar últimas conversas de um usuário
router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const objectId = new mongoose.Types.ObjectId(userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: objectId },
                        { receiver: objectId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", objectId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessageAt: { $first: "$timestamp" }
                }
            },
            {
                $sort: { lastMessageAt: -1 }
            }
        ]);

        res.status(200).json(conversations);

    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ error: 'Erro ao buscar conversas.' });
    }
});

// Buscar histórico de mensagens entre dois usuários
router.get('/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const user1Id = new mongoose.Types.ObjectId(user1);
        const user2Id = new mongoose.Types.ObjectId(user2);

        const messages = await Message.find({
            $or: [
                { sender: user1Id, receiver: user2Id },
                { sender: user2Id, receiver: user1Id }
            ]
        }).sort({ timestamp: 1 });

        const decryptedMessages = messages.map(msg => {
    let contentDescriptografado;

    try {
        contentDescriptografado = decrypt(msg.content);
    } catch (err) {
        console.warn(`Erro ao descriptografar mensagem ${msg._id}: ${err.message}`);
        contentDescriptografado = '[mensagem ilegível]';
    }

    return {
        ...msg.toObject(),
        content: contentDescriptografado,
    };
});

        res.status(200).json(decryptedMessages);

    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
});

module.exports = router;
