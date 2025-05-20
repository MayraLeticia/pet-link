const Button = ({ width, heigth, color, border, icon, name, text, onClick, type = "button", disabled = false }) => {
    const buttonText = text || name; // Usar text se fornecido, senão usar name

    return (
        <button
            type={type}
            disabled={disabled}
            className={`${width || 'w-full'} ${heigth || 'h-12'} rounded-[15px] ${color || 'bg-[#4d87fc]'} border ${border || 'border-[#4d87fc]'} cursor-pointer flex justify-center items-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
        >
            <span className="text-xl font-semibold text-center text-white">{buttonText}</span>
            {icon && <img src={icon} alt="icon" />}
        </button>
    );
}

export default Button;
