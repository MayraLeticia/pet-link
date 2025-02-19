const express = require('express');
const {petsController} = require('../controller/petsController');

const {imgController}= require('../controller/imgController')
const multer = require('multer');
const multerConfig = require('../config/multer');

const Img = require('../models/imgSchema');

const petsRoutes = express.Router();

petsRoutes.post('/registerPet', new petsController().registerPets);
petsRoutes.delete('/deletePet/:id', new petsController().deletePet);
petsRoutes.patch('/updatePet/:id', new petsController().updatePet);
petsRoutes.get('/allPets', new petsController().getPets);
petsRoutes.get('/:id', new petsController().getPetsById);
petsRoutes.post('/addImg/:petId', new petsController().addImgPetInPets);
petsRoutes.get('/getImgId/:imgId', new imgController().getImgById);
petsRoutes.get('/aLLimg', new imgController().getImgs)
petsRoutes.delete('/deleteImgPet/:petId/:imgId', new petsController().deleteImgPet);
petsRoutes.delete('/deleteImg/:id', new imgController().deleteImgs);
petsRoutes.post('/img', multer(multerConfig).single('file'),async (req,res)=>{
    const{originalname: name, size, key, location: url=""}= req.file;

    const img = await Img.create({
        name,
        size,
        key,
        url
    })
    return res.json(img)
});
    
    

module.exports = petsRoutes;