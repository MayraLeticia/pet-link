const express = require('express');
const router = express.Router();
const Message = require('../models/messageSchema');

// GET /api/messages/:user1/:user2
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Erro ao buscar histórico de mensagens:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

module.exports = router;
