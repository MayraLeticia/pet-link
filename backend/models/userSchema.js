const mongoose = require('mongoose');
const Pet = require("./petsSchema");


const UserSchema  = new mongoose.Schema({
    username:{type: String, require: true},
    password:{type: String, require:false},
    email:{type: String, require: true},
    yourAnimal:[{type:mongoose.Schema.Types.ObjectId, ref:"Pet"}],
    yourFeed:[{type:mongoose.Schema.Types.ObjectId, ref:"Feed"}]
})

module.exports = mongoose.model('User', UserSchema);