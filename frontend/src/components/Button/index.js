const Button = ({ width, heigth, color, border, icon, name, onClick }) => {

    return (
        <button className={`${width} ${heigth} rounded-[15px] ${color} border ${border} cursor-pointer flex justify-center items-center`} onClick={onClick}>
            <span className="text-2xl font-semibold text-left text-white">{name}</span>
            {icon && <img src={icon} alt="icon" />}
        </button>
    );
}

export default Button;
