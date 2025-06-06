const mongoose = require('mongoose');
const Pet = require("./petsSchema");


const UserSchema  = new mongoose.Schema({
    username:{type: String, require: true},
    password:{type: String, require:false},
    email:{type: String, require: true},
    yourAnimal:[{type:mongoose.Schema.Types.ObjectId, ref:"Pet"}],
    yourFeed:[{type:mongoose.Schema.Types.ObjectId, ref:"Feed"}],
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date},
    googleId: {type: String},
    profileImage: {type: String},
    isGoogleUser: {type: Boolean, default: false}
})

module.exports = mongoose.model('User', UserSchema);