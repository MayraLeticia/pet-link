"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../services/api";
import { addFavorite, removeFavorite } from "../services/api";
import { usePetContext } from "../contexts/PetContext";

import { Card, Menu } from "../components";

const Home = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetForDetails, setSelectedPetForDetails] = useState(null);
  const [user, setUser] = useState(null);

  // Usar o contexto para obter o pet selecionado no menu
  const { selectedPet: selectedPetFromMenu } = usePetContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(10); // Valor padrão: 10km
  const [radiusFilterActive, setRadiusFilterActive] = useState(false); // Controla se o filtro de raio está ativo
  const [userLocation, setUserLocation] = useState(null); // Localização do usuário

  // Estados para o popup de filtro
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({
    gender: "", // "male" ou "female"
    ageMin: 0,
    ageMax: 20,
    species: "", // "dog", "cat", etc.
    breed: ""
  });

  // Listas de opções para seleção
  const speciesList = ["Cachorro", "Gato", "Ave", "Roedor", "Réptil", "Outro"];

  // Listas de raças por espécie
  const breedsBySpecies = {
    "Cachorro": ["Labrador", "Poodle", "Bulldog", "Pastor Alemão", "Golden Retriever", "Pinscher", "Pitbull", "Shih Tzu", "Yorkshire", "Outro"],
    "Gato": ["Siamês", "Persa", "Maine Coon", "Angorá", "Sphynx", "Bengal", "Ragdoll", "Outro"],
    "Ave": ["Canário", "Periquito", "Calopsita", "Papagaio", "Outro"],
    "Roedor": ["Hamster", "Coelho", "Porquinho da Índia", "Chinchila", "Outro"],
    "Réptil": ["Tartaruga", "Iguana", "Gecko", "Outro"],
    "Outro": ["Outro"]
  };

  // Função para calcular distância entre duas coordenadas (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const filteredPets = pets.filter((pet) => {
    // Excluir o pet selecionado no menu (o próprio pet do usuário)
    const isNotOwnPet = !selectedPetFromMenu || pet._id !== selectedPetFromMenu._id;

    // Filtro por termo de busca
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por gênero
    const matchesGender = !filters.gender || pet.gender === filters.gender;

    // Filtro por idade
    const age = pet.age ? parseInt(pet.age) : 0;
    const matchesAge = age >= filters.ageMin && age <= filters.ageMax;

    // Filtro por espécie
    const matchesSpecies = !filters.species ||
      (pet.specie && pet.specie.toLowerCase() === filters.species.toLowerCase());

    // Filtro por raça
    const matchesBreed = !filters.breed ||
      (pet.race && pet.race.toLowerCase() === filters.breed.toLowerCase());

    // Filtro por raio (apenas se estiver ativo)
    let matchesRadius = true;
    if (radiusFilterActive && userLocation && pet.coordinates && pet.coordinates.coordinates) {
      const [petLng, petLat] = pet.coordinates.coordinates;
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        petLat,
        petLng
      );
      matchesRadius = distance <= selectedRadius;
    }

    return isNotOwnPet && matchesSearch && matchesGender && matchesAge && matchesSpecies && matchesBreed && matchesRadius;
  });

  // Função para extrair o ID do pet do usuário
  const extractPetId = (userData) => {
    if (!userData) return null;

    // Se o usuário tem pets cadastrados
    if (userData.yourAnimal && userData.yourAnimal.length > 0) {
      return userData.yourAnimal[0]; // Pega o primeiro pet
    }

    // Se selectedPetFromMenu está disponível
    if (selectedPetFromMenu && selectedPetFromMenu._id) {
      return selectedPetFromMenu._id;
    }

    return null;
  };

  // Função para obter localização do usuário
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  };

  // Função para aplicar filtro de raio
  const applyRadiusFilter = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setRadiusFilterActive(true);
      setShowRadiusMenu(false);
      console.log('📍 Filtro de raio aplicado:', { location, radius: selectedRadius });
    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);
      alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
    }
  };

  // Função para remover filtro de raio
  const removeRadiusFilter = () => {
    setRadiusFilterActive(false);
    setUserLocation(null);
    console.log('📍 Filtro de raio removido');
  };

  // Função para adicionar/remover favoritos
  const toggleFavorite = async (targetPetId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const petId = extractPetId(userData);

      if (!petId) {
        alert('Você precisa ter um pet cadastrado para favoritar outros pets');
        return;
      }

      const validPetId = String(petId);
      console.log('🔄 Alterando favorito:', { petId: validPetId, targetPetId });

      // Por enquanto, sempre adiciona aos favoritos
      // Em uma implementação mais completa, você verificaria se já é favorito
      await addFavorite(validPetId, targetPetId);
      alert('Pet adicionado aos favoritos!');

    } catch (error) {
      console.error("❌ Erro ao alterar favorito:", error);
      alert(`Erro ao alterar favorito: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await api.get("/pet/");
        setPets(response.data);
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
        alert("Erro ao carregar os dados dos pets.");
      }
    };

    fetchPets();
  }, []);

  // Carregar dados do usuário
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
          {/* Mensagem de boas-vindas */}
          <div
            id="mensage"
            className="flex flex-col justify-start items-start px-2 gap-0"
          >
            <p className="text-2xl font-medium text-left text-[#4d87fc]">
              Ache seu parceiro!
            </p>
            <div className="flex flex-row justify-start items-start gap-2">
              <p className="text-sm font-medium text-left">
                <span className="text-black">Resultado para </span>
                <span className="text-[#ffa2df]">{filteredPets.length}</span>
                <span className="text-black"> animais</span>
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-6 w-full">
            <div className="relative location-dropdown">
              <div
                className={`w-[132px] h-[50px] border rounded-[50px] px-4 flex items-center justify-between cursor-pointer ${
                  radiusFilterActive
                    ? 'border-[#4d87fc] bg-[#4d87fc]/10'
                    : 'border-[#646464]'
                }`}
                onClick={() => setShowRadiusMenu(!showRadiusMenu)}
              >
                <p className={`text-sm font-medium ${
                  radiusFilterActive ? 'text-[#4d87fc]' : 'text-[#646464]'
                }`}>
                  {radiusFilterActive ? `${selectedRadius}km` : 'Location'}
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={radiusFilterActive ? 'text-[#4d87fc]' : 'text-[#646464]'}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {showRadiusMenu && (
                <div className="absolute top-[55px] left-0 w-[220px] bg-white shadow-lg rounded-lg p-4 z-10 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Selecione o raio:</p>
                  <div className="mb-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={selectedRadius}
                      onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4d87fc]"
                      style={{
                        background: `linear-gradient(to right, #4d87fc ${(selectedRadius/10)*100}%, #e5e7eb ${(selectedRadius/10)*100}%)`,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">1km</span>
                      <span className="text-sm font-medium text-[#4d87fc]">{selectedRadius}km</span>
                      <span className="text-xs text-gray-500">10km</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {radiusFilterActive && (
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full"
                        onClick={removeRadiusFilter}
                      >
                        Remover Filtro
                      </button>
                    )}
                    <button
                      className="px-3 py-1 bg-[#4d87fc] text-white text-sm font-medium rounded-full ml-auto"
                      onClick={applyRadiusFilter}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative filter-dropdown">
              <div
                className="w-[114px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#646464]">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#646464]">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {showFilterMenu && (
                <div className="absolute top-[55px] left-0 w-[280px] bg-white shadow-lg rounded-lg p-4 z-10 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Filtrar por:</p>

                  {/* Filtro por gênero */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Gênero:</p>
                    <div className="flex gap-3">
                      <button
                        className={`px-3 py-1 rounded-full text-sm ${
                          filters.gender === 'male'
                            ? 'bg-[#4d87fc] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => setFilters({...filters, gender: filters.gender === 'male' ? '' : 'male'})}
                      >
                        Macho
                      </button>
                      <button
                        className={`px-3 py-1 rounded-full text-sm ${
                          filters.gender === 'female'
                            ? 'bg-[#ffa2df] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => setFilters({...filters, gender: filters.gender === 'female' ? '' : 'female'})}
                      >
                        Fêmea
                      </button>
                    </div>
                  </div>

                  {/* Filtro por idade */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Idade (anos):</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={filters.ageMax}
                        value={filters.ageMin}
                        onChange={(e) => setFilters({...filters, ageMin: parseInt(e.target.value) || 0})}
                        className="w-16 h-8 border border-gray-300 rounded px-2 text-sm"
                      />
                      <span className="text-xs text-gray-500">até</span>
                      <input
                        type="number"
                        min={filters.ageMin}
                        max="20"
                        value={filters.ageMax}
                        onChange={(e) => setFilters({...filters, ageMax: parseInt(e.target.value) || 0})}
                        className="w-16 h-8 border border-gray-300 rounded px-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Filtro por espécie */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Espécie:</p>
                    <div className="flex flex-wrap gap-2">
                      {speciesList.map((species) => (
                        <button
                          key={species}
                          className={`px-3 py-1 rounded-full text-xs ${
                            filters.species === species
                              ? 'bg-[#4d87fc] text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          onClick={() => {
                            // Se clicar na mesma espécie, limpa a seleção
                            if (filters.species === species) {
                              setFilters({...filters, species: '', breed: ''});
                            } else {
                              // Ao mudar de espécie, limpa a raça selecionada
                              setFilters({...filters, species: species, breed: ''});
                            }
                          }}
                        >
                          {species}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por raça */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Raça:</p>
                    {filters.species ? (
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {breedsBySpecies[filters.species].map((breed) => (
                          <button
                            key={breed}
                            className={`px-3 py-1 rounded-full text-xs ${
                              filters.breed === breed
                                ? 'bg-[#4d87fc] text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => {
                              // Se clicar na mesma raça, limpa a seleção
                              if (filters.breed === breed) {
                                setFilters({...filters, breed: ''});
                              } else {
                                setFilters({...filters, breed: breed});
                              }
                            }}
                          >
                            {breed}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Selecione uma espécie primeiro</p>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-between">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full"
                      onClick={() => {
                        setFilters({
                          gender: "",
                          ageMin: 0,
                          ageMax: 20,
                          species: "",
                          breed: ""
                        });
                      }}
                    >
                      Limpar
                    </button>
                    <button
                      className="px-3 py-1 bg-[#4d87fc] text-white text-sm font-medium rounded-full"
                      onClick={() => setShowFilterMenu(false)}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

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
            {filteredPets.map((pet) => (
              <div
                key={pet._id}
                onClick={() => setSelectedPetForDetails(pet)}
                className="relative w-full max-w-[260px] aspect-[4/5] rounded-[15px] bg-gradient-to-br from-pink-200 to-purple-200 p-4 shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pet._id);
                    }}
                    className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm hover:bg-[#00000077] transition duration-200"
                    title="Adicionar aos favoritos"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Não interessar em:', pet.name);
                    }}
                    className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm hover:bg-[#00000077] transition duration-200"
                    title="Não tenho interesse"
                  >
                    👎
                  </button>
                </div>

                <img
                  src={"https://uploadpetlink.s3.us-east-1.amazonaws.com/"+ pet.imgAnimal[0] || "placeholder.jpg"}
                  alt={pet.name}
                  className="w-full h-[140px] object-cover rounded-md mb-2"
                />

                <div className="flex flex-col gap-1 mt-auto">
                  <p className="font-bold">{pet.name}</p>
                  <p className="text-sm text-gray-600">
                    {pet.location || "Localização não informada"}
                  </p>
                </div>

                <div className="absolute bottom-2 right-2">
                  <button className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm">
                    💬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel lateral com detalhes do pet */}
        {selectedPetForDetails && (
          <div
            id="details-panel"
            className={`w-1/3 bg-custom-gradient p-4 transition-transform duration-300 ${
              selectedPetForDetails ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => setSelectedPetForDetails(null)}
              className="absolute top-6 right-4"
            >
              <img src="icons/Cancel.png" className="w-4 h-4 object-cover" />
            </button>
            <h2 className="text-2xl font-bold text-gray-700">
              {selectedPetForDetails.name}
            </h2>
            <p className="text-gray-700">
              Localização: {selectedPetForDetails.location}
            </p>
            <img
              src={"https://uploadpetlink.s3.us-east-1.amazonaws.com/"+ selectedPetForDetails.imgAnimal[0] || "placeholder.jpg"}
              alt={selectedPetForDetails.name}
              className="w-full h-64 object-cover rounded-lg mt-4"
            />
            <p className="text-gray-700 mt-4">{selectedPetForDetails.description}</p>
            <p className="text-gray-700">Idade: {selectedPetForDetails.age}</p>
            <p className="text-gray-700">Raça: {selectedPetForDetails.race}</p>
            <p className="text-gray-700">Espécie: {selectedPetForDetails.specie}</p>

            {/* Botão "Não tenho interesse" */}
            <button
              onClick={() => setSelectedPetForDetails(null)}
              className="mt-4 px-4 py-2 bg-[#ff6b81] hover:bg-[#ff4c64] text-white text-sm font-medium rounded-full shadow-md transition duration-200"
            >
              Não tenho interesse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
