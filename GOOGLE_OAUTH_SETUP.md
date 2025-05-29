# Configuração do Google OAuth para Pet Link

## Passos para configurar o Google OAuth:

### 1. Criar um projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ ou Google Identity

### 2. Configurar OAuth 2.0

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure o tipo de aplicação como "Web application"
4. Adicione as seguintes URLs autorizadas:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `https://seu-dominio.com` (para produção)
   
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://seu-dominio.com/api/auth/callback/google` (para produção)

### 3. Obter as credenciais

1. Após criar, você receberá:
   - **Client ID** (GOOGLE_CLIENT_ID)
   - **Client Secret** (GOOGLE_CLIENT_SECRET)

### 4. Configurar as variáveis de ambiente

Edite o arquivo `frontend/.env.local` e substitua os valores:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu-google-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-google-client-secret-aqui
```

### 5. Gerar uma chave secreta para NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use um gerador online de chaves aleatórias.

### 6. Reiniciar o servidor

Após configurar as variáveis de ambiente, reinicie o servidor do frontend:

```bash
cd frontend
npm run dev
```

## Testando a configuração

1. Acesse a página de login: `http://localhost:3000/login`
2. Clique no botão do Google
3. Você deve ser redirecionado para a página de autenticação do Google
4. Após autorizar, deve ser redirecionado de volta para a aplicação

## Problemas comuns

### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de redirecionamento estão corretas no Google Cloud Console
- Certifique-se de que `NEXTAUTH_URL` está correto

### Erro: "invalid_client"
- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- Certifique-se de que não há espaços extras nas variáveis de ambiente

### Usuário não é redirecionado após login
- Verifique se o backend está rodando na porta 5000
- Verifique se a rota `/api/user/google-auth` está funcionando

## Estrutura do fluxo de autenticação

1. Usuário clica no botão do Google
2. NextAuth redireciona para o Google
3. Google autentica o usuário
4. Google redireciona de volta com os dados do usuário
5. NextAuth chama o callback `signIn`
6. O callback faz uma requisição para `/api/user/google-auth` no backend
7. Backend cria/atualiza o usuário e retorna um token JWT
8. Frontend armazena o token e redireciona para o perfil
