const express = require('express');
const multer = require('multer');
const multerConfig = require('../config/multer');
const {feedController} = require('../controller/feedController');

const feedRoutes = express.Router();
const upload = multer(multerConfig);


feedRoutes.post('/', upload.single('file'), new feedController().postFeed);

feedRoutes.get('/', new feedController().getAllFeeds);
feedRoutes.get('/:id', new feedController().getFeedById);

feedRoutes.put('/:id', new feedController().updateFeed);

feedRoutes.delete('/:id', new feedController().deleteFeed);

feedRoutes.post('/:feedId/comment', new feedController().addComment);

//like
feedRoutes.post('/:id/like', feedController.toggleLike);


module.exports = feedRoutes;
