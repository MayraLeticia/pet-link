const express = require('express');
const router = express.Router();
const locationController = require('../controller/locationController');

router.post('/location', locationController.updateLocation);
router.get('/nearby', locationController.getNearbyPets);

module.exports = router;
