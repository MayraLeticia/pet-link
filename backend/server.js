const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const PORT =3000;

const conn = require("./db/conn");
conn();

app.use(cors());
app.use(express.json());

const routes = require('./routes/index.routes');
app.use('/api', routes);

app.listen(PORT,()=>{
    console.log(`Sevidor rodando na porta ${PORT}`);
})

module.exports= app;