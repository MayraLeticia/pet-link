
const Img = require('../models/imgSchema');
const multer = require('multer');
const multerConfig = require('../config/multer')



class imgController{

    /*async registerImg(req,res){

        try {
            multer(multerConfig).single('file'),(req,res)
            console.log(req.file)
            res.status(201).send("Imagem Salva com sucesso")
            
        } catch (error) {
            console.log(error)
        }
    }
    */

    async getImgById(req,res){
        const{imgId} = req.params
        try {
            const imgSelected = await Img.findById(imgId)
            return res.status(200).json(imgSelected)
        } catch (error) {
            console.error(error);
            return res.status(404).json({message:"Imagem não encontrada!"})
        }
    }
    async getImgs(req,res){
        try{
            const imgs = await Img.find({});
            res.status(200).json(imgs)
        }catch(error){
            console.error(error);
            res.status(500).send('Erro ao obter as imagens')
        }
    }
}
module.exports={imgController};
