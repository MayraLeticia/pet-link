"use client";

import { useRouter } from 'next/navigation';

const Menu = () => {
    const router = useRouter();

    // Menu para desktop
    const DesktopMenu = () => (
        <div className="menu-desktop w-1/4 relative">
            <div id="sidebar" className="menu-sidebar bg-custom-gradient h-screen fixed top-0 left-0 gap-8 px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12 flex flex-col justify-start items-start overflow-y-auto">
                <div className="flex justify-start items-center absolute top-3 left-3 cursor-pointer" onClick={() => {router.push(`/home`)}}>
                    <img
                        src="/Logo.png"
                        className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-cover"
                    />
                    <p className="text-l md:text-xl lg:text-2xl font-semibold text-left text-[#4d87fc] cursor-pointer ml-2">
                        Pet Link
                    </p>
                </div>

                <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1 w-full mt-6">
                    <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 w-full">
                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/home`)}}>
                            <img src="icons/Paw.png" className="w-[22px] h-[22px] md:w-[26px] md:h-[25px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Home
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/salvos`)}}>
                            <img src="icons/Heart.png" className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Salvos
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/map`)}}>
                            <img src="icons/Map.png" className="w-[22px] h-[22px] md:w-[25px] md:h-[26px] object-cover ml-2" />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Mapa
                            </p>
                        </button>

                        <button className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-3 md:py-4 bg-transparent w-full hover:bg-white/20 rounded-md transition-all" onClick={() => {router.push(`/chat`)}}>
                            <img
                                src="icons/chat-bubbles-with-ellipsis.png"
                                className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover ml-2"
                            />
                            <p className="text-sm md:text-base font-medium text-left text-black">
                                Mensagem
                            </p>
                        </button>
                    </div>
                </div>

                <div className="w-full my-4">
                    <div className="h-[1px] bg-[#646464]/70 w-full"></div>
                </div>

                <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1 w-full">
                    <p className="text-sm md:text-base font-medium text-left text-black px-2">
                        Conversas frequentes
                    </p>

                    <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4 py-2 bg-transparent w-full hover:bg-white/20 rounded-md transition-all px-2">
                        <img className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-cover" src="/Logo.png" />
                        <p className="text-sm md:text-base font-medium text-left text-black">
                            User
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Menu para mobile
    const MobileMenu = () => (
        <div className="menu-mobile hidden fixed bottom-0 left-0 w-full h-[70px] bg-white shadow-lg z-50 px-2 py-1">
            <button className="menu-mobile-item" onClick={() => {router.push(`/home`)}}>
                <img src="icons/Paw.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Home</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/salvos`)}}>
                <img src="icons/Heart.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Salvos</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/map`)}}>
                <img src="icons/Map.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Mapa</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/chat`)}}>
                <img src="icons/chat-bubbles-with-ellipsis.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Mensagem</p>
            </button>

            <button className="menu-mobile-item" onClick={() => {router.push(`/profile`)}}>
                <img src="/Logo.png" className="w-[24px] h-[24px] object-cover" />
                <p className="text-xs font-medium text-center text-black">Perfil</p>
            </button>
        </div>
    );

    return (
        <>
            <DesktopMenu />
            <MobileMenu />
        </>
    );
}


export default Menu;
