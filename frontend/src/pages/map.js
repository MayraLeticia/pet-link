import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu } from "../components";
import dynamic from 'next/dynamic';
import { getNearbyPets, addFavorite } from '../services/api';

// Importação dinâmica dos componentes do Leaflet para evitar erros de SSR
const MapWithNoSSR = dynamic(
  () => import('../components/MapComponent'),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center w-full h-full">Carregando mapa...</div>
  }
);

// Função para calcular a distância entre dois pontos geográficos (usando a fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180; // φ, λ em radianos
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // em metross
};

const Map = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [manualMode, setManualMode] = useState(false);
    const [nearbyPets, setNearbyPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [radius, setRadius] = useState(5); // Default radius in km
    const [showRadiusMenu, setShowRadiusMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [locationAccuracy, setLocationAccuracy] = useState(null);
    const [filters, setFilters] = useState({
        species: [],
        gender: [],
        size: []
    });

    // Function to fetch nearby pets
    const fetchNearbyPets = useCallback(async (latitude, longitude, radius) => {
        try {
            setLoading(true);
            const pets = await getNearbyPets(latitude, longitude, radius);
            setNearbyPets(pets);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching nearby pets:", error);
            setError("Erro ao buscar pets próximos.");
            setLoading(false);
        }
    }, []);

    // Get user location and fetch nearby pets
    const getUserLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setLocationAccuracy(accuracy);
                    setManualMode(false);

                    // Fetch nearby pets
                    fetchNearbyPets(latitude, longitude, radius);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setError("Não foi possível obter sua localização. Por favor, permita o acesso à localização.");
                    setLoading(false);

                    // Fallback to a default location (Fortaleza, CE)
                    setUserLocation([-3.7319, -38.5267]);
                    setManualMode(true);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setError("Seu navegador não suporta geolocalização.");
            setLoading(false);

            // Fallback to a default location (Fortaleza, CE)
            setUserLocation([-3.7319, -38.5267]);
            setManualMode(true);
        }
    }, [radius, fetchNearbyPets]);

    // Initial location fetch
    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    // Adicionar manipulador de clique global para fechar menus quando clicar fora deles
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Fechar menu de raio se clicar fora dele
            if (showRadiusMenu && !event.target.closest('#seletor-area')) {
                setShowRadiusMenu(false);
            }

            // Fechar menu de filtro se clicar fora dele
            if (showFilterMenu && !event.target.closest('#seletor-filtro')) {
                setShowFilterMenu(false);
            }
        };

        // Adicionar listener
        document.addEventListener('mousedown', handleClickOutside);

        // Remover listener ao desmontar
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRadiusMenu, showFilterMenu]);

    // Update pets when radius changes
    useEffect(() => {
        if (userLocation) {
            fetchNearbyPets(userLocation[0], userLocation[1], radius);
        }
    }, [radius, userLocation, fetchNearbyPets]);

    // Handle radius change
    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        // Fechamos o menu com um pequeno atraso para permitir que o usuário veja a seleção
        setTimeout(() => {
            setShowRadiusMenu(false);
        }, 300);
    };

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters };

            // Toggle the filter value
            if (newFilters[filterType].includes(value)) {
                newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
            } else {
                newFilters[filterType] = [...newFilters[filterType], value];
            }

            return newFilters;
        });
    };

    // Apply filters to pets
    const filteredPets = useMemo(() => {
        if (filters.species.length === 0 && filters.gender.length === 0 && filters.size.length === 0) {
            return nearbyPets;
        }

        return nearbyPets.filter(pet => {
            const speciesMatch = filters.species.length === 0 || filters.species.includes(pet.specie);
            const genderMatch = filters.gender.length === 0 || filters.gender.includes(pet.gender);
            const sizeMatch = filters.size.length === 0 || filters.size.includes(pet.size);

            return speciesMatch && genderMatch && sizeMatch;
        });
    }, [nearbyPets, filters]);

    // Função para lidar com o like em um pet
    const handleLike = async (petId) => {
        try {
            // Obter o ID do pet do usuário logado
            const userId = localStorage.getItem("userId");
            if (!userId) {
                alert("Você precisa estar logado para curtir um pet.");
                return;
            }

            // Obter os pets do usuário
            const userPets = JSON.parse(localStorage.getItem("userPets") || "[]");
            if (userPets.length === 0) {
                alert("Você precisa cadastrar um pet para poder curtir outros pets.");
                return;
            }

            // Usar o primeiro pet do usuário para dar like (pode ser melhorado para escolher qual pet está dando like)
            const userPetId = userPets[0]._id;

            // Chamar a API para adicionar o pet aos favoritos
            await addFavorite(userPetId, petId);
            alert("Pet adicionado aos favoritos!");
        } catch (error) {
            console.error("Erro ao curtir pet:", error);
            alert("Erro ao curtir o pet. Tente novamente.");
        }
    };

    // Função para lidar com o dislike em um pet
    const handleDislike = (petId) => {
        // Implementação futura: pode registrar pets que o usuário não tem interesse
        console.log("Dislike no pet:", petId);
    };

    // Função para iniciar um chat com o dono do pet
    const handleChat = (petId) => {
        // Implementação futura: redirecionar para a tela de chat ou abrir modal de chat
        console.log("Iniciar chat com o dono do pet:", petId);
    };

    return (
        <div id="Map" className="w-screen h-screen flex flex-row justify-center items-center">
            <Menu />
            <div className="flex flex-col justify-start items-start flex-grow h-full p-5 gap-7">
                <div id="mensage" className="flex flex-col justify-start items-start px-2 gap-0">
                    <p className="text-2xl font-medium text-left text-[#4d87fc]">
                        Na sua área!
                    </p>
                    <div className="flex flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
                        <p className="text-sm font-medium text-left">
                            <span className="text-sm font-medium text-left text-black">Nós achamos </span>
                            <span className="text-sm font-medium text-left text-[#ffa2df]">{filteredPets.length}</span>
                            <span className="text-sm font-medium text-left text-black"> pets na sua área</span>
                        </p>
                    </div>
                </div>

                <div id='filtros' className="flex justify-start items-center gap-3">
                    {/* Radius selector with dropdown */}
                    <div
                        id='seletor-area'
                        className="flex flex-row justify-center items-center w-fit h-fit gap-2 px-3 py-2 rounded-full border border-[#646464] cursor-pointer relative min-w-[100px]"
                        onClick={() => setShowRadiusMenu(!showRadiusMenu)}
                    >
                        <div className="flex flex-col justify-start items-start gap-0">
                            <p className="text-xs font-medium text-left text-[#646464]">Proximidade</p>
                            <p className="text-sm font-medium text-left text-[#ffa2df]">{radius} km</p>
                        </div>
                        <img src="/icons/Map.png" className="w-5 h-5 object-cover" />
                        <img src="down-chevron.png" className="w-3 h-3 object-cover" />

                        {/* Radius dropdown menu */}
                        {showRadiusMenu && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-2 w-40">
                                <div className="mb-2 px-2 text-xs text-[#646464] font-medium">Selecione o raio:</div>
                                {[1, 2, 5, 10, 20].map((r) => (
                                    <div
                                        key={r}
                                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${radius === r ? 'bg-gray-50' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRadiusChange(r);
                                        }}
                                    >
                                        <span>{r} km</span>
                                        {radius === r && (
                                            <span className="text-[#ffa2df]">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter button */}
                    <div
                        id='seletor-filtro'
                        className="flex flex-row justify-center items-center w-fit h-fit gap-2 px-3 py-2 rounded-full border border-[#646464] cursor-pointer relative min-w-[100px]"
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        <div className="relative">
                            <img src="filter.png" className="w-6 h-6 object-cover" />
                            {(filters.species.length > 0 || filters.gender.length > 0 || filters.size.length > 0) && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffa2df] rounded-full flex items-center justify-center">
                                    <span className="text-[8px] text-white font-bold">
                                        {filters.species.length + filters.gender.length + filters.size.length}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-[#646464]">Filtros</span>
                            {(filters.species.length > 0 || filters.gender.length > 0 || filters.size.length > 0) && (
                                <span className="text-[10px] text-[#ffa2df]">
                                    {filters.species.length > 0 ? `${filters.species.length} espécies` : ''}
                                    {filters.species.length > 0 && (filters.gender.length > 0 || filters.size.length > 0) ? ', ' : ''}
                                    {filters.gender.length > 0 ? `${filters.gender.length} gêneros` : ''}
                                    {filters.gender.length > 0 && filters.size.length > 0 ? ', ' : ''}
                                    {filters.size.length > 0 ? `${filters.size.length} portes` : ''}
                                </span>
                            )}
                        </div>

                        {/* Filter dropdown menu */}
                        {showFilterMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4 w-64">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium">Filtrar por:</h3>
                                    {(filters.species.length > 0 || filters.gender.length > 0 || filters.size.length > 0) && (
                                        <button
                                            className="text-xs text-[#4d87fc] hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFilters({
                                                    species: [],
                                                    gender: [],
                                                    size: []
                                                });
                                            }}
                                        >
                                            Limpar filtros
                                        </button>
                                    )}
                                </div>

                                {/* Species filter */}
                                <div className="mb-3">
                                    <h4 className="text-sm font-medium mb-1">Espécie</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Cachorro', 'Gato', 'Ave', 'Roedor'].map((specie) => (
                                            <div
                                                key={specie}
                                                onClick={() => handleFilterChange('species', specie)}
                                                className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                                                    filters.species.includes(specie)
                                                        ? 'bg-[#ffa2df] text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {specie}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gender filter */}
                                <div className="mb-3">
                                    <h4 className="text-sm font-medium mb-1">Gênero</h4>
                                    <div className="flex gap-2">
                                        {['Macho', 'Fêmea'].map((gender) => (
                                            <div
                                                key={gender}
                                                onClick={() => handleFilterChange('gender', gender)}
                                                className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                                                    filters.gender.includes(gender)
                                                        ? 'bg-[#ffa2df] text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {gender}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Size filter */}
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Porte</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Pequeno', 'Médio', 'Grande'].map((size) => (
                                            <div
                                                key={size}
                                                onClick={() => handleFilterChange('size', size)}
                                                className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                                                    filters.size.includes(size)
                                                        ? 'bg-[#ffa2df] text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {size}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location refresh button */}
                    <button
                        onClick={getUserLocation}
                        className="flex justify-center items-center px-3 py-2 rounded-full bg-[#4d87fc] text-white"
                        disabled={loading}
                    >
                        <span className="text-sm">Atualizar localização</span>
                    </button>
                </div>

                <div id='mapa' className="flex justify-start items-start self-stretch flex-grow">
                    <div
                        className="flex justify-center items-center self-stretch flex-grow relative gap-3 rounded-tl-lg bg-white"
                        style={{ boxShadow: "0px 0px 2px 0 rgba(0,0,0,0.25)" }}
                    >
                        {loading && <div className="absolute z-10 flex items-center justify-center w-full h-full bg-white bg-opacity-70">Carregando mapa...</div>}
                        {error && <div className="absolute z-10 flex items-center justify-center w-full h-full bg-white bg-opacity-70">{error}</div>}

                        {userLocation ? (
                            <MapWithNoSSR
                                userLocation={userLocation}
                                nearbyPets={filteredPets}
                                radius={radius}
                                locationAccuracy={locationAccuracy}
                                updateManualLocation={null} // Set to null to disable manual location updates
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                {!error && !loading && "Obtendo sua localização..."}
                            </div>
                        )}
                    </div>

                    <div
                        className="flex flex-col justify-start items-start self-stretch flex-grow relative max-w-96 rounded-l-md gap-3 px-4 py-6 bg-white"
                        style={{ boxShadow: "-2px 0px 5px 0 rgba(0,0,0,0.25)" }}
                    >
                        <p className="text-xl font-medium text-left text-black">Proximos a você</p>

                        {loading ? (
                            <div className="w-full text-center py-4">Carregando pets próximos...</div>
                        ) : filteredPets.length === 0 ? (
                            <div className="w-full text-center py-4">Nenhum pet encontrado nesta área.</div>
                        ) : (
                            filteredPets.map((pet) => {
                                // Calcular a distância aproximada em metros
                                const distance = pet.coordinates && userLocation ?
                                    calculateDistance(
                                        userLocation[0],
                                        userLocation[1],
                                        pet.coordinates.coordinates[1],
                                        pet.coordinates.coordinates[0]
                                    ) : null;

                                return (
                                    <div
                                        key={pet._id}
                                        className="flex flex-col justify-center items-start w-full gap-2 p-3 rounded-lg bg-white"
                                        style={{ boxShadow: "0px 0px 2px 0 rgba(0,0,0,0.25)" }}
                                    >
                                        <div className="flex justify-start items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden">
                                                {pet.imgAnimal && pet.imgAnimal.length > 0 ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${pet.imgAnimal[0]}`}
                                                        alt={pet.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/placeholder-pet.png";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                                        {pet.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-start items-center gap-1">
                                                <p className="text-base font-medium text-left text-[#1e1e1e]">{pet.name}</p>
                                                <div className="w-2 h-2 rounded-full bg-[#14FF0F]"></div>
                                            </div>
                                            <p className="text-sm font-light text-left text-[#646464]">
                                                {distance ?
                                                    distance < 1000 ?
                                                        `${Math.round(distance)}m` :
                                                        `${(distance / 1000).toFixed(1)}km`
                                                    : ''}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center self-stretch pl-16">
                                            <div className="flex justify-start items-center gap-2">
                                                <div
                                                    className="flex justify-center items-center w-7 h-7 rounded-full border border-[#646464] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleDislike(pet._id)}
                                                >
                                                    <img
                                                        src="/icons/Dislike.png"
                                                        className="w-4 h-4 object-cover"
                                                        alt="Dislike"
                                                    />
                                                </div>
                                                <div
                                                    className="flex justify-center items-center w-7 h-7 rounded-full border border-[#646464] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleLike(pet._id)}
                                                >
                                                    <img
                                                        src="/icons/Heart.png"
                                                        className="w-4 h-4 object-cover"
                                                        alt="Like"
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className="flex justify-center items-center w-7 h-7 rounded-full bg-[#ffa2df] cursor-pointer hover:bg-[#ff8ad3]"
                                                onClick={() => handleChat(pet._id)}
                                            >
                                                <img
                                                    src="/icons/chat-bubbles-with-ellipsis.png"
                                                    className="w-4 h-4 object-cover"
                                                    alt="Chat"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;
