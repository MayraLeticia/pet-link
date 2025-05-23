// socket.js
const { encrypt, decrypt } = require("./utils/encrypt");
const Message = require("./models/messageSchema");
const jwt = require("jsonwebtoken");
const User = require("./models/userSchema");

function configureSocket(io) {
  // Middleware para autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;

      // Se não tiver token mas tiver userId, permitir conexão (para desenvolvimento)
      if (!token && userId) {
        console.log("Conexão permitida sem token para desenvolvimento. UserId:", userId);
        socket.userId = userId;
        return next();
      }

      if (!token) {
        console.error("Token não fornecido na autenticação do socket");
        return next(new Error("Autenticação necessária"));
      }

      try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          console.error("Usuário não encontrado:", decoded.id);
          return next(new Error("Usuário não encontrado"));
        }

        // Adicionar informações do usuário ao socket
        socket.userId = decoded.id;
        socket.user = user;
        console.log("Socket autenticado com sucesso. UserId:", decoded.id);
        next();
      } catch (jwtError) {
        console.error("Erro ao verificar token JWT:", jwtError.message);

        // Se o token for inválido mas tiver userId, permitir conexão (para desenvolvimento)
        if (userId) {
          console.log("Conexão permitida com token inválido para desenvolvimento. UserId:", userId);
          socket.userId = userId;
          return next();
        }

        return next(new Error("Token inválido"));
      }
    } catch (error) {
      console.error("Erro de autenticação do socket:", error.message);
      next(new Error("Erro de autenticação"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id, "Usuário:", socket.userId);

    socket.on("join", (userId) => {
      if (socket.userId === userId) {
        socket.join(userId);
        console.log(`Usuário ${userId} entrou na sala.`);
      } else {
        console.error(`Tentativa de entrar em sala não autorizada: ${userId}`);
      }
    });

    socket.on("private_message", async ({ sender, receiver, content }) => {
      try {
        // Verificar se o remetente é o usuário autenticado
        if (sender !== socket.userId) {
          console.error(`Tentativa de envio de mensagem não autorizada: ${sender}`);
          return;
        }

        // Verificar se o conteúdo está vazio
        if (!content || content.trim() === "") {
          console.error("Tentativa de envio de mensagem vazia");
          return;
        }

        const encryptedContent = encrypt(content);
        const message = await Message.create({
          sender,
          receiver,
          content: encryptedContent,
        });

        const decryptedMessage = {
          ...message.toObject(),
          content: decrypt(message.content),
        };

        io.to(receiver).emit("private_message", decryptedMessage);
        io.to(sender).emit("private_message", decryptedMessage);
      } catch (err) {
        console.error("Erro ao processar mensagem:", err);
        socket.emit("error", { message: "Erro ao enviar mensagem" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}, Usuário: ${socket.userId}`);
    });

    // Tratamento de erros
    socket.on("error", (error) => {
      console.error("Erro no socket:", error);
    });
  });
}

module.exports = configureSocket;
