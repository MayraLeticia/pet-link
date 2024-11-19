
"use client";
import React, { useState } from 'react';
import api from '../services/api';
import { useRouter } from 'next/router';

import { Button, Checkbox, Input } from "../components";
import { signIn, useSession } from 'next-auth/react';
// import Google from "../../public/icons/Google.png";
// import Meta from "../../public/icons/Meta.png";

// const YourComponent = () => {
//   const { data: session } = useSession();
//   if (session) {
//     return <p>Logado como {session.user.email}</p>;
//   }
//   return <p>Não está logado</p>;
// };

const Login = () => {

  const router = useRouter(); // Hook para navegação
  // const { data: session } = useSession(); //verifica se o usuário está logado e exibir informações, como o email do usuário, na interface
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('api/user/login', { email, password });
      localStorage.setItem('token', response.data.token); // Salvar o token no localStorage
      alert('Login realizado com sucesso!');
      router.push('/profile'); // Redirecionar para a página de perfil
      // console.log(response.data); // Ver detalhes da resposta
    } catch (error) {
      alert(error.response?.data || "Erro ao fazer login"); // Exibir erro retornado pelo backend
    }
  };


    return (
       
        <div id="login" className="w-screen h-screen flex flex-row justify-center items-center"> 
          <div id="left-side" className="flex flex-col justify-center items-center bg-custom-gradient h-screen w-1/2">
            <div className="flex-grow-0 flex-shrink-0">
                {/* <img
                    src="design-sem-nome-(6)-1.png"
                    className="w-[67px] h-[67px] absolute left-[9.5px] top-[14.5px] object-cover"
                /> */}
                <p className="absolute left-[77px] top-6 text-[32px] font-semibold text-left text-[#4d87fc]">
                    Pet Link
                </p>
            </div>
            <div id="init" className="flex flex-col justify-start items-center flex-grow-0 flex-shrink-0 gap-12">
                <img src='/image.svg' alt="bichinhos" className="w-96 h-96"/>
                <div className="flex flex-col justify-start items-center flex-grow-0 flex-shrink-0 gap-6">
                    <p className="self-stretch flex-grow-0 flex-shrink-0 text-3xl font-bold text-center text-[#212334]">
                        O seu bichinho tambêm merece amor.
                    </p>
                    <p className="self-stretch flex-grow-0 flex-shrink-0 text-xl text-center text-[#585b7a]">
                        Entre agora pra nossa turma!
                    </p>
                </div>
                {/* <div className="flex-grow-0 flex-shrink-0 w-[535px] h-[86px]">
                    <div className="w-[535px] h-[86px] absolute left-[12.5px] top-[806.5px] rounded-[15px] bg-white/20 border border-[#cdcdcd]/[0.66]" />
                        <p className="w-[130px] h-[33px] absolute left-[81px] top-[834px] text-xl text-center text-[#646464]">
                            Registrar
                        </p>
                        <div className="w-[268px] h-[84px]">

                        <div
                        className="w-[268px] h-[84px] absolute left-[279.5px] top-[808.5px] rounded-[15px] bg-white/50 border border-[#cdcdcd]/[0.66]"
                        style={{ boxShadow: "0px 0px 4px 0 rgba(0,0,0,0.25)" }}
                        />
                        <p className="w-[77px] h-[33px] absolute left-[377px] top-[834px] text-xl text-center text-[#646464]">
                        Login
                        </p>
                    </div>
                </div> */}
          
            
            </div>
          </div>
           
          <form  onSubmit={handleLogin} id="right-side" className="flex flex-col justify-center items-center self-stretch flex-grow-0 flex-shrink-0 gap-6 h-screen w-1/2 py-7 px-28">
            <div id="mensage" class="flex flex-col justify-start items-center gap-4">
              <div class=" flex justify-center items-center flex-row flex-grow-0 flex-shrink-0 ">
                <p class="text-4xl font-bold text-center text-[#212334]">
                  Olá de novo!
                </p>
                <svg  
                  width="39"
                  height="37"
                  viewBox="0 0 39 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="ml-3"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M5.58796 9.30645C6.58489 8.6349 8.08773 8.76369 8.98285 9.47612L7.95621 8.03798C7.13003 6.90238 7.42593 5.67377 8.60528 4.87651C9.78464 4.08231 13.1265 6.21755 13.1265 6.21755C12.2929 5.07071 12.4488 3.61723 13.6388 2.81281C14.8287 2.01146 16.4705 2.28846 17.3041 3.43734L28.3553 18.4832L26.9468 31.6432L15.1925 27.5117L4.93995 12.8614C4.09891 11.7074 4.38951 10.116 5.58796 9.30645Z"
                    fill="#EF9645"
                  ></path>
                  <path
                    d="M3.28656 17.6767C3.28656 17.6767 2.086 15.9902 3.83699 14.8341C5.58587 13.6781 6.78537 15.3636 6.78537 15.3636L12.3544 23.1911C12.5464 22.8824 12.7564 22.5778 12.9907 22.2773L5.26133 11.4151C5.26133 11.4151 4.06183 9.72957 5.81177 8.57353C7.56064 7.4175 8.76014 9.103 8.76014 9.103L16.0303 19.3213C16.3008 19.1087 16.5776 18.8951 16.8629 18.6855L8.43455 6.83794C8.43455 6.83794 7.23505 5.15244 8.98498 3.9964C10.7339 2.84037 11.9334 4.52587 11.9334 4.52587L20.3617 16.3714C20.6714 16.1884 20.9779 16.03 21.2854 15.8624L13.4075 4.7906C13.4075 4.7906 12.208 3.1051 13.9569 1.94907C15.7058 0.793029 16.9053 2.47853 16.9053 2.47853L25.235 14.1861L26.5013 15.9666C21.2536 19.4358 20.7541 25.9621 23.7523 30.1764C24.3515 31.0197 25.2265 30.4421 25.2265 30.4421C21.628 25.3836 22.7267 19.6995 27.9755 16.2314L26.4281 8.76774C26.4281 8.76774 25.8501 6.80115 27.8896 6.24306C29.9301 5.686 30.5092 7.65259 30.5092 7.65259L32.2962 12.7674C33.0047 14.7953 33.7587 16.816 34.7567 18.7274C37.5747 24.1243 35.8915 30.8316 30.5781 34.3447C24.7821 38.1746 16.8586 36.7508 12.8836 31.1658L3.28656 17.6767Z"
                    fill="#FFDC5D"
                  ></path>
                  <path
                    d="M13.158 32.7085C8.91573 32.7085 4.6289 28.577 4.6289 24.4884C4.6289 23.9232 4.19936 23.4663 3.61287 23.4663C3.02637 23.4663 2.50775 23.9232 2.50775 24.4884C2.50775 30.6213 6.79459 34.7527 13.158 34.7527C13.7445 34.7527 14.2186 34.2529 14.2186 33.6877C14.2186 33.1224 13.7445 32.7085 13.158 32.7085Z"
                    fill="#5DADEC"
                  ></path>
                  <path
                    d="M7.85591 34.7096C4.67421 34.7096 2.55308 32.6653 2.55308 29.5989C2.55308 29.0337 2.07901 28.5768 1.49251 28.5768C0.906019 28.5768 0.431946 29.0337 0.431946 29.5989C0.431946 33.6875 3.61364 36.7539 7.85591 36.7539C8.4424 36.7539 8.91648 36.297 8.91648 35.7317C8.91648 35.1665 8.4424 34.7096 7.85591 34.7096ZM25.8855 2.00122C25.3001 2.00122 24.825 2.45914 24.825 3.02336C24.825 3.58758 25.3001 4.04549 25.8855 4.04549C30.1278 4.04549 34.3701 7.71394 34.3701 12.2226C34.3701 12.7868 34.8452 13.2447 35.4306 13.2447C36.0161 13.2447 36.4912 12.7868 36.4912 12.2226C36.4912 6.58653 32.2489 2.00122 25.8855 2.00122Z"
                    fill="#5DADEC"
                  ></path>
                  <path
                    d="M31.1888 0C30.6034 0 30.1282 0.414987 30.1282 0.979207C30.1282 1.54343 30.6034 2.04427 31.1888 2.04427C34.3705 2.04427 36.4471 4.31853 36.4471 7.11203C36.4471 7.67625 36.9657 8.13416 37.5522 8.13416C38.1387 8.13416 38.5683 7.67625 38.5683 7.11203C38.5683 3.19009 35.4311 0 31.1888 0Z"
                    fill="#5DADEC"
                  ></path>
                </svg>
              </div>
              <p class="self-stretch flex-grow-0 flex-shrink-0 text-xl text-center text-[#585b7a]">
                Bem-vindo de volta á plataforma, entre e divirta-se!
              </p>
              {/* Exibe o estado da sessão
              {session ? (
                <p className="text-green-500">Logado como {session.user.email}</p>
              ) : (
                <p className="text-red-500">Não está logado</p>
              )} */}
                </div>
              <div id="form" className="w-full flex flex-col justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-4">
                <Input placeholder="E-mail" width="w-full" onChange={(e) => setEmail(e.target.value)}/>
                <Input placeholder="Senha" width="w-full" onChange={(e) => setPassword(e.target.value)}/>   
              </div>
              <div id="settings" className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-[220px]">
                <p className="flex-grow-0 flex-shrink-0 text-base font-light text-left text-[#646464] cursor-pointer">
                  <a>Esqueceu a senha?</a>
                </p>
                <Checkbox nome="Mostrar senha"/>
              </div>
              <Button 
                type="submit"
                name="Entrar"
                width="w-full"
                heigth="h-16"
                color="bg-[#ffa2df]"
                border="border-[#fc7bcf]"
                className="hover:bg-[#fc7bcf]"
              />
            <div class="flex flex-row justify-center items-center flex-grow-0 flex-shrink-0 ">  
                <svg
                    width="241"
                    height="3"
                    viewBox="0 0 241 3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class=""
                    preserveAspectRatio="none"
                >
                    <path
                    d="M1.50009 1.78101L239.513 1.78101"
                    stroke="#B3B3B3"
                    stroke-width="2"
                    stroke-linecap="round"
                    >
                    </path>
                </svg>
                <p class="ml-2 mr-2 text-sm font-light text-left text-[#646464]">
                    ou
                </p>
                <svg
                    width="241"
                    height="3"
                    viewBox="0 0 241 3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class=""
                    preserveAspectRatio="none"
                >
                    <path
                    d="M1.48676 1.78101L239.5 1.78101"
                    stroke="#B3B3B3"
                    stroke-width="2"
                    stroke-linecap="round"
                    >
                    </path>
                </svg>
            </div>
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 gap-12">
                <Button
                  icon='/icons/Google.png'
                  onClick={() => signIn('google')}
                  width="w-[75px]"
                  height="h-[75px]"
                  color="bg-[#e8f0fe]"
                  border="border-[#d6ddea]"
                />
                <Button
                  icon='/icons/Meta.png'
                  onClick={() => signIn('facebook')}
                  width="w-[75px]"
                  height="h-[75px]"
                  color="bg-[#e8f0fe]"
                  border="border-[#d6ddea]"
                />
            </div>
            <div className="flex flex-col justify-start items-center flex-grow-0 flex-shrink-0 gap-1">
                <p className="flex-grow-0 flex-shrink-0 text-base font-light text-left text-[#646464]">
                    Não possui uma conta?
                </p>
                <p className="flex-grow-0 flex-shrink-0 text-base font-light text-left text-[#407bff] cursor-pointer">
                   <a>Registre-se</a> 
                </p>
            </div>



            
           </form>
           
        </div>
    );
}


export default Login;