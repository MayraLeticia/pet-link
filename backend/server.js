const express = require('express');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
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
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;