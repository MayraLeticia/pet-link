import { SessionProvider } from "next-auth/react";
import "../styles/globals.css"; 

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // permite que os componentes acessem o estado de sessão do usuário
    <SessionProvider session={session}> 
      <Component {...pageProps} />
    </SessionProvider>
  );
}
