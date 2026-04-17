"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { SessionState, type UserInfo } from "../types.js";

export interface AuthgearContextValue {
  state: SessionState;
  user: UserInfo | null;
  isLoaded: boolean;
  signIn: (options?: SignInOptions) => void;
  signOut: () => void;
  /** Open an Authgear page (e.g. Page.Settings) in a new tab for the current user */
  openPage: (path: string) => void;
}

export interface SignInOptions {
  returnTo?: string;
  loginPath?: string;
  /**
   * OIDC `prompt` parameter for this sign-in call.
   * Overrides the global `isSSOEnabled` setting for this navigation.
   * Use `PromptOption.Login` or `PromptOption.None` for type-safe values.
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
  /** Path to the open-page route handler. Defaults to "/api/auth/open". */
  openPagePath?: string;
}

export function AuthgearProvider({
  children,
  userInfoPath = "/api/auth/userinfo",
  loginPath = "/api/auth/login",
  logoutPath = "/api/auth/logout",
  openPagePath = "/api/auth/open",
}: AuthgearProviderProps): React.JSX.Element {
  const [state, setState] = useState<SessionState>(SessionState.Unknown);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession(): Promise<void> {
      try {
        const res = await fetch(userInfoPath);
        if (cancelled) return;

        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          const userInfo = (await res.json()) as unknown as UserInfo;
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

    fetchSession().catch(() => {
      // Errors are handled inside fetchSession
    });
    return () => {
      cancelled = true;
    };
  }, [userInfoPath]);

  const signIn = useCallback(
    (options?: SignInOptions) => {
      const path = options?.loginPath ?? loginPath;
      const url = new URL(path, window.location.origin);
      if (options?.returnTo !== undefined && options.returnTo !== "") {
        url.searchParams.set("returnTo", options.returnTo);
      }
      if (options?.prompt != null) {
        url.searchParams.set("prompt", options.prompt);
      }
      window.location.href = url.toString();
    },
    [loginPath]
  );

  const signOut = useCallback(() => {
    window.location.href = logoutPath;
  }, [logoutPath]);

  const openPage = useCallback(
    (path: string) => {
      const url = new URL(openPagePath, window.location.origin);
      url.searchParams.set("page", path);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },
    [openPagePath]
  );

  const contextValue = useMemo(
    () => ({ state, user, isLoaded, signIn, signOut, openPage }),
    [state, user, isLoaded, signIn, signOut, openPage]
  );

  return (
    <AuthgearContext.Provider value={contextValue}>
      {children}
    </AuthgearContext.Provider>
  );
}

export function useAuthgearContext(): AuthgearContextValue {
  const ctx = useContext(AuthgearContext);
  if (ctx === null) {
    throw new Error(
      "useAuthgearContext must be used within <AuthgearProvider>"
    );
  }
  return ctx;
}
