"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';

import { Card, Menu } from "../components";

const Feed = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null); // Pet selecionado

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await api.get('/pet/');
                setPets(response.data);
            } catch (error) {
                console.error("Erro ao buscar pets:", error);
                alert("Erro ao carregar os dados dos pets.");
            }
        };

    fetchPets();
  }, []);

  return (
    <div id="Home" className="w-screen h-screen flex flex-row justify-center items-center">
      <Menu />

      <div id="main-container" className="flex-grow h-full w-3/4 flex">
        <div className="flex flex-col justify-start items-start py-5 px-3 gap-5 w-full">
          {/* Mensagem de boas-vindas */}
          <div id="mensage" className="flex flex-col justify-start items-start px-2 gap-0">
            <p className="text-2xl font-medium text-left text-[#4d87fc]">
              Ache seu parceiro!
            </p>
            <div className="flex flex-row justify-start items-start gap-2">
              <p className="text-sm font-medium text-left">
                <span className="text-sm font-medium text-left text-black">Resultado para </span>
                <span className="text-sm font-medium text-left text-[#ffa2df]">{pets.length}</span>
                <span className="text-sm font-medium text-left text-black"> animais</span>
              </p>
            </div>
          </div>

          {/* Bloco de Filtros */}
          <div className="flex items-center gap-6 w-full">
            {/* Location Filter */}
            <div className="relative w-[132px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[#646464]">Location</p>
              <img src="down-chevron.png" className="w-2 h-[9px] object-cover" />
            </div>

            {/* Filtro com ícone */}
            <div className="relative w-[114px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center justify-center gap-2">
              <img src="filter.png" className="w-[22px] h-[23px] object-cover" />
              <img src="down-chevron.png" className="w-2 h-[9px] object-cover" />
            </div>

            {/* Campo de busca (ou outro filtro) */}
            <div className="w-[300px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full h-full bg-transparent outline-none text-sm text-[#646464]"
              />
            </div>
          </div>

          {/* Grid de Cards */}
          <div
            id="cards-container"
            className={`grid ${
              selectedPet ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-3 lg:grid-cols-4"
            } gap-2 flex-grow transition-all duration-300 ${
              selectedPet ? "lg:w-auto" : "lg:w-full"
            }`}
          >
            {pets.map((pet) => (
              <Card
                key={pet._id}
                profilePhoto={pet.imgAnimal?.[0]?.url || "placeholder.jpg"}
                name={pet.name}
                location={pet.location || "Localização não informada"}
                onClick={() => setSelectedPet(pet)}
              />
            ))}
          </div>
        </div>

        {/* Painel lateral com dados do pet */}
        {selectedPet && (
          <div
            id="details-panel"
            className={`w-1/3 bg-custom-gradient p-4 transition-transform duration-300 ${
              selectedPet ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button onClick={() => setSelectedPet(null)} className="absolute top-6 right-4">
              <img src="icons/Cancel.png" className="w-4 h-4 object-cover" />
            </button>
            <h2 className="text-2xl font-bold text-gray-700">{selectedPet.name}</h2>
            <p className="text-gray-700">Localização: {selectedPet.location}</p>
            <img
              src={selectedPet.imgAnimal?.[0]?.url || "placeholder.jpg"}
              alt={selectedPet.name}
              className="w-full h-64 object-cover rounded-lg mt-4"
            />
            <p className="text-gray-700 mt-4">{selectedPet.description}</p>
            <p className="text-gray-700">Idade: {selectedPet.age}</p>
            <p className="text-gray-700">Raça: {selectedPet.race}</p>
            <p className="text-gray-700">Espécie: {selectedPet.specie}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
