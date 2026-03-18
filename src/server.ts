import "server-only";
import { cookies } from "next/headers";
import { SessionState, Page, type Session, type UserInfo, type JWTPayload, type AuthgearConfig } from "./types.js";
import { resolveConfig } from "./config.js";
import { decryptSession, buildSessionCookie } from "./session/cookie.js";
import { deriveSessionState, isTokenExpired } from "./session/state.js";
import { fetchOIDCConfiguration } from "./oauth/discovery.js";
import { refreshAccessToken } from "./oauth/token.js";
// ROADMAP: import { getAppSessionToken } from "./oauth/token.js";
// ROADMAP: import { buildOpenURL } from "./oauth/authorize.js";
import { verifyJWT } from "./jwt/verify.js";
import { parseUserInfo } from "./user.js";

/**
 * Read the current session in a Server Component, Route Handler, or Server Action.
 * Automatically refreshes the access token if expired, so `session.accessToken` is
 * always valid when the session state is `Authenticated`. Use this when you need a
 * fresh access token to call a downstream API (e.g. inside a Server Action).
 */
export async function auth(config: AuthgearConfig): Promise<Session> {
  const resolved = resolveConfig(config);
  const cookieStore = await cookies();
  const sessionCookieValue = cookieStore.get(resolved.cookieName)?.value;

  let sessionData = sessionCookieValue
    ? decryptSession(sessionCookieValue, resolved.sessionSecret)
    : null;

  // Auto-refresh expired token so callers (e.g. Server Actions) always get a valid access token
  if (sessionData && isTokenExpired(sessionData.expiresAt) && sessionData.refreshToken) {
    try {
      const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
      const tokenResponse = await refreshAccessToken(oidcConfig, {
        refreshToken: sessionData.refreshToken,
        clientID: resolved.clientID,
        clientSecret: resolved.clientSecret || undefined,
      });
      sessionData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token ?? sessionData.refreshToken,
        idToken: tokenResponse.id_token ?? sessionData.idToken,
        expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
      };
      try {
        const newCookie = buildSessionCookie(resolved.cookieName, sessionData, resolved.sessionSecret);
        cookieStore.set(newCookie.name, newCookie.value, {
          httpOnly: newCookie.httpOnly,
          secure: newCookie.secure,
          sameSite: newCookie.sameSite,
          path: newCookie.path,
          maxAge: newCookie.maxAge,
        });
      } catch {
        // Not in a Route Handler — cookie will be persisted by the proxy on next navigation
      }
    } catch {
      sessionData = null;
    }
  }

  return deriveSessionState(sessionData);
}

/**
 * Get the current user in a Server Component or Route Handler.
 * Automatically refreshes the access token if expired, including persisting a
 * rotated refresh token when the Authgear project has refresh token rotation enabled.
 * Returns null if not authenticated or if the session cannot be refreshed.
 */
export async function currentUser(config: AuthgearConfig): Promise<UserInfo | null> {
  const resolved = resolveConfig(config);
  const cookieStore = await cookies();
  const sessionCookieValue = cookieStore.get(resolved.cookieName)?.value;

  if (!sessionCookieValue) return null;

  let sessionData = decryptSession(sessionCookieValue, resolved.sessionSecret);
  if (!sessionData) return null;

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);

  // Auto-refresh expired token
  if (isTokenExpired(sessionData.expiresAt) && sessionData.refreshToken) {
    try {
      const tokenResponse = await refreshAccessToken(oidcConfig, {
        refreshToken: sessionData.refreshToken,
        clientID: resolved.clientID,
        clientSecret: resolved.clientSecret || undefined,
      });
      sessionData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token ?? sessionData.refreshToken,
        idToken: tokenResponse.id_token ?? sessionData.idToken,
        expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
      };
      // Persist the updated session (with rotated refresh token) back to the cookie.
      // This succeeds in Route Handlers but throws in Server Components (Next.js restriction).
      // In Server Components the proxy will write the updated cookie on the next page navigation.
      try {
        const newCookie = buildSessionCookie(resolved.cookieName, sessionData, resolved.sessionSecret);
        cookieStore.set(newCookie.name, newCookie.value, {
          httpOnly: newCookie.httpOnly,
          secure: newCookie.secure,
          sameSite: newCookie.sameSite,
          path: newCookie.path,
          maxAge: newCookie.maxAge,
        });
      } catch {
        // Not in a Route Handler — cookie will be persisted by the proxy on next navigation
      }
    } catch {
      return null;
    }
  }

  const userinfoRes = await fetch(oidcConfig.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${sessionData.accessToken}` },
  });

  if (!userinfoRes.ok) return null;

  const raw = (await userinfoRes.json()) as Record<string, unknown>;
  return parseUserInfo(raw);
}

/**
 * Verify a JWT access token (from Authorization: Bearer header).
 * Useful for protecting API routes.
 *
 * @throws {Error} If the token is invalid, expired, or has wrong issuer/audience
 */
export async function verifyAccessToken(
  token: string,
  config: AuthgearConfig,
): Promise<JWTPayload> {
  const resolved = resolveConfig(config);
  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  return verifyJWT(token, oidcConfig);
}

// ROADMAP: getOpenURL — open Authgear settings (or any Authgear page) with the
// current user pre-authenticated via the app_session_token exchange.
//
// This requires the Authgear server to grant the client permission to call
// POST /oauth2/app_session_token ("full user access"). Once that server-side
// configuration is available, uncomment the implementation below and the
// imports above, then expose it from the example dashboard via a Server Action.
//
// export async function getOpenURL(
//   page: Page | string,
//   config: AuthgearConfig,
// ): Promise<string> {
//   const resolved = resolveConfig(config);
//   const cookieStore = await cookies();
//   const sessionCookieValue = cookieStore.get(resolved.cookieName)?.value;
//   if (!sessionCookieValue) throw new Error("Not authenticated");
//   const sessionData = decryptSession(sessionCookieValue, resolved.sessionSecret);
//   if (!sessionData?.refreshToken) throw new Error("No refresh token in session");
//   const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
//   const { app_session_token } = await getAppSessionToken(
//     resolved.endpoint,
//     sessionData.refreshToken,
//   );
//   return buildOpenURL(oidcConfig, {
//     clientID: resolved.clientID,
//     appSessionToken: app_session_token,
//     targetPath: page,
//   });
// }

export { SessionState, Page };
export type { Session, UserInfo, JWTPayload };
