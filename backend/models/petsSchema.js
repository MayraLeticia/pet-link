const mongoose = require('mongoose');

const PetsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  race: { type: String },
  age: { type: String, required: true },
  description: { type: String },
  weight: { type: String, required: true },
  specie: { type: String, required: true },
  gender: { type: String, required: true },
  size: { type: String, required: true },
  location: { type: String },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
    },
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  feedId: { type: mongoose.Schema.Types.ObjectId, ref: "Feed", required: false },
  imgAnimal: { type: [String] },
  favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }]
});

// Índice geoespacial
PetsSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Pet', PetsSchema);
