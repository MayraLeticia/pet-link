const express = require('express');
const {userController}= require('../controller/userController');

const userRoutes = express.Router();

userRoutes.post('/register', new userController().registerUser);
userRoutes.post('/login', new userController().loginUser);


module.exports = userRoutes;