const express = require('express');
const userRoutes = require('./users.routes');
const petsRoutes = require('./pets.routes')

const router = express.Router();

router.use('/user', userRoutes);
router.use('/pet', petsRoutes);

module.exports = router;