// ✅ FIXED VERSION - Key changes highlighted with comments

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { getFavorites, addFavorite, removeFavorite } from "../services/api";

import { Card, Menu } from "../components";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para o popup de filtro
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    ageMin: 0,
    ageMax: 20,
    species: "",
    breed: ""
  });

  // Listas de opções para seleção
  const speciesList = ["Cachorro", "Gato", "Ave", "Roedor", "Réptil", "Outro"];

  const breedsBySpecies = {
    "Cachorro": ["Labrador", "Poodle", "Bulldog", "Pastor Alemão", "Golden Retriever", "Pinscher", "Pitbull", "Shih Tzu", "Yorkshire", "Outro"],
    "Gato": ["Siamês", "Persa", "Maine Coon", "Angorá", "Sphynx", "Bengal", "Ragdoll", "Outro"],
    "Ave": ["Canário", "Periquito", "Calopsita", "Papagaio", "Outro"],
    "Roedor": ["Hamster", "Coelho", "Porquinho da Índia", "Chinchila", "Outro"],
    "Réptil": ["Tartaruga", "Iguana", "Gecko", "Outro"],
    "Outro": ["Outro"]
  };

  // ✅ FIXED: Handle the API response structure correctly
  const getPetsArray = () => {
    if (!pets || pets.length === 0) return [];
    
    console.log('🔍 Estrutura dos pets recebidos:', pets);
    
    // ✅ NEW: Handle the specific API response structure
    // The API returns an object with a "favoritos" array property
    if (pets[0] && pets[0].favoritos && Array.isArray(pets[0].favoritos)) {
      console.log('✅ Usando pets[0].favoritos:', pets[0].favoritos);
      return pets[0].favoritos;
    }
    
    // If pets is already an array of pet objects
    if (pets[0] && pets[0].name) {
      console.log('✅ Usando pets diretamente:', pets);
      return pets;
    }
    
    // If pets contains a favorites array (alternative structure)
    if (pets[0] && pets[0].favorites && Array.isArray(pets[0].favorites)) {
      console.log('✅ Usando pets[0].favorites:', pets[0].favorites);
      return pets[0].favorites;
    }
    
    // If pets is the favorites array itself
    if (Array.isArray(pets)) {
      console.log('✅ Usando pets como array:', pets);
      return pets;
    }
    
    console.log('❌ Estrutura não reconhecida:', pets);
    return [];
  };

  const petsArray = getPetsArray();

  // ✅ FIXED: More robust filtering with better debugging
  const filteredPets = petsArray.filter((pet) => {
    if (!pet || !pet.name) {
      console.log('❌ Pet inválido:', pet);
      return false;
    }
    
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !filters.gender || pet.gender === filters.gender;
    const age = pet.age ? parseInt(pet.age) : 0;
    const matchesAge = age >= filters.ageMin && age <= filters.ageMax;
    const matchesSpecies = !filters.species ||
      (pet.specie && pet.specie.toLowerCase() === filters.species.toLowerCase());
    const matchesBreed = !filters.breed ||
      (pet.race && pet.race.toLowerCase() === filters.breed.toLowerCase());

    // ✅ DEBUG: Log filter results for each pet
    console.log(`🔍 Filtros para ${pet.name}:`, {
      searchTerm: searchTerm,
      matchesSearch,
      petGender: pet.gender,
      filterGender: filters.gender,
      matchesGender,
      petAge: age,
      ageRange: `${filters.ageMin}-${filters.ageMax}`,
      matchesAge,
      petSpecies: pet.specie,
      filterSpecies: filters.species,
      matchesSpecies,
      petBreed: pet.race,
      filterBreed: filters.breed,
      matchesBreed,
      finalResult: matchesSearch && matchesGender && matchesAge && matchesSpecies && matchesBreed
    });

    return matchesSearch && matchesGender && matchesAge && matchesSpecies && matchesBreed;
  });

  // ✅ IMPROVED: Function to extract valid pet ID from user data
  const extractPetId = (userData) => {
    if (!userData) return null;

    // Method 1: Check if pets array contains direct IDs
    if (userData.pets && Array.isArray(userData.pets)) {
      // If pets contains strings/IDs directly
      const firstPet = userData.pets[0];
      if (typeof firstPet === 'string' && firstPet.length > 0) {
        return firstPet;
      }
      // If pets contains objects with _id property
      if (typeof firstPet === 'object' && firstPet._id) {
        return firstPet._id;
      }
      // If pets contains objects with id property
      if (typeof firstPet === 'object' && firstPet.id) {
        return firstPet.id;
      }
    }

    // Method 2: Check yourAnimal array (fallback)
    if (userData.yourAnimal && Array.isArray(userData.yourAnimal)) {
      const firstAnimal = userData.yourAnimal[0];
      if (typeof firstAnimal === 'string' && firstAnimal.length > 0) {
        return firstAnimal;
      }
      if (typeof firstAnimal === 'object' && firstAnimal._id) {
        return firstAnimal._id;
      }
      if (typeof firstAnimal === 'object' && firstAnimal.id) {
        return firstAnimal.id;
      }
    }

    // Method 3: Use user's own ID as fallback
    return userData._id || userData.id || null;
  };

  // Carregar usuário do localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ Usuário carregado:', parsedUser);
        console.log('✅ Pet ID extraído:', extractPetId(parsedUser));
      } catch (error) {
        console.error('❌ Erro ao parsear dados do usuário:', error);
        setError('Dados de usuário corrompidos');
      }
    } else {
      console.log('❌ Nenhum usuário encontrado no localStorage');
      setError('Usuário não encontrado');
    }
  }, []);

  // ✅ IMPROVED: Fetch favorites with better error handling
  const fetchFavorites = useCallback(async (showLoading = true) => {
    if (!user) {
      console.log('⏳ Aguardando usuário ser carregado...');
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const petId = extractPetId(user);
      
      if (!petId) {
        console.error('❌ Não foi possível extrair Pet ID válido');
        console.log('👤 Estrutura do usuário:', {
          pets: user.pets,
          yourAnimal: user.yourAnimal,
          id: user.id || user._id,
          fullUser: user
        });
        setPets([]);
        setError('Não foi possível identificar o pet do usuário');
        return;
      }

      // ✅ FIXED: Ensure petId is a string and validate format
      const validPetId = String(petId);
      console.log('🔍 Buscando favoritos para petId:', validPetId);
      console.log('🌐 URL da requisição:', `${process.env.NEXT_PUBLIC_API_URL}/favorites/${validPetId}`);

      const favoritesData = await getFavorites(validPetId);
      
      // ✅ FIXED: Handle the specific API response structure
      let processedFavorites = [];
      
      console.log('🔍 Resposta da API getFavorites:', favoritesData);
      
      if (Array.isArray(favoritesData)) {
        // If response is direct array of pets
        processedFavorites = favoritesData;
        console.log('✅ Processando como array direto');
      } else if (favoritesData && favoritesData.favoritos && Array.isArray(favoritesData.favoritos)) {
        // If response has "favoritos" property (your case)
        processedFavorites = favoritesData.favoritos;
        console.log('✅ Processando favoritos array:', favoritesData.favoritos);
      } else if (favoritesData && favoritesData.favorites && Array.isArray(favoritesData.favorites)) {
        // If response has "favorites" property
        processedFavorites = favoritesData.favorites;
        console.log('✅ Processando favorites array');
      } else if (favoritesData && typeof favoritesData === 'object') {
        // If response is a single object, wrap in array
        processedFavorites = [favoritesData];
        console.log('✅ Processando objeto único');
      }
      
      setPets([favoritesData]); // ✅ Store the full response to maintain structure
      
      console.log('✅ Favoritos processados:', processedFavorites.length);
      console.log('🔍 Primeiro favorito:', processedFavorites[0]);
      
    } catch (error) {
      console.error("❌ Erro ao buscar favoritos:", error);
      
      // ✅ IMPROVED: Better error messages based on error type
      let errorMessage = 'Erro desconhecido ao carregar favoritos';
      
      if (error.message?.includes('400')) {
        errorMessage = 'Pet ID inválido - verifique os dados do usuário';
      } else if (error.message?.includes('404')) {
        errorMessage = 'Endpoint de favoritos não encontrado';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Erro interno do servidor';
      } else {
        errorMessage = `Erro ao carregar favoritos: ${error.message}`;
      }
      
      setError(errorMessage);
      setPets([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user]);

  // Buscar favoritos quando o usuário estiver carregado
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  // ✅ IMPROVED: Toggle favorite with better error handling
  const toggleFavorite = async (targetPetId) => {
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    try {
      const petId = extractPetId(user);
      
      if (!petId) {
        console.log('❌ Usuário não tem pet cadastrado para favoritar');
        setError('Não foi possível identificar seu pet');
        return;
      }
      
      const validPetId = String(petId);
      const isFavorite = petsArray.some(pet => pet._id === targetPetId);
      
      console.log('🔄 Alterando favorito:', { petId: validPetId, targetPetId, isFavorite });
      
      if (isFavorite) {
        await removeFavorite(validPetId, targetPetId);
        // Update the pets state by removing the unfavorited pet
        const currentPetsArray = getPetsArray();
        const updatedPets = currentPetsArray.filter(pet => pet._id !== targetPetId);
        setPets(updatedPets);
        console.log('✅ Removido dos favoritos:', targetPetId);
      } else {
        await addFavorite(validPetId, targetPetId);
        await fetchFavorites(false);
        console.log('✅ Adicionado aos favoritos:', targetPetId);
      }
    } catch (error) {
      console.error("❌ Erro ao alterar favorito:", error);
      setError(`Erro ao alterar favorito: ${error.message}`);
    }
  };

  // ✅ IMPROVED: API test function
  const testAPI = async () => {
    if (!user) {
      console.log('❌ Usuário não encontrado para testar');
      return;
    }

    try {
      const petId = extractPetId(user);
      
      if (!petId) {
        console.log('❌ Usuário não tem pet para testar');
        return;
      }

      const validPetId = String(petId);
      console.log('🧪 Testando API de favoritos...');
      console.log('🔗 Pet ID usado para teste:', validPetId);
      console.log('🌐 URL de teste:', `${process.env.NEXT_PUBLIC_API_URL}/favorites/${validPetId}`);
      
      const favorites = await getFavorites(validPetId);
      console.log('✅ Teste getFavorites:', favorites);
      
    } catch (error) {
      console.error('❌ Erro no teste da API:', error);
      console.log('📋 Detalhes do erro:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
    }
  };

  // ✅ IMPROVED: Debug info with better pet ID extraction
  const renderDebugInfo = () => {
    if (!user) return null;
    
    const petId = extractPetId(user);
    
    return (
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Info:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-700">
          <div><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Não configurado'}</div>
          <div><strong>Usuário:</strong> {user.username || user.email || 'N/A'}</div>
          <div><strong>pets array:</strong> {user.pets?.length || 0} items</div>
          <div><strong>yourAnimal array:</strong> {user.yourAnimal?.length || 0} items</div>
          <div><strong>Pet ID extraído:</strong> {petId ? String(petId) : 'N/A'}</div>
          <div><strong>Pet ID válido:</strong> {petId ? 'Sim' : 'Não'}</div>
          <div><strong>Favoritos carregados:</strong> {pets.length}</div>
          <div><strong>Pets processados:</strong> {petsArray.length}</div>
          <div><strong>Favoritos filtrados:</strong> {filteredPets.length}</div>
          <div><strong>Filtros ativos:</strong> {Object.entries(filters).filter(([key, value]) => value && value !== 0).map(([key, value]) => `${key}: ${value}`).join(', ') || 'Nenhum'}</div>
          <div><strong>Termo de busca:</strong> "{searchTerm}" {searchTerm ? '(ativo)' : '(vazio)'}</div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-yellow-300">
          <div className="text-xs text-yellow-600 mb-1">Estrutura detalhada:</div>
          <div className="bg-yellow-50 p-2 rounded text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
            <div><strong>pets[0]:</strong> {user.pets?.[0] ? JSON.stringify(user.pets[0], null, 2) : 'undefined'}</div>
            <div><strong>yourAnimal[0]:</strong> {user.yourAnimal?.[0] ? JSON.stringify(user.yourAnimal[0], null, 2) : 'undefined'}</div>
            <div><strong>user.id:</strong> {user.id || 'undefined'}</div>
            <div><strong>user._id:</strong> {user._id || 'undefined'}</div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button 
            onClick={testAPI}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
          >
            🧪 Testar API
          </button>
          <button 
            onClick={() => {
              console.log('👤 Dados completos do usuário:', user);
              console.log('🐾 Pets favoritos (raw):', pets);
              console.log('🐾 Pets processados:', petsArray);
              console.log('🔍 Pet ID extraído:', petId);
              console.log('🎯 Filtros ativos:', filters);
              console.log('🔎 Termo de busca:', searchTerm);
              console.log('✅ Pets filtrados:', filteredPets);
              console.log('🧩 Processo de extração:', {
                pets: user.pets,
                yourAnimal: user.yourAnimal,
                userId: user.id || user._id,
                extractedId: petId
              });
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            📋 Log Dados
          </button>
          <button 
            onClick={() => fetchFavorites()}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
          >
            🔄 Recarregar
          </button>
          <button 
            onClick={() => {
              setSearchTerm("");
              setFilters({
                gender: "",
                ageMin: 0,
                ageMax: 20,
                species: "",
                breed: ""
              });
              console.log('🧹 Filtros limpos!');
            }}
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
          >
            🧹 Limpar Filtros
          </button>
        </div>
      </div>
    );
  };

  // Rest of the component remains the same...
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
        <h3 className="font-bold text-red-800 mb-2">❌ Erro:</h3>
        <p className="text-red-700 text-sm">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Fechar
        </button>
      </div>
    );
  };

  // Fechar os menus quando clicar fora deles
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRadiusMenu && !event.target.closest('.location-dropdown')) {
        setShowRadiusMenu(false);
      }
      if (showFilterMenu && !event.target.closest('.filter-dropdown')) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRadiusMenu, showFilterMenu]);

  return (
    <div
      id="Home"
      className="w-screen h-screen flex flex-row justify-center items-center"
    >
      <Menu />

      <div id="main-container" className="flex-grow h-full w-3/4 flex">
        <div className="flex flex-col justify-start items-start py-5 px-3 gap-5 w-full">
          {/* Error Message */}
          {renderError()}
          
          {/* Mensagem de boas-vindas */}
          <div
            id="mensage"
            className="flex flex-col justify-start items-start px-2 gap-0"
          >
            <p className="text-2xl font-medium text-left text-[#4d87fc]">
              Seus Favoritos, {user?.username || 'Usuário'}!
            </p>
            <div className="flex flex-row justify-start items-start gap-2">
              <p className="text-sm font-medium text-left">
                <span className="text-black">Você tem </span>
                <span className="text-[#ffa2df]">{filteredPets.length}</span>
                <span className="text-black"> {filteredPets.length === 1 ? 'animal favorito' : 'animais favoritos'}</span>
              </p>
              {loading && (
                <span className="text-xs text-blue-500">Carregando...</span>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-6 w-full">
            <div className="w-[300px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center ml-auto">
              <input
                type="text"
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-sm text-[#646464]"
              />
              <button className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#646464]">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Grid de cards */}
          <div
            id="cards-container"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-[20px] gap-y-[20px] w-full max-w-[1280px] mx-auto"
          >
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4d87fc] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando favoritos...</p>
              </div>
            ) : filteredPets.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <p className="text-gray-500 text-lg mb-2">
                  {!user ? 'Carregando usuário...' : 
                   !extractPetId(user) ? 'Pet ID não encontrado' : 
                   petsArray.length === 0 ? 'Seu pet ainda não tem favoritos' : 'Nenhum favorito encontrado com os filtros aplicados'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {!user ? 'Aguarde...' : 
                   !extractPetId(user) ? 'Verifique os dados do usuário' : 
                   petsArray.length === 0 ? 'Favorite alguns pets para vê-los aqui!' : 'Tente ajustar os filtros de pesquisa'}
                </p>
                <p className="text-xs text-gray-400">
                  Verifique o debug acima para mais informações
                </p>
              </div>
            ) : (
              filteredPets.map((pet) => (
                <div
                  key={pet._id}
                  onClick={() => setSelectedPet(pet)}
                  className="relative w-full max-w-[260px] aspect-[4/5] rounded-[15px] bg-gradient-to-br from-pink-200 to-purple-200 p-4 shadow-md cursor-pointer flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Botões do topo - Favorito e Não interessar */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(pet._id);
                      }}
                      className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm hover:bg-[#00000077] transition duration-200"
                      title="Remover dos favoritos"
                    >
                      ❤️
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aqui você pode adicionar lógica para "não interessar"
                        console.log('Não interessar em:', pet.name);
                      }}
                      className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm hover:bg-[#00000077] transition duration-200"
                      title="Não tenho interesse"
                    >
                      👎
                    </button>
                  </div>

                  {/* Imagem do pet */}
                  <img
                    src={"https://uploadpetlink.s3.us-east-1.amazonaws.com/"+ pet.imgAnimal[0] || "placeholder.jpg"}
                    alt={pet.name}
                    className="w-full h-[140px] object-cover rounded-md mb-2"
                  />

                  {/* Informações do pet */}
                  <div className="flex flex-col gap-1 mt-auto">
                    <p className="font-bold truncate">{pet.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {pet.location || "Localização não informada"}
                    </p>
                  </div>

                  {/* Botão de chat no canto inferior direito */}
                  <div className="absolute bottom-2 right-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aqui você pode adicionar lógica para iniciar chat
                        console.log('Iniciar chat com:', pet.name);
                      }}
                      className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm hover:bg-[#00000077] transition duration-200"
                      title="Iniciar conversa"
                    >
                      💬
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel lateral com detalhes do pet */}
        {selectedPet && (
          <div
            id="details-panel"
            className={`w-1/3 bg-custom-gradient p-4 transition-transform duration-300 ${
              selectedPet ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => setSelectedPet(null)}
              className="absolute top-6 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition duration-200"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-700">
              {selectedPet.name}
            </h2>
            <p className="text-gray-700">
              Localização: {selectedPet.location || "Não informada"}
            </p>
            <img
              src={"https://uploadpetlink.s3.us-east-1.amazonaws.com/"+ selectedPet.imgAnimal[0] || "placeholder.jpg"}
              alt={selectedPet.name}
              className="w-full h-64 object-cover rounded-lg mt-4"
            />
            <p className="text-gray-700 mt-4">{selectedPet.description || "Sem descrição disponível"}</p>
            <p className="text-gray-700">Idade: {selectedPet.age || "Não informada"}</p>
            <p className="text-gray-700">Raça: {selectedPet.race || "Não informada"}</p>
            <p className="text-gray-700">Espécie: {selectedPet.specie || "Não informada"}</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => toggleFavorite(selectedPet._id)}
                className="flex-1 px-4 py-2 bg-[#ff6b81] hover:bg-[#ff4c64] text-white text-sm font-medium rounded-full shadow-md transition duration-200"
              >
                💔 Remover dos Favoritos
              </button>
              <button
                onClick={() => {
                  // Lógica para iniciar conversa
                  console.log('Iniciar conversa com:', selectedPet.name);
                }}
                className="flex-1 px-4 py-2 bg-[#4d87fc] hover:bg-[#3a75e8] text-white text-sm font-medium rounded-full shadow-md transition duration-200"
              >
                💬 Conversar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;  