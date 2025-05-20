const Input = ({ type, placeholder, value, onChange, width }) => {
    return (
        <div className={`flex-grow-0 flex-shrink-0 ${width || 'w-full'} h-auto`}>
            <div className={`flex justify-center items-center w-full h-14 rounded-[15px] bg-[#e8f0fe]`}>
                <input
                    type={type || 'text'}
                    className={`w-full p-3 border-none bg-transparent text-black focus:outline-none placeholder:text-[#b3b3b3]`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

export default Input;
