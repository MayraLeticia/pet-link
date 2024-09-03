const Input = ({ icon, type, placeholder, value, onChange, label }) => {
    return (
        <div className="w-[536.96px] h-[73.51px] rounded-[15px] bg-[#e8f0fe]">
            <div className="w-full h-[8vh] px-[1.5vw] py-[1.2vh] border border-gray-300 rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-white flex items-center">
                <i className={`fa ${icon} text-gray-400`}></i>
                <input
                    type={type}
                    className="w-full ml-[0.4vw] border-none bg-transparent text-black focus:outline-none placeholder:text-[#b3b3b3]"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

export default Input;
