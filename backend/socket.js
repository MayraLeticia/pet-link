// socket.js
const { encrypt, decrypt } = require("./utils/encrypt");
const Message = require("./models/messageSchema");

function configureSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`Usuário ${userId} entrou na sala.`);
    });

    socket.on("private_message", async ({ sender, receiver, content }) => {
      try {
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
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });
}

module.exports = configureSocket;
