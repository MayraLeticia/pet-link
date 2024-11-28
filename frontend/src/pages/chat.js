import React, { useState } from 'react';
import { ChatList, ChatMessages } from '../components';

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null); // Usuário selecionado para conversar

    return (
        <div className="chat-screen">
            <div className="chat-list">
                <ChatList onSelectUser={setSelectedUser} />
            </div>
            <div className="chat-messages">
                {selectedUser ? (
                    <ChatMessages selectedUser={selectedUser} />
                ) : (
                    <p>Selecione um contato para iniciar uma conversa</p>
                )}
            </div>
        </div>
    );
};

export default Chat;
