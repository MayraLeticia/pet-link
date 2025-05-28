import { useState, useEffect } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à localização.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite excedido ao obter localização.';
            break;
          default:
            errorMessage = 'Erro desconhecido ao obter localização.';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      defaultOptions
    );
  };

  const watchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Erro ao monitorar localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite excedido.';
            break;
        }
        
        setError(errorMessage);
      },
      defaultOptions
    );

    return watchId;
  };

  const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchLocation,
    clearWatch
  };
};

export default useGeolocation;
