const mongoose = require('mongoose');


const PetsSchema = new mongoose.Schema({
    name:{type: String, require:true},
    race:{type:String, require: false},
    age:{type: String, require: true},
    description:{type: String, require: false},
    weight:{type: String,require: true},
    specie:{type:String, require:true},
    location:{type: String},
    imgAnimal:{type:[{}], default:[]}
})

module.exports = mongoose.model('Pet', PetsSchema);