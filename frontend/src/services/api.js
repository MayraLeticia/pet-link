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

    // Salvar token, ID do usuário e pets no localStorage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.id);

    // Salvar os pets do usuário no localStorage para uso futuro
    if (response.data.pets && response.data.pets.length > 0) {
      localStorage.setItem("userPets", JSON.stringify(response.data.pets));
    }

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

// Função para obter pets próximos com base na localização
export const getNearbyPets = async (latitude, longitude, radius = 5) => {
  try {
    const response = await api.get(`/location/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar pets próximos:", error.response?.data || error.message);
    throw error;
  }
};

// Função para adicionar um pet aos favoritos
export const addFavorite = async (petId, favoritePetId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/favorites/add",
      { petId, favoritePetId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar pet aos favoritos:", error.response?.data || error.message);
    throw error;
  }
};

export default api;
