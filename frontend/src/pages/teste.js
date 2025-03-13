"use client";

import React, { useEffect, useState } from 'react';


import { Card } from "../components";

const Teste = () => {

    return (
        <div id="profile" className="w-screen h-screen flex flex-row justify-center items-center">
            <div id="sidebar" className="bg-custom-gradient h-full w-1/5"></div>

            <div id="main-container" className="flex-grow h-full w-3/4 flex">
                <div className="flex flex-col justify-start items-start py-5 px-10 gap-5">
                    <div id="mensage" className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-0">

                        <p className="text-2xl font-medium text-left text-[#4d87fc]">
                            Ache seu parceiro!
                        </p>
                        <div className="flex flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
                            <p className="text-sm font-medium text-left">
                                <span className="text-sm font-medium text-left text-black">Resultado para </span>
                                <span className="text-sm font-medium text-left text-[#ffa2df]">0</span>
                                <span className="text-sm font-medium text-left text-black"> animais</span>
                            </p>
                        </div>
                    </div>

                    <div 
                        id="cards-container" 
                        className="flex flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-2"
                    >
                        
                        <Card
                            key= "0"
                            profilePhoto={"placeholder.jpg"}
                            name="nome"
                            location="Localização não informada"
                            onClick={""}
                        />
                    
                    </div>
                </div>  

            </div>
        </div>
    );
}


export default Teste;