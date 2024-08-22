const Input = ({ icon, type, placeholder, value, onChange, label }) => {
    return (
        <div className="w-full flex flex-col justify-center items-start">
            <label className="text-sm font-semibold mb-[0.8vh]">{label}</label>
            <div className="w-full h-[8vh] px-[1.5vw] py-[1.2vh] border border-gray-300 rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-white flex items-center">
                <i className={`fa ${icon} text-gray-400`}></i>
                <input
                    type={type}
                    className="w-full ml-[0.4vw] border-none bg-transparent text-black focus:outline-none placeholder:text-gray-400"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

export default Input;
