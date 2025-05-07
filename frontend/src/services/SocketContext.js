"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Conectado ao WebSocket");
        newSocket.emit("join", session.user.id); // Entrar na sala do usuário
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [status, session]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};