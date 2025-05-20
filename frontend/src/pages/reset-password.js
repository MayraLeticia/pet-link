import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Input } from "../components";
import axios from 'axios';

const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Verificar se o token é válido quando a página carrega
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (error) {
        console.error('Token inválido ou expirado:', error);
        setTokenValid(false);
        setMessage({
          type: 'error',
          text: 'O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.'
        });
      } finally {
        setTokenChecked(true);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Chamar a API para redefinir a senha
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        token,
        password
      });

      setMessage({
        type: 'success',
        text: 'Sua senha foi redefinida com sucesso! Você será redirecionado para a página de login.'
      });

      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);

      // Verificar se há uma mensagem de erro específica da API
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao redefinir sua senha. Tente novamente mais tarde.';

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar mensagem de carregamento enquanto verifica o token
  if (!tokenChecked) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-gray-600">Verificando link de redefinição de senha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#4d87fc]">Redefinir Senha</h1>
          <p className="text-gray-600 mt-2">
            {tokenValid
              ? 'Crie uma nova senha para sua conta.'
              : 'O link de redefinição de senha é inválido ou expirou.'}
          </p>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {tokenValid ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Nova senha"
                width="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme a nova senha"
                width="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              name={isLoading ? "Redefinindo..." : "Redefinir Senha"}
              disabled={isLoading}
              width="w-full"
              heigth="h-12"
              color="bg-[#4d87fc]"
              border="border-[#4d87fc]"
            />
          </form>
        ) : (
          <div className="text-center">
            <Button
              name="Solicitar novo link"
              onClick={() => router.push('/forgot-password')}
              width="w-full"
              heigth="h-12"
              color="bg-[#4d87fc]"
              border="border-[#4d87fc]"
            />
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            onClick={() => router.push('/login')}
            className="text-[#4d87fc] hover:underline cursor-pointer"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
