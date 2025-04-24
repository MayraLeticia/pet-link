const express = require('express');
const favoritesController = require('../controller/favoritesController');
// Removido o authMiddleware para testes

const favoritesRoutes = express.Router();

// Adicionar um pet aos favoritos
favoritesRoutes.post('/add', favoritesController.addFavorite);

// Remover um pet dos favoritos
favoritesRoutes.post('/remove', favoritesController.removeFavorite);

// Listar todos os pets favoritos de um pet
favoritesRoutes.get('/:petId', favoritesController.getFavorites);

module.exports = favoritesRoutes;