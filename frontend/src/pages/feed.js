"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../services/api";

import { Card, Menu } from "../components";

const Feed = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="relative w-[132px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[#646464]">Location</p>
              <img src="down-chevron.png" className="w-2 h-[9px] object-cover" />
            </div>

            <div className="relative w-[114px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center justify-center gap-2">
              <img src="filter.png" className="w-[22px] h-[23px] object-cover" />
              <img src="down-chevron.png" className="w-2 h-[9px] object-cover" />
            </div>

            <div className="w-[300px] h-[50px] border border-[#646464] rounded-[50px] px-4 flex items-center ml-auto">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-sm text-[#646464]"
              />
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
                onClick={() => setSelectedPet(pet)}
                className="relative w-full max-w-[260px] aspect-[4/5] rounded-[15px] bg-gradient-to-br from-pink-200 to-purple-200 p-4 shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div className="absolute top-2 right-2 flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm">
                    ❤️
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#00000055] flex items-center justify-center text-white text-sm">
                    👎
                  </button>
                </div>

                <img
                  src={pet.imgAnimal?.[0]?.url || "placeholder.jpg"}
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
        {selectedPet && (
          <div
            id="details-panel"
            className={`w-1/3 bg-custom-gradient p-4 transition-transform duration-300 ${
              selectedPet ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => setSelectedPet(null)}
              className="absolute top-6 right-4"
            >
              <img src="icons/Cancel.png" className="w-4 h-4 object-cover" />
            </button>
            <h2 className="text-2xl font-bold text-gray-700">
              {selectedPet.name}
            </h2>
            <p className="text-gray-700">
              Localização: {selectedPet.location}
            </p>
            <img
              src={selectedPet.imgAnimal?.[0]?.url || "placeholder.jpg"}
              alt={selectedPet.name}
              className="w-full h-64 object-cover rounded-lg mt-4"
            />
            <p className="text-gray-700 mt-4">{selectedPet.description}</p>
            <p className="text-gray-700">Idade: {selectedPet.age}</p>
            <p className="text-gray-700">Raça: {selectedPet.race}</p>
            <p className="text-gray-700">Espécie: {selectedPet.specie}</p>

            {/* Botão "Não tenho interesse" */}
            <button
              onClick={() => setSelectedPet(null)}
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

export default Feed;
