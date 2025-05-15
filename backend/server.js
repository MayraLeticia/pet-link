const express = require('express');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

const { encrypt, decrypt } = require('./utils/encrypt'); 

const PORT = process.env.PORT || 5000;

// Lista de palavras ofensivas
const offensiveWords = require('./utils/offensiveWords');

// Função para detectar ofensas
function censurarOfensas(texto) {
  const textoNormalizado = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let censurado = texto;

  offensiveWords.forEach(palavra => {
    const regex = new RegExp(palavra, 'gi');
    censurado = censurado.replace(regex, '***');
  });

  return censurado;
}
// Configuração dinâmica de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Conexão com o MongoDB
const conn = require('./db/conn');
conn();

// Importa o schema de mensagens
const Message = require('./models/messageSchema');

app.use(cors(corsOptions));
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
    // Verificar se há linguagem ofensiva
    const conteudoCensurado = censurarOfensas(content);


    try {
      // Criptografar a mensagem recebida
      const encryptedContent = encrypt(conteudoCensurado);

      // Salvar mensagem criptografada no banco
      const newMessage = await Message.create({
        sender,
        receiver,
        content: encryptedContent,
      });

      // Preparar a mensagem descriptografada para envio
      const decryptedMessage = {
        ...newMessage.toObject(),
        content: conteudoCensurado, // já está limpo
      };

      // Emitir a mensagem para o receptor
      io.to(receiver).emit('private_message', decryptedMessage);

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
