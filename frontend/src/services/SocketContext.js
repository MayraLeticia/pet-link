"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Verificar se o usuário está autenticado via NextAuth ou via localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const userId = session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);

    // Conectar ao socket se tiver token ou sessão autenticada
    if ((status === "authenticated" || token) && userId) {
      console.log("Iniciando conexão com o socket. UserId:", userId);

      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["websocket", "polling"],
        auth: {
          token: token,
          userId: userId
        },
      });

      newSocket.on("connect", () => {
        console.log("Conectado ao WebSocket");
        newSocket.emit("join", userId); // Entrar na sala do usuário
      });

      newSocket.on("connect_error", (error) => {
        console.error("Erro de conexão com o WebSocket:", error);
      });

      newSocket.on("error", (error) => {
        console.error("Erro no WebSocket:", error);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          console.log("Desconectando do WebSocket");
          newSocket.disconnect();
        }
      };
    } else {
      console.log("Não conectado ao socket. Status:", status, "Token:", !!token, "UserId:", !!userId);
    }
  }, [status, session]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};