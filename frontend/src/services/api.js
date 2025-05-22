// frontend/src/services/api.js

import axios from 'axios';

console.log("Base URL:", process.env.NEXT_PUBLIC_API_URL);

// Configurar o axios com a URL base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Configurar interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função para login do usuário
export const loginUser = async (email, password) => {
  try {
    console.log("Tentando fazer login com:", { email });
    const response = await api.post("/user/login", { email, password });
    console.log("Resposta do login:", response.data);

    if (typeof window !== 'undefined') {
      // Salvar token e ID do usuário no localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.id);

      // Adicionar o token ao cabeçalho padrão para todas as requisições futuras
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    console.log("Login bem-sucedido. ID do usuário:", response.data.id);
    return response.data; // Retorna os dados do usuário autenticado
  } catch (error) {
    console.error("Erro no login:", error.response?.data || error.message);
    throw error; // Lança o erro para ser tratado no componente que chamar essa função
  }
};

// Função para cadastrar um pet
export const cadastrarPet = async (petData) => {
  try {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem("token"); // Obtém o token do usuário logado
    }

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

// Função para excluir um pet
export const deletarPet = async (petId) => {
  try {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem("token");
    }

    const response = await api.delete(`/pet/${petId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao excluir pet:", error.response?.data || error.message);
    throw error;
  }
};

// Buscar conversas do usuário
export const getConversations = async () => {
  try {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem("token");
    }
    const response = await api.get(`/messages/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar conversas:", error.response?.data || error.message);
    return [];
  }
};

// Buscar mensagens entre dois usuários
export const getMessages = async (contactId) => {
  try {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem("token");
    }
    const response = await api.get(`/messages/${contactId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error.response?.data || error.message);
    return [];
  }
};

// Buscar informações de um usuário por ID
export const getUserById = async (userId) => {
  try {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem("token");
    }

    if (!userId) {
      console.error("ID de usuário não fornecido");
      return null;
    }

    const response = await api.get(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar usuário ${userId}:`, error.response?.data || error.message);
    // Retornar um objeto com informações básicas para não quebrar a interface
    return {
      _id: userId,
      username: "Usuário",
      email: "",
    };
  }
};

export default api;
