const Pet = require('../models/petsSchema');
const bcrypt= require('bcrypt');

class petsController{

    async registerPets(req,res){
        try {
            const {name, race, age, description,weight, location}= req.body;
            if(!name || !race || !age || !description || !weight || !location)return res.status(400).send("Não foi prenchido corretamente todos os campos!");
            
            const newPet = new Pet({name, race, age, description, weight,location});
            await newPet.save();

            res.status(201).send("Pets adicionado com sucesso")

        } catch (error) {
            
        }
    }
}