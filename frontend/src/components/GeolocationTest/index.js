import { useState } from 'react';
import axios from 'axios';

const GeolocationTest = () => {
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [petId, setPetId] = useState(''); // Para identificar qual pet estamos atualizando

  const getLocation = () => {
    setStatus('');
    setLoading(true);

    if (!navigator.geolocation) {
      setStatus('Geolocalização não suportada pelo seu navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setStatus('Localização obtida com sucesso!');
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus('Usuário recusou a solicitação de Geolocalização');
            break;
          case error.POSITION_UNAVAILABLE:
            setStatus('Localização indisponível');
            break;
          case error.TIMEOUT:
            setStatus('A requisição expirou');
            break;
          case error.UNKNOWN_ERROR:
            setStatus('Ocorreu um erro desconhecido');
            break;
          default:
            setStatus('Erro ao obter localização');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const saveLocationToDatabase = async () => {
    if (!location || !petId) {
      setSaveStatus('Localização ou ID do pet não fornecidos');
      return;
    }

    try {
      setSaveStatus('Enviando dados...');
      const response = await axios.post('/api/location/location', {
        petId,
        latitude: location.latitude,
        longitude: location.longitude
      });

      setSaveStatus('Localização salva com sucesso!');
      console.log('Resposta do servidor:', response.data);  
    } catch (error) {
      setSaveStatus(`Erro ao salvar: ${error.response?.data?.error || error.message}`);
      console.error('Erro ao salvar localização:', error);
    }
  };

  return (
    <div className="geolocation-test">
      <h2>Teste de Geolocalização</h2>
      
      <button 
        onClick={getLocation} 
        disabled={loading}
        className="location-button"
      >
        {loading ? 'Obtendo...' : 'Obter Localização'}
      </button>
      
      {status && <p className="status-message">{status}</p>}
      
      {location && (
        <div className="location-display">
          <h3>Coordenadas obtidas:</h3>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
          
          <div className="save-section">
            <h3>Salvar no banco de dados:</h3>
            <input
              type="text"
              placeholder="ID do pet"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="pet-id-input"
            />
            <button 
              onClick={saveLocationToDatabase}
              className="save-button"
            >
              Salvar Localização
            </button>
            {saveStatus && <p className="save-status">{saveStatus}</p>}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .geolocation-test {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          margin-top: 0;
          color: #333;
        }
        
        .location-button, .save-button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .location-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .save-button {
          background-color: #28a745;
          margin-top: 10px;
        }
        
        .status-message {
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .location-display {
          margin-top: 20px;
          padding: 15px;
          background-color: #f1f8ff;
          border-radius: 4px;
        }
        
        .save-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        
        .pet-id-input {
          width: 100%;
          padding: 8px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .save-status {
          margin-top: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default GeolocationTest;