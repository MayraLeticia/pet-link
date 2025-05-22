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
    <div className="w-full h-full flex flex-row relative overflow-hidden profile-container">
      <Menu />
      <div className="flex flex-col justify-start items-start gap-4 mx-auto px-4 w-full md:w-4/5 profile-content overflow-x-hidden">
        {/* Cabeçalho */}
        <div className="w-full md:w-auto relative profile-header">
          <p className="text-xl md:text-2xl font-medium text-left text-[#4d87fc] profile-title">Your profile</p>
          <p className="w-full md:w-auto text-sm font-medium text-left mt-2 profile-welcome">
            <span className="text-black">Welcome, </span>
            <span className="text-[#ffa2df]">{user?.username || "user"}</span>
            <span className="text-black">!</span>
          </p>
        </div>

        {/* Dados do Tutor + Dados do Pet */}
        <div className="flex flex-col md:flex-row justify-start items-start gap-3 md:gap-5 w-full profile-section">
          {/* Dados do Tutor */}
          <div className="flex flex-col justify-start items-start w-full md:w-auto md:flex-grow gap-4 md:gap-5 profile-tutor-data">
            <p className="text-lg md:text-xl font-medium text-black">Dados do Tutor</p>
            <div className="flex flex-col gap-3 w-full">
              <div className="w-full md:w-[300px] lg:w-[350px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] border border-[#c7cedd] profile-form-field">
                <p className="text-sm md:text-base font-light text-[#383434]">
                  Nome: {user?.username || "Carregando..."}
                </p>
              </div>
              <div className="w-full md:w-[300px] lg:w-[350px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                <p className="text-sm md:text-base font-light text-[#383434]">
                  E-mail: {user?.email || "Carregando..."}
                </p>
              </div>
              <div className="w-full md:w-[300px] lg:w-[350px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                <p className="text-sm md:text-base font-light text-[#383434]">
                  Repetir e-mail: {user?.email || "Carregando..."}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full profile-buttons">
                <div className="w-full md:w-[150px] lg:w-[170px] h-10 md:h-12 px-3 md:px-4 rounded-[15px] bg-[#fee8fb] flex items-center justify-center cursor-pointer profile-button">
                  <p className="text-sm md:text-base font-medium text-[#383434]">Mudar senha</p>
                </div>
                <div className="w-full md:w-[150px] lg:w-[170px] h-10 md:h-12 px-3 md:px-4 rounded-[15px] bg-[#fee8fb] flex items-center justify-center cursor-pointer profile-button">
                <p className="text-sm md:text-base font-medium text-[#383434]">{selectedPet ? `Excluir ${selectedPet.name}` : "Excluir pet"}</p>

                </div>
              </div>
              <div className="w-full h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#f2d3d3] border border-[#ff1010] border-dashed flex items-center justify-center cursor-pointer profile-button">
                <p className="text-sm md:text-base font-semibold text-[#f00]">Excluir conta</p>
              </div>
            </div>
          </div>

          {/* Dados do Pet (com ou sem seleção) */}
          <div className="flex flex-col justify-start items-start gap-4 md:gap-6 w-full profile-pet-data">
            <p className="w-full text-lg md:text-xl font-medium text-left text-black">
              Dados do {selectedPet ? selectedPet.name : "<pet selecionado>"}
            </p>
            <div className=" flex flex-row w-full gap-4 md:gap-6 pet-data-container">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/2 md:w-[120px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                    <p className="text-sm md:text-base font-light text-[#383434]">
                      {selectedPet?.name || "Nome"}
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-[120px] h-10 md:h-12 p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                    <p className="text-sm md:text-base font-light text-[#383434]">
                      {selectedPet?.age || "Idade"}
                    </p>
                  </div>
                </div>
                <div className="h-10 md:h-12 w-full md:w-[250px] p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    {selectedPet?.species || "Espécie"}
                  </p>
                </div>
                <div className="h-10 md:h-12 w-full p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    {selectedPet?.height || "Porte"}
                  </p>
                </div>
                <div className="h-10 md:h-12 w-full p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    {selectedPet?.breed || "Raça"}
                  </p>
                </div>
                <div className="h-10 md:h-12 w-full p-2 md:p-3 rounded-[15px] bg-[#e8f0fe] profile-form-field">
                  <p className="text-sm md:text-base font-light text-[#383434]">
                    {selectedPet?.weight ? `${selectedPet.weight} kg` : "Peso"}
                  </p>
                </div>
              </div>
              <div className="min-h-[150px] h-auto w-full lg:w-[300px] p-2 md:p-3 rounded-xl bg-[#e8f0fe] overflow-y-auto profile-form-field description-field">
                <p className="text-sm md:text-base font-light text-[#383434]">
                  {selectedPet?.description || "Descrição do pet. Este campo permite que você adicione informações detalhadas sobre o seu animal de estimação, como personalidade, hábitos, necessidades especiais e outras características importantes."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Galeria */}
        {pets.length > 0 && (
          <div className="flex flex-col gap-4 md:gap-6 w-full">
            <p className="text-lg md:text-xl font-medium text-black">Galeria</p>
            <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-[55px] w-full justify-center sm:justify-start">
              {pets.map((pet, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPet(pet)}
                  className={`w-32 h-36 sm:w-36 sm:h-44 md:w-44 md:h-52 lg:w-52 lg:h-56 rounded-xl bg-[#e8f0fe] overflow-hidden cursor-pointer border-2 profile-gallery-item ${
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
              <div className="w-32 h-36 sm:w-36 sm:h-44 md:w-44 md:h-52 lg:w-52 lg:h-56 rounded-xl bg-[#e8f0fe]/30 border-2 border-[#646464] border-dashed flex items-center justify-center relative profile-gallery-item">
                <p className="text-2xl md:text-3xl font-light text-black">+</p>
              </div>
            </div>
          </div>
        )}
        <div className="w-full">
          <PetRegister/>
        </div>
      </div>
    </div>
  );
};

export default Profile;