"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "../components";
import Card from "../components/Card";

const Salvos = () => {
  const [savedPets, setSavedPets] = useState([]);

  useEffect(() => {
    const storedPets = JSON.parse(localStorage.getItem("savedPets")) || [];
    setSavedPets(storedPets);
  }, []);

  return (
    <div id="Home" className="w-screen h-screen flex flex-row justify-center items-center">
      <Menu />

      <div id="main-container" className="flex-grow h-full w-3/4 flex">
        <div className="flex flex-col justify-start items-start py-5 px-3 gap-5 w-full">
          <div className="flex flex-col justify-start items-start px-2 gap-0">
            <p className="text-2xl font-medium text-left text-[#4d87fc]">
              Seus pets salvos!
            </p>
            <p className="text-sm font-medium text-left">
              <span className="text-black">Total: </span>
              <span className="text-[#ffa2df]">{savedPets.length}</span>
              <span className="text-black"> pets</span>
            </p>
          </div>

          <div
            id="cards-container"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[20px] w-full max-w-[1280px] mx-auto"
          >
            {savedPets.map((pet) => (
              <Card
                key={pet._id}
                profilePhoto={pet.imgAnimal?.[0]?.url || "placeholder.jpg"}
                name={pet.name}
                location={pet.location || "Localização não informada"}
                // você pode adicionar outras props se necessário
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salvos;
