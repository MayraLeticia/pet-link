const Pet = require('../models/petsSchema');

class LocationController {
  async updateLocation(req, res) {
    const { petId, latitude, longitude } = req.body;

    if (!petId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Envia os dados direito, cacete.' });
    }

    try {
      const updatedPet = await Pet.findByIdAndUpdate(petId, {
        coordinates: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }, { new: true });

      if (!updatedPet) {
        return res.status(404).json({ error: 'Pet não encontrado, porra.' });
      }

      return res.status(200).json({ message: 'Localização atualizada.', data: updatedPet });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno, fudeu tudo.' });
    }
  }

  async getNearbyPets(req, res) {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'Falta lat, lng ou raio, caralho.' });
    }

    try {
      const pets = await Pet.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000
          }
        }
      });

      return res.status(200).json(pets);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro buscando pets por localização.' });
    }
  }
}

module.exports = new LocationController();
