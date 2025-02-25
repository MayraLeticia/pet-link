// import React, { useState, useEffect } from 'react';
// import api from '../../services/api';

// const ChatList = ({ onSelectUser }) => {
//     const [contacts, setContacts] = useState([]);

//     useEffect(() => {
//         // Substitua pela URL correta do seu backend
//         api.get('/users') // Atualize conforme necessário
//             .then((res) => setContacts(res.data))
//             .catch((error) => console.error('Erro ao buscar contatos:', error));
//     }, []);

//     return (
//         <div>
//             <h2>Seus Contatos</h2>
//             {contacts.map((contact) => (
//                 <div
//                     key={contact._id}
//                     onClick={() => onSelectUser(contact)}
//                     className="contact-item"
//                 >
//                     <img src={contact.avatar || 'default-avatar.jpg'} alt="Avatar" />
//                     <p>{contact.name}</p>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default ChatList;
