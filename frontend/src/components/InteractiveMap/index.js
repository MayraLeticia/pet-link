import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const petIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center when user location changes
const MapUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

// Function to calculate distance between two points
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

const InteractiveMap = ({ userLocation, nearbyPets, onPetClick }) => {
  const [mapCenter, setMapCenter] = useState([-8.0476, -34.8770]); // Default to Recife
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setZoom(15);
    }
  }, [userLocation]);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-tl-lg leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={userLocation ? [userLocation.latitude, userLocation.longitude] : null} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Sua localização</strong>
                <br />
                Lat: {userLocation.latitude.toFixed(6)}
                <br />
                Lng: {userLocation.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pet markers */}
        {nearbyPets && nearbyPets.map((pet) => {
          if (!pet.coordinates || !pet.coordinates.coordinates) return null;

          const [lng, lat] = pet.coordinates.coordinates;
          const distance = userLocation
            ? calculateDistance(userLocation.latitude, userLocation.longitude, lat, lng)
            : 0;

          return (
            <Marker
              key={pet._id}
              position={[lat, lng]}
              icon={petIcon}
              eventHandlers={{
                click: () => onPetClick && onPetClick(pet)
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{pet.name}</strong>
                  <br />
                  {pet.specie} - {pet.race}
                  <br />
                  {pet.age} - {pet.gender}
                  <br />
                  {distance > 0 && (
                    <>
                      Distância: {distance < 1000
                        ? `${Math.round(distance)}m`
                        : `${(distance/1000).toFixed(1)}km`
                      }
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
