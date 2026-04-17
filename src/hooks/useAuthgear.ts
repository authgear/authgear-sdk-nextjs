"use client";

import {
  useAuthgearContext,
  type SignInOptions,
} from "../components/AuthgearProvider.js";
import { SessionState, type UserInfo } from "../types.js";

export interface UseAuthgearReturn {
  /** Current session state */
  state: SessionState;
  /** Current user info, null if not authenticated */
  user: UserInfo | null;
  /** Whether the initial session check has completed */
  isLoaded: boolean;
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Navigate to the sign-in page */
  signIn: (options?: SignInOptions) => void;
  /** Navigate to the sign-out endpoint */
  signOut: () => void;
  /** Open an Authgear page (e.g. Page.Settings) in a new tab */
  openPage: (path: string) => void;
}

export function useAuthgear(): UseAuthgearReturn {
  const { state, user, isLoaded, signIn, signOut, openPage } =
    useAuthgearContext();

  return {
    state,
    user,
    isLoaded,
    isAuthenticated: state === SessionState.Authenticated,
    signIn,
    signOut,
    openPage,
  };
}
