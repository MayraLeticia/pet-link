const express = require('express');
const {petsController} = require('../controller/petsController');
const multer = require('multer');
const multerConfig = require('../config/multer');


const petsRoutes = express.Router();

petsRoutes.post('/',multer(multerConfig).single('file'), new petsController().registerPets);
petsRoutes.delete('/:id', new petsController().deletePet);
petsRoutes.patch('/:id',multer(multerConfig).array('file',5), new petsController().updatePet);
petsRoutes.get('/', new petsController().getPets);
petsRoutes.get('/:id', new petsController().getPetsById);
petsRoutes.delete('/deleteImgPet/:id', new petsController().deleteImage);

    
    

module.exports = petsRoutes;