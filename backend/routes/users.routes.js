const express = require('express');
const {userController}= require('../controller/userController');

const userRoutes = express.Router();

userRoutes.post('/register', new userController().registerUser);
userRoutes.post('/login', new userController().loginUser);
userRoutes.patch('/update/:id', new userController().updateUser);
userRoutes.delete('/delete/:id', new userController().deleteUser);
userRoutes.get('/allUsers', new userController().getUser);


module.exports = userRoutes;