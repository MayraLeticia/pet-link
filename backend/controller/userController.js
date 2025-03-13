const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const {sign}= require('jsonwebtoken');
const { trusted } = require('mongoose');

class userController{
    async registerUser(req,res){
        try {
            const{username, password, email}= req.body;
            if(!username) return res.status(400).send("É necessario um nome de Usuario!");
            if(!password) return res.status(400).send("É necessario uma senha!");
            if(!email) return res.status(400).send("É necessario um email!");

            const userByEmail = await User.findOne({email})
            if(userByEmail)return res.status(400).send("Este email já esta sendo utilizado");
            
            const hashedPassword= await bcrypt.hash(password, 10);
            const newUser = new User({username, password:hashedPassword,email});
            
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            });
            

        } catch (error) {
            console.log(error);
            res.status(500).send('Erro ao registrar o usuário');
        }
    }
        async loginUser(req,res){
            try {
                const{email, password}= req.body;
                const user = await User.findOne({email}).populate("yourAnimal");
                if (!user) return res.status(404).send('Usuário não encontrado!');

                const isMatch = await bcrypt.compare(password, user.password);
                if(!isMatch)return res.status(401).send('Senha incorreta');
                
                const token = sign({},'789237109234sfdadf',{
                    subject: user.id,
                    expiresIn:"1d"
                } )

                res.status(200).json({
                    autehenticade: true,
                    token,
                    username: user.username,
                    email: user.email,
                    id: user.id,
                    pets:user.yourAnimal
                })
            } catch (error) {
                console.log(error);
                res.status(500).send('Erro ao fazer login');
                
            }
        }

    async updateUser(req,res){
        try {
            const {id}= req.params;
            const {username, email}= req.body;
            const updateUser= await User.findByIdAndUpdate(id,{username,email},{new:true});
            if(!updateUser) return res.status(404).send('Usuário não encontrado!')
            res.status(200).json(updateUser);
        } catch (error) {
            console.log(error)
            res.status(500).send('Erro ao atulizar o usuário')
        }
    }
    
    async deleteUser(req,res){
        try {
            const {id}= req.params;
            const deleteUser = await User.findByIdAndDelete(id);
            if(!deleteUser) return res.status(404).send('Usuário não encontrado');
            res.status(200).send('Usuário deletado com sucesso')

        } catch (error) {
            console.error(error)
            res.status(500).send('Erro ao deletar usuário');
        }
    }


    async getUser(req,res){
        try {
            const users = await User.find({}, '-password');
            res.status(200).json(users);

        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao obter os usuários');
        }
    }


    async getUserByid(req,res){
        const{id} = req.params
        try {
            const userSelected = await User.findById(id)
            return res.status(200).json(userSelected);
        } catch (error) {
            console.error(error);
            return res.status(404).json({message:'Usuario não encontrado!'})
        }
    }

    

}
module.exports={userController};
