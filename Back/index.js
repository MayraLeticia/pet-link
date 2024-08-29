const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const conn = require("./db/conn");

app.use(cors);
conn();

app.use(express.json())

const routes = require('./routes/index.routes')
app.use('/apí', routes)



app.listen(PORT,()=>{
    console.log(`Servidor rodando na porta ${PORT}`)
})