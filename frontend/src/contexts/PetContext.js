"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const PetContext = createContext();

export const usePetContext = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePetContext deve ser usado dentro de um PetProvider');
  }
  return context;
};

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função para buscar pets do usuário logado
  const fetchUserPets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        console.error('Token ou userId não encontrado');
        return;
      }

      // Buscar pets do usuário específico
      const response = await api.get(`/pet/?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setPets(response.data);
      
      // Se não há pet selecionado e há pets disponíveis, selecionar o primeiro
      if (!selectedPet && response.data.length > 0) {
        setSelectedPet(response.data[0]);
      }
      
      // Se o pet selecionado não está mais na lista, limpar seleção
      if (selectedPet && !response.data.find(pet => pet._id === selectedPet._id)) {
        setSelectedPet(response.data.length > 0 ? response.data[0] : null);
      }

    } catch (error) {
      console.error("Erro ao buscar pets do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para selecionar um pet
  const selectPet = (pet) => {
    setSelectedPet(pet);
    // Salvar no localStorage para persistir entre páginas
    if (pet) {
      localStorage.setItem('selectedPetId', pet._id);
    } else {
      localStorage.removeItem('selectedPetId');
    }
  };

  // Função para adicionar um novo pet à lista
  const addPet = (newPet) => {
    setPets(prevPets => [...prevPets, newPet]);
    // Se não há pet selecionado, selecionar o novo pet
    if (!selectedPet) {
      selectPet(newPet);
    }
  };

  // Função para atualizar um pet existente
  const updatePet = (updatedPet) => {
    setPets(prevPets => 
      prevPets.map(pet => 
        pet._id === updatedPet._id ? updatedPet : pet
      )
    );
    
    // Se o pet atualizado é o selecionado, atualizar também
    if (selectedPet && selectedPet._id === updatedPet._id) {
      setSelectedPet(updatedPet);
    }
  };

  // Função para remover um pet da lista
  const removePet = (petId) => {
    setPets(prevPets => prevPets.filter(pet => pet._id !== petId));
    
    // Se o pet removido era o selecionado, selecionar outro ou limpar
    if (selectedPet && selectedPet._id === petId) {
      const remainingPets = pets.filter(pet => pet._id !== petId);
      setSelectedPet(remainingPets.length > 0 ? remainingPets[0] : null);
    }
  };

  // Carregar pets quando o componente é montado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserPets();
    }
  }, []);

  // Restaurar pet selecionado do localStorage
  useEffect(() => {
    const savedPetId = localStorage.getItem('selectedPetId');
    if (savedPetId && pets.length > 0) {
      const savedPet = pets.find(pet => pet._id === savedPetId);
      if (savedPet) {
        setSelectedPet(savedPet);
      }
    }
  }, [pets]);

  const value = {
    pets,
    selectedPet,
    loading,
    fetchUserPets,
    selectPet,
    addPet,
    updatePet,
    removePet
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
};
