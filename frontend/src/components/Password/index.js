"use client";  // Adicione esta linha no topo do arquivo

import React, { useState } from 'react';

const Password = ({ variant, icon, placeholder, onChange, value }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-full h-[6vh] px-[1.5vw] py-[1.2vh] rounded-lg shadow-[inset_0_0_4px_rgba(0,0,0,0.75)] flex justify-between items-center hover:bg-gray-200">
            <div className="flex items-center">
                <i className={`fa ${icon} text-gray-400`}></i>
                <input
                    type={showPassword ? 'text' : 'password'}
                    className={`ml-[0.4vw] bg-transparent text-black border-none focus:outline-none placeholder:text-gray-400 ${variant}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
            <i
                onClick={togglePasswordVisibility}
                className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 cursor-pointer`}
            ></i>
        </div>
    );
};

export default Password;
