"use client";
import React, { useState } from 'react';
import api from '../services/api';

import { EditableInput } from "../components";

const Profile = () => {

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('api/user/login', { email, password });
//       localStorage.setItem('token', response.data.token); // Salvar o token no localStorage
//       alert('Login realizado com sucesso!');
//       console.log(response.data); // Ver detalhes da resposta
//     } catch (error) {
//       alert(error.response.data); // Exibir o erro retornado pelo back-end
//     }
//   };

    return (

       //isso deve ser mudado depois, vou fazer um layout com a parte do Component menu lateral
        <div id="profile" className="w-screen h-screen flex flex-row justify-center items-center"> 
            <div id="Component-menu-lateral" className="flex flex-col justify-center items-center bg-custom-gradient h-full w-1/4">
            </div>
           
            <div id="profile-container" className="flex  self-stretch flex-grow-0 flex-shrink-0 h-fit w-3/4 m-7">
                <div id="mensage" className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
                    
                    <p className="text-2xl font-medium text-left text-[#4d87fc]">
                        Seu perfil
                    </p>
                    <div className="flex flex-row justify-start items-start flex-grow-0 flex-shrink-0 gap-2">
                        <p className="text-sm font-medium text-left">
                            <span className="text-sm font-medium text-left text-black">Welcome, </span>
                            {/* //mudar pro nome do usuário */}
                            <span className="text-sm font-medium text-left text-[#ffa2df]">user</span> 
                            <span className="text-sm font-medium text-left text-black">!</span>
                        </p>
                        <svg
                            width={20}
                            height={20}
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 "
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <path
                            d="M2.70389 5.06419C3.22672 4.69877 4.01487 4.76885 4.4843 5.15652L3.9459 4.37394C3.51261 3.756 3.66779 3.08744 4.28629 2.6536C4.90479 2.22143 6.65739 3.38334 6.65739 3.38334C6.22022 2.75928 6.30198 1.96836 6.92604 1.53063C7.5501 1.09456 8.4111 1.24529 8.84828 1.87047L14.6439 10.0578L13.9053 17.2189L7.74088 14.9707L2.36405 6.99867C1.92298 6.37072 2.07538 5.50471 2.70389 5.06419Z"
                            fill="#EF9645"
                            />
                            <path
                            d="M1.49693 9.61885C1.49693 9.61885 0.867313 8.70112 1.7856 8.07205C2.70278 7.44298 3.33184 8.36016 3.33184 8.36016L6.25245 12.6196C6.35312 12.4516 6.46325 12.2859 6.58617 12.1223L2.53258 6.21155C2.53258 6.21155 1.90352 5.29436 2.82125 4.6653C3.73842 4.03623 4.36749 4.95341 4.36749 4.95341L8.18024 10.5138C8.32207 10.3981 8.46724 10.2818 8.61686 10.1678L4.19673 3.72086C4.19673 3.72086 3.56767 2.80368 4.4854 2.17461C5.40258 1.54555 6.03164 2.46273 6.03164 2.46273L10.4518 8.90858C10.6142 8.80902 10.7749 8.72281 10.9362 8.63159L6.80476 2.60679C6.80476 2.60679 6.17569 1.6896 7.09287 1.06054C8.01005 0.43147 8.63911 1.34865 8.63911 1.34865L13.0075 7.71941L13.6716 8.68832C10.9195 10.5761 10.6576 14.1274 12.2299 16.4207C12.5442 16.8795 13.0031 16.5653 13.0031 16.5653C11.1159 13.8126 11.6921 10.7196 14.4447 8.83238L13.6332 4.77098C13.6332 4.77098 13.3301 3.70084 14.3997 3.39715C15.4698 3.09402 15.7735 4.16416 15.7735 4.16416L16.7107 6.9474C17.0822 8.05091 17.4777 9.15053 18.0011 10.1906C19.4789 13.1274 18.5962 16.7772 15.8097 18.6889C12.77 20.773 8.61464 19.9982 6.53 16.9591L1.49693 9.61885Z"
                            fill="#FFDC5D"
                            />
                            <path
                            d="M6.67403 17.7985C4.44921 17.7985 2.20103 15.5503 2.20103 13.3255C2.20103 13.0179 1.97577 12.7693 1.66819 12.7693C1.36061 12.7693 1.08862 13.0179 1.08862 13.3255C1.08862 16.6627 3.3368 18.9109 6.67403 18.9109C6.98161 18.9109 7.23023 18.6389 7.23023 18.3313C7.23023 18.0237 6.98161 17.7985 6.67403 17.7985Z"
                            fill="#5DADEC"
                            />
                            <path
                            d="M3.89341 18.8874C2.2248 18.8874 1.1124 17.775 1.1124 16.1064C1.1124 15.7988 0.86378 15.5502 0.556201 15.5502C0.248622 15.5502 0 15.7988 0 16.1064C0 18.3312 1.6686 19.9998 3.89341 19.9998C4.20099 19.9998 4.44961 19.7512 4.44961 19.4436C4.44961 19.136 4.20099 18.8874 3.89341 18.8874ZM13.3488 1.08887C13.0418 1.08887 12.7926 1.33805 12.7926 1.64507C12.7926 1.9521 13.0418 2.20128 13.3488 2.20128C15.5736 2.20128 17.7984 4.19749 17.7984 6.65091C17.7984 6.95794 18.0476 7.20711 18.3546 7.20711C18.6617 7.20711 18.9108 6.95794 18.9108 6.65091C18.9108 3.584 16.686 1.08887 13.3488 1.08887Z"
                            fill="#5DADEC"
                            />
                            <path
                            d="M16.1299 0C15.8229 0 15.5737 0.225819 15.5737 0.532844C15.5737 0.839869 15.8229 1.11241 16.1299 1.11241C17.7985 1.11241 18.8876 2.34996 18.8876 3.87007C18.8876 4.17709 19.1596 4.42627 19.4672 4.42627C19.7747 4.42627 20 4.17709 20 3.87007C20 1.73591 18.3548 0 16.1299 0Z"
                            fill="#5DADEC"
                            />
                        </svg>
                    </div>
                
                </div>

                <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-12">
                    <div>
                    <EditableInput
                        label="Nome de Usuário"
                        apiEndpoint="/api/user/username" // Endpoint para pegar o valor inicial do campo
                    />

                    </div>
                </div>
           </div>
           
        </div>
    );
}


export default Profile;