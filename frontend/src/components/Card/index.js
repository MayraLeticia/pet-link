const Card = ({ profilePhoto, user }) => {

    return (
        <div id='card' className="w-60 h-60 rounded-lg bg-custom-gradient flex flex-col">
            <div className="w-full h-3/4">
            
                <img
                    src={profilePhoto}
                    className="w-full h-full object-cover rounded-t-lg"
                />
                
                
                <div className='w-1/2 h-auto gap-5 flex relative left-40 -top-40'>
                    <div className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-950 bg-opacity-60'>
                        <img src="heart.png" className="w-[19px] h-[19px] object-cover" />
                    </div>
                    <div className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-950 bg-opacity-60'>
                        <img src="dislike.png" className="w-[19px] h-[19px] object-cover" />
                    </div>
                </div>
                
            </div>
            
            <div className="w-full h-1/4 rounded-r-lg p-2">
                <p className="text-sm font-medium text-left text-black">
                    nome do usuário
                </p>
                <p className="text-xs font-normal text-left text-slate-950 opacity-25">distancia</p>
                    
                <div className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-950 bg-opacity-60 relative left-48 -top-7'>
                    <img src="chat-bubbles-with-ellipsis.png" className="w-[19px] h-[19px] object-cover" />
                </div>

            </div>

        </div>
    );
}

export default Card;
