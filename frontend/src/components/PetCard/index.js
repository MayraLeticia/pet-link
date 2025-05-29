import React from 'react';

const PetCard = ({ pet, distance, onLike, onDislike, onChat, isOnline = true }) => {
  const formatDistance = (distanceInMeters) => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  };

  const getImageUrl = (imgAnimal) => {
    if (!imgAnimal) return null;

    // Se for um array, pega a primeira imagem
    const imageKey = Array.isArray(imgAnimal) ? imgAnimal[0] : imgAnimal;

    // Se a imagem já for uma URL completa, retorna ela
    if (imageKey && imageKey.startsWith('http')) {
      return imageKey;
    }

    // Caso contrário, constrói a URL com base na chave
    return imageKey ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${imageKey}` : null;
  };

  const imageUrl = getImageUrl(pet.imgAnimal);

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2 p-3 rounded-lg bg-white pet-card"
         style={{ boxShadow: "0px 0px 2px 0 rgba(0,0,0,0.25)" }}>

      <div className="flex justify-start items-center gap-4 w-full">
        <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-full h-full bg-slate-600 flex items-center justify-center text-white text-xs"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            {pet.name ? pet.name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>

        <div className="flex justify-start items-center gap-1 flex-grow">
          <p className="text-base font-medium text-left text-[#1e1e1e] truncate">
            {pet.name || 'Pet sem nome'}
          </p>
          {isOnline && (
            <div className="w-2 h-2 rounded-full bg-[#14FF0F] flex-shrink-0"></div>
          )}
        </div>

        {distance !== undefined && (
          <p className="text-sm font-light text-left text-[#646464] flex-shrink-0">
            {formatDistance(distance)}
          </p>
        )}
      </div>

      {/* Pet details */}
      <div className="w-full pl-14">
        <div className="text-xs text-gray-600 mb-2">
          {pet.specie && <span>{pet.specie}</span>}
          {pet.race && <span> • {pet.race}</span>}
          {pet.age && <span> • {pet.age}</span>}
          {pet.gender && <span> • {pet.gender}</span>}
        </div>

        {pet.description && (
          <p className="text-xs text-gray-700 mb-2 line-clamp-2">
            {pet.description}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center self-stretch pl-14">
        <div className="flex justify-start items-center gap-2">
          <button
            onClick={() => onDislike && onDislike(pet)}
            className="flex justify-center items-center w-7 h-7 rounded-full border border-[#646464] hover:bg-gray-100 transition-colors"
          >
            <img
              src="/icons/Dislike.png"
              className="w-4 h-4 object-cover"
              alt="Dislike"
            />
          </button>
          <button
            onClick={() => onLike && onLike(pet)}
            className="flex justify-center items-center w-7 h-7 rounded-full border border-[#646464] hover:bg-red-50 transition-colors"
          >
            <img
              src="/icons/Heart.png"
              className="w-4 h-4 object-cover"
              alt="Like"
            />
          </button>
        </div>
        <button
          onClick={() => onChat && onChat(pet)}
          className="flex justify-center items-center w-7 h-7 rounded-full bg-[#ffa2df] hover:bg-[#ff8fd4] transition-colors"
        >
          <img
            src="/icons/chat-bubbles-with-ellipsis.png"
            className="w-4 h-4 object-cover"
            alt="Chat"
          />
        </button>
      </div>
    </div>
  );
};

export default PetCard;
