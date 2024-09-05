const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const PORT = 3000;
const conn = require("./db/conn");
const routes = require('./routes/index.routes')

conn();


app.use(cors);
app.use(express.json())

app.use('/api', routes)



app.listen(PORT,()=>{
    console.log(`Servidor rodando na porta ${PORT}`)
})