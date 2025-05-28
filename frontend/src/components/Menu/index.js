"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePetContext } from '../../contexts/PetContext';

const Menu = () => {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [showPetDropdown, setShowPetDropdown] = useState(false);

    // Usar o contexto de pets
    const { pets, selectedPet, selectPet, fetchUserPets } = usePetContext();

    useEffect(() => {
        // Verificar se o usuário está logado
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            router.push('/login');
        }

        // Obter o nome do usuário do localStorage se disponível
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        }

        // Buscar pets do usuário se ainda não foram carregados
        if (pets.length === 0) {
            fetchUserPets();
        }
    }, [pets.length, fetchUserPets]);

    // Função para fazer logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        router.push('/login');
    };

    // Função para adicionar novo pet
    const handleAddPet = () => {
        setShowPetDropdown(false);
        router.push('/profile');
    };

    // Menu para desktop
    const DesktopMenu = () => (
        <div className="menu-desktop w-1/4 relative">
            <div id="sidebar" className="menu-sidebar bg-custom-gradient h-screen fixed top-0 left-0 gap-8 px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12 flex flex-col justify-start items-start overflow-y-auto">
                <div className="flex justify-start items-center absolute top-3 left-3 cursor-pointer" onClick={() => {router.push(`/home`)}}>
                    <img
                        src="/Logo.png"
                        className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-cover"
                    />
                    <p className="text-l md:text-xl lg:text-2xl font-semibold text-left text-[#4d87fc] cursor-pointer ml-2">
                        Pet Link
                    </p>
                </div>

                {/* Seletor de Pet */}
                <div className="flex flex-col w-full mt-20 mb-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowPetDropdown(!showPetDropdown)}
                            className="flex justify-between items-center w-full px-4 py-2 bg-white rounded-md border border-gray-300 shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <img src="/icons/Paw.png" className="w-5 h-5 object-cover" />
                                <span className="text-sm font-medium">
                                    {selectedPet ? selectedPet.name : "Selecione o pet"}
                                </span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        {showPetDropdown && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                                {pets.map(pet => (
                                    <div
                                        key={pet._id}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            selectPet(pet);
                                            setShowPetDropdown(false);
                                        }}
                                    >
                                        <img src="/icons/Paw.png" className="w-5 h-5 object-cover" />
                                        <span className="text-sm">{pet.name}</span>
                                    </div>
                                ))}
                                <div
                                    className="flex items-center gap-2 px-4 py-2 border-t border-gray-200 hover:bg-gray-100 cursor-pointer text-[#4d87fc]"
                                    onClick={handleAddPet}
                                >
                                    <span className="text-lg">+</span>
                                    <span className="text-sm">Adicionar pet</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1 w-full">
                    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 w-full">
                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/home`)}}>
                            <img src="icons/Paw.png" className="w-[22px] h-[22px] md:w-[26px] md:h-[25px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Home
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/salvos`)}}>
                            <img src="icons/Heart.png" className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Salvos
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/map`)}}>
                            <img src="icons/Map.png" className="w-[22px] h-[22px] md:w-[25px] md:h-[26px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Mapa
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/chat`)}}>
                            <img
                                src="icons/chat-bubbles-with-ellipsis.png"
                                className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover ml-2"
                            />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Mensagem
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/profile`)}}>
                            <img src="/Logo.png" className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Perfil
                            </p>
                        </button>
                    </div>
                </div>

                <div className="w-full my-4">
                    <div className="h-[1px] bg-[#646464]/70 w-full"></div>
                </div>

                <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1 w-full">
                    <p className="text-sm md:text-base font-medium text-left text-black px-2">
                        Conversas frequentes
                    </p>

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-2 bg-transparent w-full hover:bg-white/20 rounded-md transition-all px-2">
                        <img className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover" src="/Logo.png" />
                        <p className="text-sm md:text-base font-medium text-left text-black">
                            {userName || 'User'}
                        </p>
                    </div>
                </div>

                {/* Botão de Logout */}
                <div className="mt-auto mb-4 w-full">
                    <button
                        onClick={handleLogout}
                        className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all"
                    >
                        <img
                            src="/icons/exit.svg"
                            className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover ml-2"
                            alt="Sair"
                        />
                        <p className="text-sm md:text-base font-medium text-left text-black">
                            Sair
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );

    // Menu para mobile
    const MobileMenu = () => (
        <div className="menu-mobile hidden fixed bottom-0 left-0 w-full h-[70px] bg-white shadow-lg z-50 px-2 py-1">
            {/* Seletor de Pet para Mobile */}
            <button className="menu-mobile-item" onClick={() => setShowPetDropdown(!showPetDropdown)}>
                <img src="/icons/Paw.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">
                    {selectedPet ? selectedPet.name.substring(0, 6) + (selectedPet.name.length > 6 ? '...' : '') : "Pet"}
                </p>
            </button>

            {showPetDropdown && (
                <div className="absolute bottom-[70px] left-0 w-full bg-white border-t border-gray-300 shadow-lg z-50">
                    {pets.map(pet => (
                        <div
                            key={pet._id}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                            onClick={() => {
                                selectPet(pet);
                                setShowPetDropdown(false);
                            }}
                        >
                            <img src="/icons/Paw.png" className="w-5 h-5 object-cover" />
                            <span>{pet.name}</span>
                        </div>
                    ))}
                    <div
                        className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer text-[#4d87fc]"
                        onClick={handleAddPet}
                    >
                        <span className="text-lg">+</span>
                        <span>Adicionar pet</span>
                    </div>
                </div>
            )}

            <button className="menu-mobile-item" onClick={() => {router.push(`/home`)}}>
                <img src="icons/Paw.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Home</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/salvos`)}}>
                <img src="icons/Heart.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Salvos</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/map`)}}>
                <img src="icons/Map.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Mapa</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/chat`)}}>
                <img src="icons/chat-bubbles-with-ellipsis.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Mensagem</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/profile`)}}>
                <img src="/Logo.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Perfil</p>
            </button>

            <button className="menu-mobile-item" onClick={handleLogout}>
                <img src="/icons/exit.svg" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Sair</p>
            </button>
        </div>
    );

    return (
        <>
            <DesktopMenu />
            <MobileMenu />
        </>
    );
}


export default Menu;
