"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { SessionState, type UserInfo } from "../types.js";

export interface AuthgearContextValue {
  state: SessionState;
  user: UserInfo | null;
  isLoaded: boolean;
  signIn: (options?: SignInOptions) => void;
  signOut: () => void;
}

export interface SignInOptions {
  returnTo?: string;
  loginPath?: string;
  /**
   * OIDC `prompt` parameter for this sign-in call.
   * Overrides the global `isSSOEnabled` setting for this navigation.
   * Any valid OIDC prompt string is accepted (e.g. `"login"`, `"none"`, `"consent"`).
   * Use `PromptOption.Login` as a convenience constant for the most common case.
   */
  prompt?: string;
}

const AuthgearContext = createContext<AuthgearContextValue | null>(null);

export interface AuthgearProviderProps {
  children: ReactNode;
  /** Path to the userinfo API route. Defaults to "/api/auth/userinfo". */
  userInfoPath?: string;
  /** Path to the login route. Defaults to "/api/auth/login". */
  loginPath?: string;
  /** Path to the logout route. Defaults to "/api/auth/logout". */
  logoutPath?: string;
}

export function AuthgearProvider({
  children,
  userInfoPath = "/api/auth/userinfo",
  loginPath = "/api/auth/login",
  logoutPath = "/api/auth/logout",
}: AuthgearProviderProps) {
  const [state, setState] = useState<SessionState>(SessionState.Unknown);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch(userInfoPath);
        if (cancelled) return;

        if (res.ok) {
          const userInfo = (await res.json()) as UserInfo;
          setState(SessionState.Authenticated);
          setUser(userInfo);
        } else {
          setState(SessionState.NoSession);
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          setState(SessionState.NoSession);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    fetchSession();
    return () => { cancelled = true; };
  }, [userInfoPath]);

  const signIn = useCallback(
    (options?: SignInOptions) => {
      const path = options?.loginPath ?? loginPath;
      const url = new URL(path, window.location.origin);
      if (options?.returnTo) {
        url.searchParams.set("returnTo", options.returnTo);
      }
      if (options?.prompt) {
        url.searchParams.set("prompt", options.prompt);
      }
      window.location.href = url.toString();
    },
    [loginPath],
  );

  const signOut = useCallback(() => {
    window.location.href = logoutPath;
  }, [logoutPath]);

  return (
    <AuthgearContext.Provider value={{ state, user, isLoaded, signIn, signOut }}>
      {children}
    </AuthgearContext.Provider>
  );
}

export function useAuthgearContext(): AuthgearContextValue {
  const ctx = useContext(AuthgearContext);
  if (!ctx) {
    throw new Error("useAuthgearContext must be used within <AuthgearProvider>");
  }
  return ctx;
}
