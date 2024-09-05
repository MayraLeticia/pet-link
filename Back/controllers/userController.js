const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const { sign } = require('jsonwebtoken');


class userController{

    async registerUser(req,res){
        try {
            const{username, password, email} = req.body;
            console.log(username, password, email);
            
            if (!username) return res.status(400).send("É necessario um nome de usuario!")
            if (!password) return res.status(400).send("É necessario uma senha!")
            if (!email) return res.status(400).send("É necessario um email!")
            
            const userByEmail = await User.findOne({email});
            if(userByEmail) return res.status(400).send("Esta email já entá sendo utilizado")

            const hashedPassword = await bcrypt.hash(password, 5);
            const newUser = new User({username,password: hashedPassword, email});
            console.log(newUser);
            
            await newUser.save();

            res.status(201).send('Usuário registrado com sucesso');
        } catch (error) {
            console.error(err);
            res.status(500).send('Erro ao registrar o usuário')
            
        }
    }

    async loginUser(req,res){
        try {
            const{email, password}= req.body;
            const user = await User.findOne({email});
            if(!user) return res.status(404).send('Usuário não encontrado');
            if(!password) return res.status(404).send('Senha é necessaria');
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).send('Senha incorreta');

            const token = sign({}, '13123245623345Pet', {
                subject: user.id,
                expiresIn: "1d"
            })

            res.status(200).json({
                authenticated:true,
                token,
                username: user.username,
                email: user.email,
                id: user.id
            })

        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao fazer login')
            
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


    async updateUser(req,res){
        try {
            const {id} = req.params;
            const {username, email} = req.body;
            const updateUser = await User.findByIdAndUpdate(id, {username, email})
            if(!updateUser) return res.status(404).send('Usuário não encontrado');
            res.status(200).json(updateUser);
        } catch (err) {
            console.log(error)
            res.status(500).send('Erro ao atualizar o usuário');
        }
    }

    async deleteUser(req, res){
        try {
            const {id}= req.params;
            const deleteUser = await User.findByIdAndDelete(id);
            if(!deleteUser) return res.status(404).send('Usuário não encontrado');
            res.status(200).json(updateUser);
        } catch (error) {
            console.error(error)
            res.status(500).send('Erro ao atualizar o usuário');

        }
    }

    //addPetsInUserProfile(req,res){}


}
module.exports = {userController};
