const Input = ({ type, placeholder, value, onChange, width }) => {
    return (
        <div className={`flex-grow-0 flex-shrink-0 ${width} h-auto`}>
            <div className={`flex justify-center items-center w-full h-16 rounded-[15px] bg-[#e8f0fe]`}>
                <input
                    type={type}
                    className={`w-full ml-[0.4vw] p-4 border-none bg-transparent text-black focus:outline-none placeholder:text-[#b3b3b3]`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

export default Input;
