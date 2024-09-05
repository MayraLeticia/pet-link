const express= require('express');
const {userController} = require('../controllers/userController');

const userRoutes = express.Router();

const UserController = new userController()

userRoutes.post('/login', UserController.loginUser);
userRoutes.post('/register', UserController.registerUser);
userRoutes.get('/allUsers', new userController().getUser);
userRoutes.patch('/update/:id', new userController().updateUser);
userRoutes.delete('/remove/:id', new userController().deleteUser);


module.exports = userRoutes;
