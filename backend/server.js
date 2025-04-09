const express = require('express');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000; // Ajuste aqui

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permite todas as origens (ajuste para o domínio do frontend no Vercel depois)
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"] // Garante compatibilidade com o Vercel
});

const conn = require("./db/conn");
conn();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Use server.listen em vez de app.listen para suportar Socket.IO
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;