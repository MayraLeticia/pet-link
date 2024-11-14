const Message = require('../models/messageSchema');
const User = require('../models/userSchema');

class ChatController {
    async sendMessage(req, res) {
        try {
            const { senderId, receiverId, content } = req.body;
            if (!senderId || !receiverId || !content) {
                return res.status(400).send("Todos os campos são obrigatórios.");
            }

            const message = new Message({ sender: senderId, receiver: receiverId, content });
            await message.save();

            res.status(201).json({ message: "Mensagem enviada com sucesso.", message });
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro ao enviar mensagem.");
        }
    }

    async getMessages(req, res) {
        try {
            const { userId1, userId2 } = req.params;

            const messages = await Message.find({
                $or: [
                    { sender: userId1, receiver: userId2 },
                    { sender: userId2, receiver: userId1 }
                ]
            }).sort({ timestamp: 1 }); // Ordena por data

            res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro ao recuperar mensagens.");
        }
    }
}

module.exports = new ChatController();
