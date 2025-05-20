import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input } from "../components";
import axios from 'axios';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, informe seu e-mail.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Chamar a API para enviar o email de redefinição de senha
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });

      setMessage({
        type: 'success',
        text: 'Um e-mail com instruções para redefinir sua senha foi enviado para o endereço informado.'
      });

      // Limpar o campo de email após o envio bem-sucedido
      setEmail('');
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);

      // Verificar se há uma mensagem de erro específica da API
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-custom-gradient">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#4d87fc]">Esqueceu sua senha?</h1>
          <p className="text-gray-600 mt-2">
            Informe seu e-mail e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Seu e-mail"
              width="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            name={isLoading ? "Enviando..." : "Enviar instruções"}
            disabled={isLoading}
            width="w-full"
            heigth="h-12"
            color="bg-[#4d87fc]"
            border="border-[#4d87fc]"
          />

          <div className="mt-6 text-center">
            <a
              onClick={() => router.push('/login')}
              className="text-[#4d87fc] hover:underline cursor-pointer"
            >
              Voltar para o login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
