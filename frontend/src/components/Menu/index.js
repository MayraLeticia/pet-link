"use client";

import { useRouter } from 'next/navigation';


const Menu = () => {

    const router = useRouter();

    return (
        <div className="w-1/5 relative">
            <div id="sidebar" className="bg-custom-gradient h-screen w-1/5 fixed top-0 left-0 gap-8 px-8 py-12 flex flex-col justify-start items-start">

                <div className="flex justify-start items-center relative cursor-pointer" onClick={() => {router.push(`/home`)}}>
                    <img
                        src="/Logo.png"
                        className="w-16 h-16 object-cover"
                    />
                    <p className="text-3xl font-semibold text-left text-[#4d87fc] cursor-pointer">
                        Pet Link
                    </p>
                </div>


                <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1">

                    {/* adicionar select pet */}
                    
                    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0">

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent" onClick={() => {router.push(`/home`)}}>
                            <img src="icons/Paw.png" className="w-[26px] h-[25px] object-cover" />
                            <p className="text-base font-medium text-left text-black">
                                Home
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent" onClick={() => {router.push(`/salvos`)}}>
                            <img src="icons/Heart.png" className="w-[26px] h-[26px] object-cover" />
                            <p className="text-base font-medium text-left text-black">
                                Salvos
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent" onClick={() => {router.push(`/map`)}}>
                            <img src="icons/Map.png" className="w-[25px] h-[26px] object-cover" />
                            <p className="text-base font-medium text-left text-black">
                                Mapa
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-4 bg-transparent" onClick={() => {router.push(`/chat`)}}>
                            <img
                                src="icons/chat-bubbles-with-ellipsis.png"
                                className="w-[26px] h-[26px] object-cover"
                            />
                            <p className="text-base font-medium text-left text-black">
                                Menssagem
                            </p>
                        </button>

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
                        strokeWidth-={2}
                        strokeLinecap="round"
                    />
                </svg>


                <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1">

                    <p className="text-base font-medium text-left text-black">
                        Conversas frequentes
                    </p>

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-2 bg-transparent">
                        <img className="w-[26px] h-[26px] object-cover" src="/Logo.png" />
                        <p className="text-base font-medium text-left text-black">
                            User
                        </p>
                    </div>
                    
                </div>

            </div>

        </div>
    );
}


export default Menu;
