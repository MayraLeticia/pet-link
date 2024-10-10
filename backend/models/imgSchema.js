const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    nameImg:{type:String, require:false},
    size:{type:String, require: false},
    url:{type:String, require:false},
    key:{type:String},
    createdAt:{
        type: Date,
        default:Date.now
    }
});

module.exports= mongoose.model("Img", imgSchema);