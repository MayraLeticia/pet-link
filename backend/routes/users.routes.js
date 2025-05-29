const express = require('express');
const {userController}= require('../controller/userController');
const authMiddleware = require("../config/authMiddleware");

const userRoutes = express.Router();

userRoutes.post('/', new userController().registerUser);
userRoutes.post('/login', new userController().loginUser);
userRoutes.post('/google-auth', new userController().googleAuth);
userRoutes.patch('/:id', new userController().updateUser);
userRoutes.delete('/:id', new userController().deleteUser);
userRoutes.get('/allUsers', new userController().getUser);
userRoutes.get('/:id',authMiddleware, new userController().getUserByid);

module.exports = userRoutes;