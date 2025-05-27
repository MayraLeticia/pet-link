import React, { useState, useRef, useEffect } from 'react';

const RadiusSlider = ({
  value,
  onChange,
  className = "",
  onApply = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const dropdownRef = useRef(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setTempValue(value); // Reset temp value if closed without applying
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value]);

  // Update temp value when prop value changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${meters / 1000}km`;
    }
  };

  const handleSliderChange = (e) => {
    setTempValue(Number(e.target.value));
  };

  const handleApply = () => {
    onChange(tempValue);
    if (onApply) {
      onApply(tempValue);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`flex flex-row justify-center items-center w-fit h-fit gap-3 px-3 py-2 rounded-full border cursor-pointer transition-all duration-200 ${
          isOpen
            ? 'border-[#ffa2df] bg-pink-50 shadow-sm'
            : 'border-[#646464] hover:bg-gray-50 hover:border-gray-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col justify-start items-start gap-0">
          <p className="text-xs font-medium text-left text-[#646464]">Proximidade</p>
          <p className="text-sm font-medium text-left text-[#ffa2df] whitespace-nowrap">
            {formatDistance(value)}
          </p>
        </div>

        <svg
          className={`w-3 h-3 transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] p-5">
          <div className="space-y-5">
            <h3 className="text-base font-medium text-gray-700">Selecione o raio:</h3>

            {/* Slider */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={tempValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #4d87fc 0%, #4d87fc ${((tempValue - 200) / (10000 - 200)) * 100}%, #e5e7eb ${((tempValue - 200) / (10000 - 200)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              {/* Current value display */}
              <div className="text-center">
                <span className="text-lg font-semibold text-[#4d87fc]">{formatDistance(tempValue)}</span>
              </div>

              {/* Range labels */}
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>200m</span>
                <span>1km</span>
                <span>5km</span>
                <span>10km</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-[#4d87fc] text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4d87fc;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4d87fc;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default RadiusSlider;
