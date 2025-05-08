const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/messageSchema');
const { decrypt } = require('../utils/encrypt');
const { verifyToken } = require('../utils/verifyToken');

// Buscar últimas conversas de um usuário
router.get('/conversations', verifyToken, async (req, res) => {
    const userId = req.user.id;
    
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
router.get('/:contactId', verifyToken, async (req, res) => {
    
    try {
        const userId = req.user.id; // vem do JWT validado
        const contactId = req.params.contactId;
      
        const messages = await Message.find({
          $or: [
            { sender: userId, receiver: contactId },
            { sender: contactId, receiver: userId }
          ]
        }).sort({ timestamp: 1 });

        const decryptedMessages = messages.map(msg => ({
            ...msg.toObject(),
            content: decrypt(msg.content)
        
        }));

        res.status(200).json(decryptedMessages);

    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
});

module.exports = router;
