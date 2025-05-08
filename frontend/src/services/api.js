// frontend/src/services/api.js

import axios from 'axios';

console.log("Base URL:", process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Função para login do usuário
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/user/login", { email, password });

    // Salvar token e ID do usuário no localStorage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.id);

    return response.data; // Retorna os dados do usuário autenticado
  } catch (error) {
    console.error("Erro no login:", error.response?.data || error.message);
    throw error; // Lança o erro para ser tratado no componente que chamar essa função
  }
};

// Função para cadastrar um pet
export const cadastrarPet = async (petData) => {
  try {
    const token = localStorage.getItem("token"); // Obtém o token do usuário logado

    const response = await api.post("/pet/", petData, {
      headers: {
        Authorization: `Bearer ${token}`, // Enviar token no cabeçalho da requisição
        "Content-Type": "multipart/form-data", // Indica que estamos enviando arquivos
      },
    });

    return response.data; // Retorna os dados do pet cadastrado
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error.response?.data || error.message);
    throw error;
  }
};

// Buscar conversas do usuário
export const getConversations = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/messages/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Buscar mensagens entre dois usuários
export const getMessages = async (contactId) => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/messages/${contactId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Buscar informações de um usuário por ID
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error.response?.data);
    throw error;
  }
};

export default api;
