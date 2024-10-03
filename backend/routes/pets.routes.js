const express = require('express');
const {petsController} = require('../controller/petsController');
const multer = require('multer');
const multerConfig = require('../config/multer');

const petsRoutes = express.Router();

petsRoutes.post('/registerPet', new petsController().registerPets);
petsRoutes.delete('/deletePet/:id', new petsController().deletePet);
petsRoutes.patch('/updatePet/:id', new petsController().updatePet);
petsRoutes.get('/allPets', new petsController().getPets);
petsRoutes.post('/img', multer(multerConfig).single('file'),(req,res)=>{ console.log(req.file)
    return res.json({hello:"Rocket"});
});

module.exports = petsRoutes;