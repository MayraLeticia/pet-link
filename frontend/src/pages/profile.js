"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import { Menu, PetRegister } from "../components";

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token recuperado:", token);
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).sub;

        // Enviar o token no cabeçalho Authorization
        const userResponse = await api.get(`/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`  // Cabeçalho com token
          }
        });

        setUser(userResponse.data);
        
        if (userResponse.data.yourAnimal && userResponse.data.yourAnimal.length > 0) {
          console.log("Dados de yourAnimal:", userResponse.data.yourAnimal);
        
          const petResponses = await Promise.all(
            userResponse.data.yourAnimal.map(async (pet) => {
              console.log("Pet ID:", pet);  // Verifique aqui qual valor está sendo impresso
              if (pet) {
                return api.get(`/pet/${pet}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  }
                });
              }
              return null; // Se não houver pet.id, retorna null
            })
          );
        
          setPets(petResponses.filter((res) => res !== null).map((res) => res.data));
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        alert("Erro ao carregar dados");
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  const [selectedPet, setSelectedPet] = useState(null);
  

  return (
    <div className="w-screem h-full flex flex-row relative overflow-hidden">
      <Menu />
      <div className="flex flex-col justify-start items-start gap-12  mx-auto my-10">
        {/* Cabeçalho */}
        <div className="w-44 h-[65px] relative">
          <p className="text-2xl font-medium text-left text-[#4d87fc]">Your profile</p>
          <p className="w-44 h-[23px] text-sm font-medium text-left mt-2">
            <span className="text-black">Welcome, </span>
            <span className="text-[#ffa2df]">{user?.username || "user"}</span>
            <span className="text-black">!</span>
          </p>
        </div>

        {/* Dados do Tutor + Dados do Pet */}
        <div className="flex justify-start items-start gap-7 w-full">
          {/* Dados do Tutor */}
          <div className="flex flex-col justify-start items-start flex-grow gap-5">
            <p className="text-xl font-medium text-black">Dados do Tutor</p>
            <div className="flex flex-col gap-3">
              <div className="w-[500px] h-14 p-4 rounded-[15px] bg-[#e8f0fe] border border-[#c7cedd]">
                <p className="text-base font-light text-[#383434]">
                  Nome: {user?.username || "Carregando..."}
                </p>
              </div>
              <div className="h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                <p className="text-base font-light text-[#383434]">
                  E-mail: {user?.email || "Carregando..."}
                </p>
              </div>
              <div className="h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                <p className="text-base font-light text-[#383434]">
                  Repetir e-mail: {user?.email || "Carregando..."}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="w-[241px] h-14 px-6 rounded-[15px] bg-[#fee8fb] flex items-center justify-center cursor-pointer">
                  <p className="text-base font-medium text-[#383434]">Mudar senha</p>
                </div>
                <div className="w-[241px] h-14 px-6 rounded-[15px] bg-[#fee8fb] flex items-center justify-center cursor-pointer">
                <p className="text-base font-medium text-[#383434]">{selectedPet ? `Excluir ${selectedPet.name}` : "Excluir pet"}</p>

                </div>
              </div>
              <div className="h-14 p-4 rounded-[15px] bg-[#f2d3d3] border border-[#ff1010] border-dashed flex items-center justify-center cursor-pointer">
                <p className="text-base font-semibold text-[#f00]">Excluir conta</p>
              </div>
            </div>
          </div>

          {/* Dados do Pet (com ou sem seleção) */}
          <div className="flex flex-col justify-start items-start gap-6">
            <p className="w-[760px] text-xl font-medium text-left text-black">
              Dados do {selectedPet ? selectedPet.name : "<pet selecionado>"}
            </p>
            <div className="flex w-[760px] gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                  <div className="w-[149px] h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                    <p className="text-base font-light text-[#383434]">
                      {selectedPet?.name || "Nome"}
                    </p>
                  </div>
                  <div className="w-[149px] h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                    <p className="text-base font-light text-[#383434]">
                      {selectedPet?.age || "Idade"}
                    </p>
                  </div>
                </div>
                <div className="h-14 w-[315px] p-4 rounded-[15px] bg-[#e8f0fe]">
                  <p className="text-base font-light text-[#383434]">
                    {selectedPet?.species || "Espécie"}
                  </p>
                </div>
                <div className="h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                  <p className="text-base font-light text-[#383434]">
                    {selectedPet?.height || "Porte"}
                  </p>
                </div>
                <div className="h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                  <p className="text-base font-light text-[#383434]">
                    {selectedPet?.breed || "Raça"}
                  </p>
                </div>
                <div className="h-14 p-4 rounded-[15px] bg-[#e8f0fe]">
                  <p className="text-base font-light text-[#383434]">
                    {selectedPet?.weight ? `${selectedPet.weight} kg` : "Peso"}
                  </p>
                </div>
              </div>
              <div className="h-[328px] w-[400px] p-4 rounded-[15px] bg-[#e8f0fe] overflow-y-auto">
                <p className="text-base font-light text-[#383434]">
                  {selectedPet?.description || "Descrição"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Galeria */}
        {pets.length > 0 && (
          <div className="flex flex-col gap-6">
            <p className="text-xl font-medium text-black">Galeria</p>
            <div className="flex gap-[55px] w-[1265px] flex-wrap">
              {pets.map((pet, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPet(pet)}
                  className={`w-[275px] h-[297px] rounded-[15px] bg-[#e8f0fe] overflow-hidden cursor-pointer border-2 ${
                    selectedPet?._id === pet._id
                      ? "border-[#4d87fc]"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={pet.imgAnimal?.[0]?.url || "/placeholder.jpg"}
                    alt={pet.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
              <div className="w-[275px] h-[297px] rounded-[15px] bg-[#e8f0fe]/30 border-2 border-[#646464] border-dashed flex items-center justify-center relative">
                <p className="text-3xl font-light text-black">+</p>
              </div>
            </div>
          </div>
        )}
        <PetRegister/>
      </div>
    </div>
  );
};

export default Profile;