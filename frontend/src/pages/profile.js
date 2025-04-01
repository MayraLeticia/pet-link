"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import { PetRegister } from "../components";

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

  return (
    <div className="w-[1728px] h-[1117px] flex">
      <aside className="w-[373px] h-full bg-gradient-to-b from-blue-400 via-pink-300 to-white p-6">
        <h1 className="text-2xl font-semibold text-[#4d87fc]">Pet Link</h1>
        <nav className="mt-10">
          <ul className="space-y-4">
            <li className="text-lg text-black">List</li>
            <li className="text-lg text-black">Your Match</li>
            <li className="text-lg text-black">Map</li>
            <li className="text-lg text-black">Message</li>
          </ul>
        </nav>
      </aside>

      <main className="flex-grow p-10">
        <h2 className="text-2xl font-medium text-[#4d87fc]">Seu Perfil</h2>
        {user ? (
          <div className="mt-6">
            <p className="text-lg">Bem-vindo, <span className="text-[#ffa2df]">{user.username}</span>!</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Seus Pets</h3>
              <div className="flex flex-col gap-2 justify-start items-start">
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {pets.length > 0 ? pets.map((pet) => (
                    <div key={pet._id} className="p-4 bg-white rounded-lg shadow-md">
                      <img src={pet.imgAnimal?.[0]?.url || "placeholder.jpg"} alt={pet.name} className="w-full h-40 object-cover rounded-md" />
                      <h4 className="text-lg font-medium mt-2">{pet.name}</h4>
                      <p className="text-sm text-gray-600">{pet.specie} - {pet.race}</p>
                    </div>
                  )) : <p className="text-gray-500">Nenhum pet cadastrado.</p>}
                </div>
                
                <PetRegister/>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Carregando...</p>
        )}
      </main>
    </div>
  );
};

export default Profile;
