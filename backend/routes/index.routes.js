const express = require('express');
const userRoutes = require('./users.routes');
const petsRoutes = require('./pets.routes')
//const chatRoutes = require('./chat.routes')

const router = express.Router();

router.use('/user', userRoutes);
router.use('/pet', petsRoutes);
//  router.use('/chat', chatRoutes);

module.exports = router;