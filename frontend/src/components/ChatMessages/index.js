import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChatMessages = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Substitua pela URL correta do seu backend
        api.get(`/messages/${selectedUser._id}/currentUserId`) // Remova "/api"
            .then((res) => setMessages(res.data))
            .catch((error) => console.error('Erro ao buscar mensagens:', error));
    }, [selectedUser]);

    const sendMessage = () => {
        const messageData = {
            senderId: 'currentUserId',
            receiverId: selectedUser._id,
            content: newMessage,
        };
        api.post('/send', messageData) // Remova "/api"
            .then((res) => {
                setMessages([...messages, res.data.message]);
                setNewMessage('');
            })
            .catch((error) => console.error('Erro ao enviar mensagem:', error));
    };

    return (
        <div>
            <div className="message-container">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`message ${
                            msg.sender === 'currentUserId' ? 'sent' : 'received'
                        }`}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default ChatMessages;
