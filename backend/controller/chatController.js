const Message = require('../models/messageSchema');
const mongoose = require("mongoose");
const { encrypt } = require('../utils/encrypt');

class ChatController {
    constructor(io) {
        this.io = io;
    }

    async sendMessage(req, res) {
        try {
            const senderId = socket.user.id; // via JWT verificado
            const { receiverId, content } = req.body; // ou `data` vindo do socket

    
            if (!senderId || !receiverId || !content) {
                return res.status(400).send("Todos os campos são obrigatórios.");
            }

            // 🔐 Criptografar conteúdo
            const encryptedContent = encrypt(content);
    
            // Salvar mensagem no banco de dados
            const message = new Message({
                sender: senderId,
                receiver: receiverId,
                content: encryptedContent,
              });
            await message.save();
    
            // Emitir mensagem para o destinatário (precisa estar em sala: io.to(receiverId))
            this.io.to(receiverId).emit("receiveMessage", {
                ...message.toObject(),
                content, // envia o conteúdo original descriptografado para o frontend
            });
    
            res.status(201).json({
                message: "Mensagem enviada com sucesso.",
                message: { ...message.toObject(), content },
            });

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            res.status(500).send("Erro ao enviar mensagem.");
        }
    }

    async getMessages(req, res) {
        try {
            const { userId1, userId2 } = req.params;
    
            const messages = await Message.find({
                $or: [
                    { sender: userId1, receiver: userId2 },
                    { sender: userId2, receiver: userId1 },
                ],
            }).sort({ timestamp: 1 }); // Ordena por data crescente
    
            res.status(200).json(messages);
        } catch (error) {
            console.error("Erro ao recuperar mensagens:", error);
            res.status(500).send("Erro ao recuperar mensagens.");
        }
    }

    async getConversations(req, res) {
        try {
            const { userId } = req.params;
    
            const conversations = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { sender: mongoose.Types.ObjectId(userId) },
                            { receiver: mongoose.Types.ObjectId(userId) }
                        ]
                    }
                },
                {
                    $group: {
                        _id: { 
                            $cond: [
                                { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
                                "$receiver",
                                "$sender"
                            ]
                        },
                        lastMessage: { $last: "$content" },
                        timestamp: { $last: "$timestamp" }
                    }
                }
            ]);
    
            res.status(200).json(conversations);
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro ao buscar conversas.");
        }
    }
    
}

module.exports = ChatController;
