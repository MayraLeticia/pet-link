import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Redireciona para a página de login personalizada
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          // Verificar se o usuário já existe no backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/google-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: user.id,
              image: user.image,
            }),
          });

          if (response.ok) {
            const userData = await response.json();
            // Armazenar dados do usuário no token
            user.backendId = userData.id;
            user.backendToken = userData.token;
            return true;
          }
        } catch (error) {
          console.error('Erro ao autenticar com Google:', error);
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.backendId = user.backendId;
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.backendId = token.backendId;
      session.backendToken = token.backendToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirecionar para o perfil após login bem-sucedido
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl + "/profile";
    },
  },
};

export default NextAuth(authOptions);