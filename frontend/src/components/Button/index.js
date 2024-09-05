const Button = ({ width, heith, color, border, icon, name, onClick }) => {

    return (
        <button className={`${width} ${heith} rounded-[15px] ${color} border ${border} cursor-pointer`} onClick={onClick}>
            <span className="text-2xl font-semibold text-left text-white">{name}</span>
            {icon && <img src={icon} alt="icon" />}
        </button>
    );
}

export default Button;
