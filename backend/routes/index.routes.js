const express = require('express');
const userRoutes = require('./users.routes');
const petsRoutes = require('./pets.routes');
//const chatRoutes = require('./chat.routes')
const locationRoutes = require('./location.routes');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/pet', petsRoutes);
//  router.use('/chat', chatRoutes);
router.use('/location', locationRoutes);

module.exports = router;