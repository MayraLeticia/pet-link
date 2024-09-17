const express = require('express');
const {petsController} = require('../controller/petsController');

const petsRoutes = express.Router();

petsRoutes.post('/registerPet', new petsController().registerPets);
petsRoutes.delete('/deletePet/:id', new petsController().deletePet);
petsRoutes.patch('/updatePet/:id', new petsController().updatePet);
petsRoutes.get('/allPets', new petsController().getPets);

module.exports = petsRoutes;