const mongoose = require('mongoose');

const PetsSchema = new mongoose.Schema({

    petName:{type:String, required: true},
    idade: {type:String, required: true},
    endereco:{type:String, required: true},
    especie:{type:String, required: true},
    raca:{type:String, required: true},
    altura:{type:Float32Array, required: true},
    peso:{type:Int16Array, required: true}
})

module.exports= mongoose.model('Pets', PetsSchema);