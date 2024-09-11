const mongoose = require('mongoose');
const userSchema = require('./userSchema');

const PetsSchema = new mongoose.Schema({
    name:{Type: String, require:true},
    race:{Type:String, require: true},
    age:{Type: Int16Array, require: true},
    description:{Type: String, require: true},
    weight:{Type: String,require: true},
    location:{Type: String}
})

module.exports = mongoose.model('Pet', PetsSchema);