const express = require('express');
const {userController}= require('../controller/userController');

const userRoutes = express.Router();

userRoutes.post('/', new userController().registerUser);
userRoutes.post('/login', new userController().loginUser);
userRoutes.patch('/:id', new userController().updateUser);
userRoutes.delete('/:id', new userController().deleteUser);
userRoutes.get('/', new userController().getUser);
userRoutes.get('/:id', new userController().getUserByid);

module.exports = userRoutes;