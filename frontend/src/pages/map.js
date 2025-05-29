import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu, Dropdown, RadiusSlider } from "../components";
import PetCard from "../components/PetCard";
import useGeolocation from "../hooks/useGeolocation";
import { getNearbyPets } from "../services/api";

// Dynamic import for the map to avoid SSR issues
const InteractiveMap = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-full">Carregando mapa...</div>
});

const Map = () => {
    const [nearbyPets, setNearbyPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(1000); // 1km default
    const [filters, setFilters] = useState({
        specie: ''
    });

    const { location, error, loading: locationLoading, getCurrentLocation } = useGeolocation();

    // Opções para o dropdown de espécie
    const specieOptions = [
        { value: '', label: 'Todas espécies' },
        { value: 'Cão', label: 'Cão' },
        { value: 'Gato', label: 'Gato' },
        { value: 'Pássaro', label: 'Pássaro' },
        { value: 'Peixe', label: 'Peixe' },
        { value: 'Coelho', label: 'Coelho' },
        { value: 'Hamster', label: 'Hamster' },
        { value: 'Outro', label: 'Outro' }
    ];

    // Calculate distance between two points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };

    // Fetch nearby pets when location changes
    useEffect(() => {
        if (location) {
            fetchNearbyPets();
        }
    }, [location, radius]);

    // Get user location on component mount
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const fetchNearbyPets = async () => {
        if (!location) return;

        setLoading(true);
        try {
            const pets = await getNearbyPets(location.latitude, location.longitude, radius);
            setNearbyPets(pets || []);
        } catch (error) {
            console.error('Erro ao buscar pets próximos:', error);
            setNearbyPets([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter pets based on current filters
    const filteredPets = nearbyPets.filter(pet => {
        if (filters.specie && pet.specie !== filters.specie) return false;
        return true;
    });

    // Add distance to pets
    const petsWithDistance = filteredPets.map(pet => {
        if (!pet.coordinates || !pet.coordinates.coordinates || !location) {
            return { ...pet, distance: 0 };
        }

        const [lng, lat] = pet.coordinates.coordinates;
        const distance = calculateDistance(location.latitude, location.longitude, lat, lng);
        return { ...pet, distance };
    }).sort((a, b) => a.distance - b.distance);

    const handlePetClick = (pet) => {
        console.log('Pet clicked:', pet.name);
        // TODO: Implement pet selection functionality (e.g., show details, scroll to pet in sidebar)
    };

    const handleLike = (pet) => {
        console.log('Liked pet:', pet.name);
        // TODO: Implement like functionality
    };

    const handleDislike = (pet) => {
        console.log('Disliked pet:', pet.name);
        // TODO: Implement dislike functionality
    };

    const handleChat = (pet) => {
        console.log('Chat with pet:', pet.name);
        // TODO: Implement chat functionality
    };

    const clearFilters = () => {
        setFilters({
            specie: ''
        });
        setRadius(1000); // Reset to default radius
    };

    // Check if any filters are active
    const hasActiveFilters = filters.specie || radius !== 1000;

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
                            <span className="text-sm font-medium text-left text-[#ffa2df]">
                                {loading ? '...' : petsWithDistance.length}
                            </span>
                            <span className="text-sm font-medium text-left text-black"> pets na sua área</span>
                        </p>
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                    {locationLoading && (
                        <p className="text-sm text-blue-500 mt-2">Obtendo sua localização...</p>
                    )}
                </div>

                <div id='filtros' className="flex justify-start items-center gap-3 flex-wrap">
                    <RadiusSlider
                        value={radius}
                        onChange={setRadius}
                    />

                    <Dropdown
                        value={filters.specie}
                        options={specieOptions}
                        onChange={(value) => setFilters(prev => ({ ...prev, specie: value }))}
                        placeholder="Todas espécies"
                        icon="/filter.png"
                    />

                    <button
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="flex flex-row justify-center items-center w-fit h-fit gap-2 px-3 py-2 rounded-full border border-[#4d87fc] text-[#4d87fc] hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {locationLoading ? 'Localizando...' : 'Atualizar localização'}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex flex-row justify-center items-center w-fit h-fit gap-2 px-3 py-2 rounded-full border border-[#ff6b6b] text-[#ff6b6b] hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Limpar filtros
                        </button>
                    )}
                </div>
                <div id='mapa' className="flex justify-start items-start self-stretch flex-grow">
                    <div
                        className="flex justify-center items-center self-stretch flex-grow relative gap-3 rounded-tl-lg bg-white"
                        style={{ boxShadow: "0px 0px 2px 0 rgba(0,0,0,0.25)" }}
                    >
                        <InteractiveMap
                            userLocation={location}
                            nearbyPets={petsWithDistance}
                            onPetClick={handlePetClick}
                        />
                    </div>

                    <div
                        className="flex flex-col justify-start items-start self-stretch flex-grow relative max-w-96 rounded-l-md gap-3 px-4 py-6 bg-white overflow-y-auto"
                        style={{ boxShadow: "-2px 0px 5px 0 rgba(0,0,0,0.25)" }}
                    >
                        <p className="text-xl font-medium text-left text-black">Próximos a você</p>

                        {loading && (
                            <div className="flex justify-center items-center w-full py-8">
                                <p className="text-gray-500">Carregando pets próximos...</p>
                            </div>
                        )}

                        {!loading && petsWithDistance.length === 0 && location && (
                            <div className="flex flex-col justify-center items-center w-full py-8 text-center">
                                <p className="text-gray-500 mb-2">Nenhum pet encontrado na sua área</p>
                                <p className="text-sm text-gray-400">Tente aumentar o raio de busca</p>
                            </div>
                        )}

                        {!location && !locationLoading && (
                            <div className="flex flex-col justify-center items-center w-full py-8 text-center">
                                <p className="text-gray-500 mb-2">Localização necessária</p>
                                <button
                                    onClick={getCurrentLocation}
                                    className="text-blue-500 hover:text-blue-700 underline"
                                >
                                    Permitir acesso à localização
                                </button>
                            </div>
                        )}

                        {petsWithDistance.map((pet) => (
                            <PetCard
                                key={pet._id}
                                pet={pet}
                                distance={pet.distance}
                                onLike={handleLike}
                                onDislike={handleDislike}
                                onChat={handleChat}
                                isOnline={true}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;
