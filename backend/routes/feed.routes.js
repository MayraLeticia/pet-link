const express = require('express');
const multer = require('multer');
const multerConfig = require('../config/multer');
const feedController = require('../controller/feedController');

const feedRoutes = express.Router();
const upload = multer(multerConfig);

// Instância da classe
const feedControllerInstance = new feedController();

// Rotas de feed
feedRoutes.post('/', upload.single('file'), feedControllerInstance.postFeed);
feedRoutes.get('/', feedControllerInstance.getAllFeeds);
feedRoutes.get('/:id', feedControllerInstance.getFeedById);
feedRoutes.put('/:id', feedControllerInstance.updateFeed);
feedRoutes.delete('/:id', feedControllerInstance.deleteFeed);
feedRoutes.post('/:feedId/comment', feedControllerInstance.addComment);
feedRoutes.post('/:id/like', feedControllerInstance.toggleLike);

module.exports = feedRoutes;
