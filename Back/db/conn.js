const mongoose = require("mongoose");


async function main() {
    mongoose.set("strictQuery",true)
    
    try {
        await mongoose.connect("mongodb+srv://alkeven007:nsPNDWAnj3PYUvFX@petlink.cl9l1.mongodb.net/?retryWrites=true&w=majority&appName=Petlink")
        console.log("Conectado ao Banco")
        
    } catch (error) {
        console.log(error)
        
    }
    
}
module.exports = main;