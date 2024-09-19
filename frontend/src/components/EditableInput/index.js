"use client";

import { useState, useEffect } from 'react';
import api from '../../services/api'; // Usando a instância personalizada

const EditableInput = ({ label, apiEndpoint }) => {
    const [value, setValue] = useState(''); // Valor inicial vazio
    const [loading, setLoading] = useState(true); // Estado de loading para indicar o carregamento

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
        <div className="flex flex-col">
        <label className="text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            className="bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-transparent focus:border-gray-500 transition-colors"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
        </div>
    );
};

export default EditableInput;
