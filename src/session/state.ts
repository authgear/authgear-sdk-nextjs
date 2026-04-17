import { SessionState, type SessionData, type Session } from "../types.js";

export function deriveSessionState(data: SessionData | null): Session {
  if (data === null) {
    return {
      state: SessionState.NoSession,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      expiresAt: null,
      user: null,
    };
  }

  return {
    state: SessionState.Authenticated,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    idToken: data.idToken,
    expiresAt: data.expiresAt,
    user: null, // User is fetched separately when needed
  };
}

export function isTokenExpired(expiresAt: number): boolean {
  // Consider expired 30 seconds early for safety margin
  return Date.now() / 1000 >= expiresAt - 30;
}
