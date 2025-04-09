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

// Conexão com o MongoDB
const conn = require('./db/conn');
conn();

// Importa o schema de mensagens
const Message = require('./models/messageSchema');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas principais
const routes = require('./routes/index.routes');
app.use('/api', routes);

// Rotas de mensagens (histórico entre usuários)
const messageRoutes = require('./routes/message.routes');
app.use('/api/messages', messageRoutes);

// Lógica de WebSocket
io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Entra na sala do usuário
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`Usuário ${userId} entrou na sala.`);
    });

    // Envia e salva a mensagem privada
    socket.on('private_message', async ({ sender, receiver, content }) => {
        try {
            const newMessage = await Message.create({ sender, receiver, content });
            io.to(receiver).emit('private_message', newMessage);
        } catch (error) {
            console.error('Erro ao salvar/enviar mensagem:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});


// Inicializa servidor
// Use server.listen em vez de app.listen para suportar Socket.IO

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;