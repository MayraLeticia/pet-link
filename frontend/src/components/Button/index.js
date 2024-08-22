const Button = ({ variant, icon, name, onClick }) => {
    
    const baseClasses = "flex items-center justify-around px-3.2vh py-1.2vw rounded-lg border-none w-10vw h-6vh cursor-pointer hover:scale-[1.001] hover:shadow-[0_0_5px_rgba(0,0,0,0.25)]";
    const variantClasses = {
        "button-border-red": "border-2 border-[var(--color-bordor)] bg-transparent text-[var(--color-bordor)]",
        "button-border-green": "border-2 border-[var(--color-green-300)] bg-transparent text-[var(--color-green-300)]",
        "button-filled-green": "bg-[var(--color-green-300)] text-[var(--color-white)]",
        "button-filled-red": "bg-[var(--color-bordor)] text-[var(--color-white)]"
    };

    

    return (
        <button className={`${baseClasses} ${variantClasses[variant]}`} onClick={onClick}>
            <span className="font-semibold text-[2vh]">{name}</span>
            {icon && <img src={icon} alt="icon" />}
        </button>
    );
}

export default Button;
