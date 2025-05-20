// Este é um arquivo de API para criar uma conversa de teste
// Ele simula uma conversa entre o usuário atual e um usuário de teste

import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  // Não verificar autenticação para facilitar o teste
  // Comentado para permitir o teste sem autenticação
  // if (!session && !req.headers.authorization) {
  //   return res.status(401).json({ error: "Não autorizado" });
  // }

  // Dados do usuário de teste
  const testUser = {
    _id: "test-user-123",
    username: "Usuário de Teste",
    email: "teste@exemplo.com",
  };

  // Mensagens de teste
  const testMessages = [
    {
      _id: "msg1",
      sender: "test-user-123",
      receiver: session?.user?.id || "current-user",
      content: "Olá! Sou um usuário de teste para verificar se o chat está funcionando.",
      timestamp: new Date().toISOString(),
    },
    {
      _id: "msg2",
      sender: "test-user-123",
      receiver: session?.user?.id || "current-user",
      content: "Como posso ajudar você hoje?",
      timestamp: new Date(Date.now() + 1000).toISOString(),
    },
    {
      _id: "msg3",
      sender: session?.user?.id || "current-user",
      receiver: "test-user-123",
      content: "Olá! Estou testando o chat.",
      timestamp: new Date(Date.now() + 2000).toISOString(),
    },
  ];

  // Conversa de teste
  const testConversation = {
    _id: "test-user-123",
    lastMessageAt: new Date().toISOString(),
  };

  // Retornar os dados de teste
  return res.status(200).json({
    user: testUser,
    messages: testMessages,
    conversation: testConversation,
  });
}
