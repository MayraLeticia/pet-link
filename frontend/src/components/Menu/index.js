
const Menu = () => {
    return (
        <div id="sidebar" className="bg-custom-gradient h-full w-1/5 sticky top-0 left-0 gap-8 px-8 py-12 flex flex-col justify-start items-start">

            <div className="flex justify-start items-center relative">
                <img
                    src="/Logo.png"
                    className="w-[67px] h-[67px] object-cover"
                />
                <p className="text-[32px] font-semibold text-left text-[#4d87fc]">
                    Pet Link
                </p>
            </div>


            <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1">

                {/* adicionar select pet */}
                
                <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0">

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent">
                        <img src="/Paw.png" className="w-[26px] h-[25px] object-cover" />
                        <p className="text-base font-medium text-left text-black">
                            Home
                        </p>
                    </div>

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent">
                        <img src="/Heart.png" className="w-[26px] h-[26px] object-cover" />
                        <p className="text-base font-medium text-left text-black">
                            Salvos
                        </p>
                    </div>

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent">
                        <img src="/Map.png" className="w-[25px] h-[26px] object-cover" />
                        <p className="text-base font-medium text-left text-black">
                            Mapa
                        </p>
                    </div>

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent">
                        <img
                            src="chat-bubbles-with-ellipsis.png"
                            className="w-[26px] h-[26px] object-cover"
                        />
                        <p className="text-base font-medium text-left text-black">
                            Menssagem
                        </p>
                    </div>

                </div>
            </div>


            <svg
                width={272}
                height={2}
                viewBox="0 0 272 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow-0 flex-shrink-0"
                preserveAspectRatio="none"
            >
                <path
                    d="M1 1H271"
                    stroke="#646464"
                    stroke-opacity="0.7"
                    stroke-width={2}
                    stroke-linecap="round"
                />
            </svg>


            <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1">

                <p className="text-base font-medium text-left text-black">
                    Conversas frequentes
                </p>

                <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-2 bg-transparent">
                    <img className="w-[26px] h-[26px] object-cover" src="ellipse-3-3.png" />
                    <p className="text-base font-medium text-left text-black">
                        User
                    </p>
                </div>
                
            </div>

        </div>
    );
}


export default Menu;
