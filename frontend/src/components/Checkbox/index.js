import React from 'react';

const Checkbox = ({nome}) => {
  return (
    <div className="flex justify-center items-center flex-row flex-grow-0 flex-shrink-0 w-[163px] h-[35px] relative">
      <div className="w-[35px] h-[35px] rounded-[5px] bg-white border border-[#E4E4E4]">
        <input
          type="checkbox"
          className="w-full h-full cursor-pointer opacity-0"
        />
        {/* <div className="pointer-events-none w-full h-full rounded-[5px] bg-white border border-[#E4E4E4] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="hidden w-4 h-4 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div> */}
      </div>
      <p className="ml-2 text-base font-light text-left text-[#646464]">
        {nome}
      </p>
    </div>
  );
};

export default Checkbox;
