const express = require('express');
const userRoutes = require('./users.routes');
const petsRoutes = require('./pets.routes');
const feedRoutes = require('./feed.routes');
//const chatRoutes = require('./chat.routes');
const locationRoutes = require('./location.routes');
const favoritesRoutes = require('./favorites.routes');
const passwordResetRoutes = require('./passwordReset.routes');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/pet', petsRoutes);
router.use('/feed', feedRoutes);
//router.use('/chat', chatRoutes);
router.use('/location', locationRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/auth', passwordResetRoutes);

module.exports = router;