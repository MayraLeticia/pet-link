const express= require('express');
const {userController} = require('../controllers/userController');

const userRoutes = express.Router();

userRoutes.post('/login', new userController().loginUser);
userRoutes.post('/register', new userController().registerUser);

module.exports = userRoutes;
