const Pet = require('../models/petsSchema');
const mongoose = require('mongoose');

class FavoritesController {
  
  // Adicionar um pet aos favoritos
  async addFavorite(req, res) {
    try {
      const { petId, favoritePetId } = req.body;
      
      // Verificar se os IDs são válidos
      if (!mongoose.Types.ObjectId.isValid(petId) || !mongoose.Types.ObjectId.isValid(favoritePetId)) {
        return res.status(400).json({ error: 'IDs de pet inválidos.' });
      }
      
      // Verificar se o pet existe
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado.' });
      }
      
      // Verificar se o pet favorito existe
      const favoritePet = await Pet.findById(favoritePetId);
      if (!favoritePet) {
        return res.status(404).json({ error: 'Pet favorito não encontrado.' });
      }
      
      // Verificar se o pet já está nos favoritos
      if (pet.favoritos && pet.favoritos.includes(favoritePetId)) {
        return res.status(400).json({ error: 'Este pet já está nos favoritos.' });
      }
      
      // Adicionar o pet aos favoritos - usando updateOne para evitar validação completa do documento
      const result = await Pet.updateOne(
        { _id: petId },
        { $addToSet: { favoritos: favoritePetId } }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(400).json({ error: 'Não foi possível adicionar o pet aos favoritos.' });
      }
      
      // Buscar o pet atualizado para retornar na resposta
      const updatedPet = await Pet.findById(petId);
      
      return res.status(200).json({ 
        message: 'Pet adicionado aos favoritos com sucesso.', 
        favoritos: updatedPet.favoritos 
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return res.status(500).json({ error: 'Erro interno ao adicionar favorito.' });
    }
  }
  
  // Remover um pet dos favoritos
  async removeFavorite(req, res) {
    try {
      const { petId, favoritePetId } = req.body;
      
      // Verificar se os IDs são válidos
      if (!mongoose.Types.ObjectId.isValid(petId) || !mongoose.Types.ObjectId.isValid(favoritePetId)) {
        return res.status(400).json({ error: 'IDs de pet inválidos.' });
      }
      
      // Verificar se o pet existe
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado.' });
      }
      
      // Verificar se o pet está nos favoritos
      if (!pet.favoritos || !pet.favoritos.some(fav => fav.toString() === favoritePetId)) {
        return res.status(400).json({ error: 'Este pet não está nos favoritos.' });
      }
      
      // Remover o pet dos favoritos - usando updateOne para evitar validação completa
      const result = await Pet.updateOne(
        { _id: petId },
        { $pull: { favoritos: favoritePetId } }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(400).json({ error: 'Não foi possível remover o pet dos favoritos.' });
      }
      
      // Buscar o pet atualizado para retornar na resposta
      const updatedPet = await Pet.findById(petId);
      
      return res.status(200).json({ 
        message: 'Pet removido dos favoritos com sucesso.', 
        favoritos: updatedPet.favoritos 
      });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return res.status(500).json({ error: 'Erro interno ao remover favorito.' });
    }
  }
  
  // Listar todos os pets favoritos de um pet
  async getFavorites(req, res) {
    try {
      const { petId } = req.params;
      
      // Verificar se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(petId)) {
        return res.status(400).json({ error: 'ID de pet inválido.' });
      }
      
      // Buscar o pet com os favoritos
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado.' });
      }
      
      // Se não tiver favoritos, retorna array vazio
      if (!pet.favoritos || pet.favoritos.length === 0) {
        return res.status(200).json({ favoritos: [] });
      }
      
      // Buscar os pets favoritos
      const favoritos = await Pet.find({
        _id: { $in: pet.favoritos }
      });
      
      return res.status(200).json({ favoritos });
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar favoritos.' });
    }
  }
}

module.exports = new FavoritesController();