"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pet Link",
  description: "",
};

import { SessionProvider } from "next-auth/react";
import "../styles/globals.css"; 

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}> 
      <Component {...pageProps} />
    </SessionProvider>
  );
}
