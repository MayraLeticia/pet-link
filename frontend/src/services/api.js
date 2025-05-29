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
      // Salvar token e dados completos do usuário no localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.id);
      localStorage.setItem("user", JSON.stringify(response.data)); // ✅ ADICIONAR DADOS COMPLETOS

      // Salvar o nome do usuário se disponível
      if (response.data.username) {
        localStorage.setItem("userName", response.data.username);
      }

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


// Buscar favoritos de um pet
export const getFavorites = async (petId) => {
  try {
    console.log("🔍 Buscando favoritos para petId:", petId);
    
    const response = await api.get(`/favorites/${petId}`);
    
    console.log("✅ Favoritos encontrados:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar favoritos:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log("📝 Pet não tem favoritos ainda - retornando array vazio");
      return []; // Retorna array vazio se não encontrar favoritos
    }
    
    throw error;
  }
};

// Adicionar pet aos favoritos
export const addFavorite = async (petId, favoritePetId) => {
  try {
    console.log("💖 Adicionando aos favoritos:", { petId, favoritePetId });
    
    const response = await api.post(`/favorites/${petId}/${favoritePetId}`);
    
    console.log("✅ Favorito adicionado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao adicionar favorito:", error.response?.data || error.message);
    throw error;
  }
};

// Remover pet dos favoritos
export const removeFavorite = async (petId, favoritePetId) => {
  try {
    console.log("💔 Removendo dos favoritos:", { petId, favoritePetId });
    
    const response = await api.delete(`/favorites/${petId}/${favoritePetId}`);
    
    console.log("✅ Favorito removido:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao remover favorito:", error.response?.data || error.message);
    throw error;
  }
};

// Verificar se um pet é favorito
export const checkFavorite = async (petId, favoritePetId) => {
  try {
    const response = await api.get(`/favorites/${petId}/check/${favoritePetId}`);
    return response.data.isFavorite;
  } catch (error) {
    console.error("❌ Erro ao verificar favorito:", error.response?.data || error.message);
    return false;
  }
};

// ============================================
// FUNÇÕES EXISTENTES (mantidas)
// ============================================

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


// Função para obter pets próximos
export const getNearbyPets = async (latitude, longitude, radius = 1000) => {
  try {
    const response = await api.get(`/location/nearby`, {
      params: {
        lat: latitude,
        lng: longitude,
        radius: radius // radius em metros (1000 = 1km)
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar pets próximos:", error.response?.data || error.message);
    throw error;
  }
};

// Função para atualizar localização do pet
export const updatePetLocation = async (petId, latitude, longitude) => {
  try {
    const response = await api.post(`/location/location`, {
      petId,
      latitude,
      longitude
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar localização do pet:", error.response?.data || error.message);
    throw error;
  }
};

export default api;
