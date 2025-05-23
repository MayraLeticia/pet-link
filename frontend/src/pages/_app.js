"use client";

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "../services/SocketContext";
import { PetProvider } from "../contexts/PetContext";
import "../styles/globals.css";
import "../styles/auth-responsive.css";
import "../styles/menu-profile-responsive.css";
import "../styles/profile-zoom.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pet Link",
  description: "",
};


export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <SocketProvider>
        <PetProvider>
          <div className={inter.className}>
            <Component {...pageProps} />
          </div>
        </PetProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
