const Pet = require('../models/petsSchema');


class petsController{

    async registerPets(req,res){
        try {
            const {name, race, age, description,weight, location,specie}= req.body;
            if(!name || !race || !age || !description || !weight || !location || !specie)return res.status(400).send("Não foi prenchido corretamente todos os campos!");
            
            const newPet = new Pet({name, race, age, description, weight,location, specie});
            await newPet.save();

            res.status(201).send("Pets adicionado com sucesso")

        } catch (error) {
            
        }
    }

    async updatePet(req,res){
        try{
        const {name, race, age, description,weight, location, specie}= req.body;
        const { id}= req.params

        const updatePet = await Pet.findByIdAndUpdate(id,{name, race, age, description,weight, location, specie},{new:true});
        res.status(200).json(updatePet);
        }catch(error){
            console.error(error)
            res.status(500).send('Erro ao atualizar o Pet!')
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
            const pets = await Pet.find({});
            res.status(200).json(pets)
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao obter os usuários')
        }
    }

    async getPetsById(req,res){
        const petsId = req.params
        try {
            const petsSelected =  await Pet.findById(petsId)
            return res.status(200).json(petsSelected)

            
        } catch (error) {
            console.error(error)
            return res.status(404).json({messafe: 'Pet não encontrado'})
        }
    }

    async addImgPetInPets(req,res){
        const{petId}=req.params
        const {imgId}= req.body

        if (!petId)return res.status(400).json({message:"Pet não encontrado!"});
        if(!imgId)return res.status(400).json({message:"Paramentros necessarios não encontrados"});

        try {
            const petsSelected = await Pet.findById(petId)
            const newImg= {imgId}
            
            await Pet.findByIdAndUpdate(petId,{
                imgAnimal:[...petsSelected.imgAnimal, newImg]
            });
            res.status(200).json({message:'Imagem adicionado com sucesso'})

        } catch (error) {
            console.error(error);
            return res.status(500).json({message:'Internal server error!'})
        }
    

    }
}

module.exports= {petsController};