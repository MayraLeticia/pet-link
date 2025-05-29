const Pet = require('../models/petsSchema');
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");


const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});



class petsController{

    async registerPets(req,res){

        try {
            const {name, race, age, description,weight, location, specie, size, gender, userId}= req.body;
            if(!name || !age || !weight || !specie|| !size || !gender)return res.status(400).send("Não foi prenchido corretamente todos os campos!");

            const newPet = new Pet({
                name,
                race,
                age,
                description,
                weight,
                location,
                specie,
                gender,
                size,
                imgAnimal: req.file.key,
                

            });

            await newPet.save();

            await User.findByIdAndUpdate(userId,{$push:{yourAnimal:newPet._id}} );

            res.status(201).send(newPet);

        } catch (error) {
            console.error(error);

        }
    }

    async updatePet(req, res) {
    try {
        const { name, race, age, description, weight, location, specie } = req.body;
        const { id } = req.params;

        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet não encontrado!" });
        }


        const newImages = req.files ? req.files.map(file => file.key) : [];
        const updatedImages = [...pet.imgAnimal, ...newImages];

        const updatePet = await Pet.findByIdAndUpdate(
            id,
            { name, race, age, description, weight, location, specie, imgAnimal: updatedImages },
            { new: true }
        );

        res.status(200).json(updatePet);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao atualizar o Pet!");
    }
}
    async deletePet(req,res){
        try {
            const {id}= req.params;
            const deletePet = await Pet.findByIdAndDelete(id);
            if(!deletePet)return res.status(404).send('Pet não encontrado')
            res.status(200).send('Pet deletado com sucesso')
        } catch (error) {
            console.error(error)
            res.status(500).send('Erro ao deletar o PET');
        }
    }

    async getPets(req,res){
        try {
            const { specie, race, age, userId } = req.query;

            const filter = {};
            if (specie) filter.specie = specie;
            if (race) filter.race = race;
            if (age) filter.age = parseInt(age);

            // Se userId for fornecido, filtrar apenas pets desse usuário
            if (userId) filter.userId = userId;

            const pets = await Pet.find(filter);
            res.status(200).json(pets)
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao obter os pets');
        }
    }

    async getPetsById(req, res) {
        const petId = req.params.id;


        try {

            if (!mongoose.Types.ObjectId.isValid(petId)) {
                return res.status(400).json({ message: "ID de pet inválido." });
            }

            const pet = await Pet.findById(petId);

            if (!pet) {
                return res.status(404).json({ message: "Pet não encontrado." });
            }

            return res.status(200).json(pet);
        } catch (error) {
            console.error("Erro ao buscar pet:", error);
            return res.status(500).json({ message: "Erro interno do servidor." });
        }
    }



    async deleteImage(req, res) {
        try {
            const { id } = req.params;
            const { imageKey } = req.body;


            const pet = await Pet.findById(id);
            if (!pet) {
                return res.status(404).json({ message: "Pet não encontrado!" });
            }


            if (!pet.imgAnimal.includes(imageKey)) {
                return res.status(400).json({
                    message: "Imagem não encontrada no banco!",
                    imagensNoBanco: pet.imgAnimal
                });
            }


            const updatedImages = pet.imgAnimal.filter(img => img !== imageKey);
            await Pet.findByIdAndUpdate(id, { imgAnimal: updatedImages }, { new: true });


            const deleteParams = {
                Bucket: "uploadpetlink",
                Key: imageKey,
            };

            await s3.send(new DeleteObjectCommand(deleteParams));

            return res.status(200).json({ message: "Imagem removida com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar imagem:", error);
            return res.status(500).json({ message: "Erro ao remover a imagem!" });
        }
    }


}

module.exports= {petsController};