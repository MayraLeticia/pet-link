"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';

import { Card } from "../components";

const Feed = () => {

    const [pets, setPets] = useState([]);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await api.get('/api/pet/allPets');
                setPets(response.data);
            } catch (error) {
                console.error("Erro ao buscar pets:", error);
                alert("Erro ao carregar os dados dos pets.");
            }
        };

        fetchPets();
    }, []);

    return (
        <div id="profile" className="w-screen h-screen flex flex-row justify-center items-center">
            <div id="Component-menu-lateral" className="bg-custom-gradient h-full w-1/4"></div>

            <div id="home-container" className="flex flex-col gap-10 self-stretch flex-grow-0 flex-shrink-0 h-fit w-3/4 m-7">
                <div id="mensage" className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-2">

                    <p className="text-2xl font-medium text-left text-[#4d87fc]">
                        Ache seu parceiro!
                    </p>
                    <div className="flex flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
                        <p className="text-sm font-medium text-left">
                            <span className="text-sm font-medium text-left text-black">Resultado para </span>
                            {/* //mudar pro numero de usuários */}
                            <span className="text-sm font-medium text-left text-[#ffa2df]">{pets.length}</span>
                            <span className="text-sm font-medium text-left text-black"> animais</span>
                        </p>
                    </div>
                </div>

                <div id='feed-container' className="grid grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-3">

                    {pets.map((pet) => (
                        <Card
                            key={pet._id}
                            profilePhoto={pet.imgAnimal?.[0]?.url || "placeholder.jpg"}
                            name={pet.name}
                            location={pet.location || "Localização não informada"}
                        />
                    ))}

                    
                    {/* <div id='card' className="w-60 h-60 rounded-lg bg-custom-gradient flex flex-col">
                        <div className="w-full h-3/4">
                        
                            <img
                                src="image-5.png"
                                className="w-full h-full object-cover rounded-t-lg"
                            />
                            recebe imagem do usuário 
                            
                            <div className='w-1/2 h-auto gap-5 flex relative left-40 -top-40'>
                                <div className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-950 bg-opacity-60'>
                                    <img src="heart.png" className="w-[19px] h-[19px] object-cover" />
                                </div>
                                <div className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-950 bg-opacity-60'>
                                    <img src="dislike.png" className="w-[19px] h-[19px] object-cover" />
                                </div>
                            </div>
                            
                        </div>
                        
                        <div className="w-full h-1/4 rounded-r-lg p-2">
                            <p className="text-sm font-medium text-left text-black">
                                nome do usuário
                            </p>
                            <p className="text-xs font-normal text-left text-slate-950 opacity-25">distancia</p>
                                
                            <div className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-950 bg-opacity-60 relative left-48 -top-7'>
                                <img src="chat-bubbles-with-ellipsis.png" className="w-[19px] h-[19px] object-cover" />
                            </div>

                        </div>
                
                    </div> */}
                </div>
            </div>
        </div>
    );
}


export default Feed;