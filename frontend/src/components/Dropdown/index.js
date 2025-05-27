import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione...",
  icon = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

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
          {label && (
            <p className="text-xs font-medium text-left text-[#646464]">{label}</p>
          )}
          <p className={`text-sm font-medium text-left whitespace-nowrap ${
            value ? 'text-[#ffa2df]' : 'text-gray-500'
          }`}>
            {displayText}
          </p>
        </div>

        {icon && (
          <img src={icon} className="w-4 h-4 object-cover opacity-70" alt="dropdown" />
        )}

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
        <div className="absolute top-full left-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-pink-50 text-[#ffa2df] font-medium border-l-2 border-[#ffa2df]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
