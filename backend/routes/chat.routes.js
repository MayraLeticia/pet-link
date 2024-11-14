const express = require('express');
const chatController = require('../controllers/chatController');
const chatRoutes = express.Router();

chatRoutes.post('/send', chatController.sendMessage);
chatRoutes.get('/messages/:userId1/:userId2', chatController.getMessages);

module.exports = chatRoutes;
