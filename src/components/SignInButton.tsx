"use client";

import React, { type ButtonHTMLAttributes } from "react";
import { useAuthgearContext, type SignInOptions } from "./AuthgearProvider.js";

export interface SignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  signInOptions?: SignInOptions;
}

export function SignInButton({ signInOptions, children = "Sign In", ...props }: SignInButtonProps) {
  const { signIn } = useAuthgearContext();
  return (
    <button {...props} onClick={(e) => { props.onClick?.(e); signIn(signInOptions); }}>
      {children}
    </button>
  );
}
