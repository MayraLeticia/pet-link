const Button = ({ variant, icon, name, onClick }) => {

    return (
        <button className="w-[536.96px] h-[73.51px] rounded-[15px] bg-[#ffa2df] border border-[#fc7bcf] cursor-pointer hover:bg-[#fc7bcf]" onClick={onClick}>
            <span className="text-2xl font-semibold text-left text-white">{name}</span>
            {icon && <img src={icon} alt="icon" />}
        </button>
    );
}

export default Button;
