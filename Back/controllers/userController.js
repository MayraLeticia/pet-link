const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const { sign } = require('jsonwebtoken');


class userController{

    async registerUser(req,res){
        try {
            const{username, password, email} = req.body;
            if (!username) return res.status(400).send("É necessario um nome de usuario!")
            if (!password) return res.status(400).send("É necessario uma senha!")
            if (!email) return res.status(400).send("É necessario um email!")
            
            const userByEmail = await User.findOne({email});
            if(userByEmail) return res.status(400).send("Esta email já entá sendo utilizado")

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({username,password: hashedPassword, email});
            
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

            const token = sign({}, 'asda12421', {
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
            
        }

    
    }
}
module.exports = {userController};