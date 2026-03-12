"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { useAuthgearContext } from "./AuthgearProvider.js";

export type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SignOutButton({ children = "Sign Out", ...props }: SignOutButtonProps) {
  const { signOut } = useAuthgearContext();
  return (
    <button {...props} onClick={signOut}>
      {children}
    </button>
  );
}
