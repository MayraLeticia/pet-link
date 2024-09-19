"use client";

import { useState, useEffect } from 'react';
import api from '../../services/api'; // Usando a instância personalizada

const EditableInput = ({ label, apiEndpoint }) => {
    const [value, setValue] = useState(''); // Valor inicial vazio
    const [loading, setLoading] = useState(true); // Estado de loading para indicar o carregamento
    const [isFocused, setIsFocused] = useState(false);

    // Fetch de dados para pegar o valor inicial de um banco de dados
    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await api.get(apiEndpoint); // Agora usando 'api' ao invés de 'axios'
            setValue(response.data.initialValue); // Aqui eu suponho que sua API retorna um objeto com initialValue
            setLoading(false); // Quando os dados forem carregados, desativa o loading
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            setLoading(false); // Desativa o loading mesmo em caso de erro
        }
        };

        fetchData(); // Chama a função fetch ao montar o componente
    }, [apiEndpoint]); // A dependência `apiEndpoint` garante que o fetch seja feito quando ela mudar

    if (loading) {
        return <div>Carregando...</div>; // Mostra o texto enquanto os dados estão sendo carregados
    }

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(value !== "")} // Mantém a label no topo se houver texto
                className="bg-gray-900 text-white rounded-lg px-4 py-3 w-full outline-none border border-gray-600 focus:border-blue-500 transition-all"
            />
            <label
                className={`absolute left-4 top-3 text-base text-gray-400 transition-all 
                ${isFocused || value ? 'text-xs -top-4' : 'text-base top-3'}`}
            >
                {label}
            </label>
        </div>
    );
};

export default EditableInput;
