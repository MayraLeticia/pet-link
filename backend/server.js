const express = require('express');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const PORT =5000;


const server = http.createServer(app);
const io = new Server(server);

const conn = require("./db/conn");
conn();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const routes = require('./routes/index.routes');
app.use('/api', routes);

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Usuário entra em sua sala personalizada baseada no ID
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`Usuário ${userId} entrou na sala.`);
    });

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

app.listen(PORT,()=>{
    console.log(`Sevidor rodando na porta ${PORT}`);
})

module.exports= app;