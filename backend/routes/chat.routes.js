const express = require('express');
const {chatController} = require('../controller/chatController');
const chatRoutes = express.Router();

chatRoutes.post('/send', new chatController().sendMessage );
chatRoutes.get('/messages/:userId1/:userId2', new chatController().getMessages);

module.exports = chatRoutes;
