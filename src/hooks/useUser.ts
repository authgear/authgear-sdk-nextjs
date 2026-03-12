"use client";

import { useAuthgearContext } from "../components/AuthgearProvider.js";
import type { UserInfo } from "../types.js";

/** Returns the current user info, or null if not authenticated. */
export function useUser(): UserInfo | null {
  const { user } = useAuthgearContext();
  return user;
}
