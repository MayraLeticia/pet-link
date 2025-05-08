"use client";

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "../services/SocketContext";
import "../styles/globals.css"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pet Link",
  description: "",
};


export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}> 
      <SocketProvider>
        <div className={inter.className}>
          <Component {...pageProps} />
        </div>
      </SocketProvider>
    </SessionProvider>
  );
}
