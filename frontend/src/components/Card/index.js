const Card = ({ profilePhoto, name, location, onClick }) => {

    return (
        <div id='card' className="w-60 h-60 rounded-lg bg-custom-gradient flex flex-col cursor-pointer" onClick={onClick}>
            <div className="w-full h-3/4">
            
                <img
                    src={profilePhoto}
                    alt={name}
                    className="w-full h-full object-cover rounded-t-lg"
                />
                
                
                <div className='w-1/2 h-auto gap-5 flex relative left-36 -top-40'>
                    <div className='w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 bg-opacity-60'>
                        <img src="icons/Heart.png" className="w-[19px] h-[19px] object-cover" />
                    </div>
                    <div className='w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 bg-opacity-60'>
                        <img src="icons/Dislike.png" className="w-[19px] h-[19px] object-cover" />
                    </div>
                </div>
                
            </div>
            
            <div className="w-full h-1/4 rounded-r-lg p-2">
                <p className="text-sm font-bold text-left text-black">{name}</p>
                <p className="text-xs font-medium text-left text-slate-950 opacity-40">
                    {location}
                </p>
                    
                <div className='w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 bg-opacity-60 relative left-48 -top-7'>
                    <img src="icons/chat-bubbles-with-ellipsis.png" className="w-[19px] h-[19px] object-cover" />
                </div>

            </div>

        </div>
    );
}

export default Card;
