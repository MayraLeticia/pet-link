import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: '/icons/marker-icon.png',
  iconRetinaUrl: '/icons/marker-icon-2x.png',
  shadowUrl: '/icons/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom user location marker icon
const UserIcon = L.icon({
  iconUrl: '/icons/Map.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Create colored pet icons
const DogIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#4d87fc; padding:5px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:30px; height:30px;">
           <img src="/icons/Paw.png" style="width:20px; height:20px; filter:invert(1);" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const CatIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#ffa2df; padding:5px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:30px; height:30px;">
           <img src="/icons/Paw.png" style="width:20px; height:20px; filter:invert(1);" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const BirdIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#ffcc00; padding:5px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:30px; height:30px;">
           <img src="/icons/Paw.png" style="width:20px; height:20px; filter:invert(1);" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const RodentIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#8bc34a; padding:5px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:30px; height:30px;">
           <img src="/icons/Paw.png" style="width:20px; height:20px; filter:invert(1);" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const ReptileIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#009688; padding:5px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:30px; height:30px;">
           <img src="/icons/Paw.png" style="width:20px; height:20px; filter:invert(1);" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const DefaultPetIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#9c27b0; padding:5px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:30px; height:30px;">
           <img src="/icons/Paw.png" style="width:20px; height:20px; filter:invert(1);" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// Custom pet marker icons based on species
const createPetIcon = (species) => {
  // Return the appropriate icon based on species
  switch(species?.toLowerCase()) {
    case 'cachorro':
      return DogIcon;
    case 'gato':
      return CatIcon;
    case 'ave':
      return BirdIcon;
    case 'roedor':
      return RodentIcon;
    case 'réptil':
      return ReptileIcon;
    default:
      // Use default pet marker for unknown species
      return DefaultPetIcon;
  }
};

// Component to recenter map when user location changes
function SetViewOnLocation({ coords }) {
  const map = useMap();

  // Set view only when coords change, not on every render
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15);
    }
  }, [coords, map]);

  // Add event listener to prevent location change on map click
  useEffect(() => {
    // This function will be called when the map is clicked
    const handleMapClick = (e) => {
      // Prevent the default behavior that would change the location
      e.originalEvent.stopPropagation();
    };

    // Add the event listener
    map.on('click', handleMapClick);

    // Clean up the event listener when the component unmounts
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map]);

  return null;
}

// Component to handle map clicks for manual location setting
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}

const MapComponent = ({
  userLocation,
  nearbyPets,
  radius,
  locationAccuracy,
  updateManualLocation
}) => {
  // Inicializar os ícones quando o componente é montado
  useEffect(() => {
    // Garantir que os ícones sejam carregados corretamente
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: '/icons/marker-icon.png',
      iconRetinaUrl: '/icons/marker-icon-2x.png',
      shadowUrl: '/icons/marker-shadow.png',
    });
  }, []);

  if (!userLocation) {
    return <div className="flex items-center justify-center w-full h-full">Aguardando localização...</div>;
  }

  return (
    <MapContainer
      center={userLocation}
      zoom={15}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      className="z-0"
      dragging={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      zoomControl={true}
      touchZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker with accuracy circle */}
      <Marker position={userLocation} icon={UserIcon}>
        <Popup>
          <div>
            <p className="font-bold">Sua localização</p>
            <p>Latitude: {userLocation[0].toFixed(6)}</p>
            <p>Longitude: {userLocation[1].toFixed(6)}</p>
            {locationAccuracy && (
              <p>Precisão: ±{Math.round(locationAccuracy)} metros</p>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Accuracy circle */}
      {locationAccuracy && (
        <Circle
          center={userLocation}
          radius={locationAccuracy}
          pathOptions={{ color: '#4d87fc', fillColor: '#4d87fc', fillOpacity: 0.1 }}
        />
      )}

      {/* Search radius circle */}
      <Circle
        center={userLocation}
        radius={radius * 1000} // Convert km to meters
        pathOptions={{ color: '#ffa2df', fillColor: '#ffa2df', fillOpacity: 0.15, weight: 2 }}
      />

      {/* Pet markers */}
      {nearbyPets.map((pet) => (
        pet.coordinates && pet.coordinates.coordinates && (
          <Marker
            key={pet._id}
            position={[pet.coordinates.coordinates[1], pet.coordinates.coordinates[0]]}
            icon={createPetIcon(pet.specie)}
          >
            <Popup>
              <div className="flex flex-col items-center">
                <h3 className="font-bold">{pet.name}</h3>
                <p>{pet.specie} {pet.race ? `- ${pet.race}` : ''}</p>
                <p>{pet.age} anos</p>
                <p>{pet.gender} - {pet.size}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {/* Only add LocationMarker if updateManualLocation is provided */}
      {updateManualLocation && (
        <LocationMarker
          position={userLocation}
          setPosition={updateManualLocation}
        />
      )}

      <SetViewOnLocation coords={userLocation} />
    </MapContainer>
  );
};

export default MapComponent;
