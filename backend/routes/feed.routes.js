const express = require('express');
const {feedController} = require('../controller/feedController');
const multer = require('multer');
const multerConfig = require('../config/multer');

const feedRoutes = express.Router();


feedRoutes.post('/',multer(multerConfig).single('file'), new feedController().postFeed);
feedRoutes.post('/:feedId/comment', (req, res) => new feedController().addComment(req, res));



module.exports= feedRoutes;