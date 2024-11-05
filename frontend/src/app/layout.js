import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pet Link",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <SessionProvider>
            {children}
          </SessionProvider>
      </body>
    </html>
  );
}
