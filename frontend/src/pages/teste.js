
//usem como quiserem
"use client";

import { Menu } from "../components";

import { signIn } from "next-auth/react";

export default function Teste() {
  return (
    <div className="w-screen h-screen flex flex-row justify-start items-center">
      <Menu />
    </div>
  );
}
