const mongoose = require('mongoose');

    async function main(){
    try{
    mongoose.set("strictQuery", true)
    await mongoose.connect('mongodb+srv://alkeven007:nsPNDWAnj3PYUvFX@petlink.cl9l1.mongodb.net/?retryWrites=true&w=majority&appName=Petlink')
    console.log("Banco Conectado");
    }catch(error){
        console.log(`Erro: ${error}`);
    }
}
module.exports = main;