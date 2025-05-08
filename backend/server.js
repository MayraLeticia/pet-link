const express = require("express");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const configureSocket = require("./socket"); // <-- aqui!

const app = express();
const server = http.createServer(app);

const { encrypt, decrypt } = require('./utils/encrypt');

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

// Configuração dinâmica de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
process.env.ALLOWED_ORIGINS.split(',') : 
['http://localhost:3000'];

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});


// Conecta ao Mongo e configura middlewares
const conn = require("./db/conn");
conn();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas principais
// Rotas de mensagens (histórico entre usuários)
const routes = require('./routes/index.routes');
const messageRoutes = require('./routes/message.routes');
app.use('/api', routes);
app.use('/api/messages', messageRoutes);

// Configura os eventos do Socket.IO
configureSocket(io);

// Inicializa servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
