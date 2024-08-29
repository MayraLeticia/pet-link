const express = require('express');

const userRoutes = require('./users.routes');

const router = express.Router();

router.use('/user', userRoutes );
//router.use('/pets', petsRoutes);

module.exports = router;