const express = require('express');
const userRoutes = require('./users.routes');
const petsRoutes = require('./pets.routes');
const feedRoutes = require('./feed.routes');
//const chatRoutes = require('./chat.routes');
const locationRoutes = require('./location.routes');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/pet', petsRoutes);
router.use('/feed', feedRoutes);
//  router.use('/chat', chatRoutes);
router.use('/location', locationRoutes);

module.exports = router;
