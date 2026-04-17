import "server-only";
import { cookies } from "next/headers";
import {
  SessionState,
  Page,
  PromptOption,
  type Session,
  type UserInfo,
  type JWTPayload,
  type AuthgearConfig,
  type SessionData,
} from "./types.js";
import { resolveConfig } from "./config.js";
import { decryptSession, buildSessionCookie } from "./session/cookie.js";
import { deriveSessionState, isTokenExpired } from "./session/state.js";
import { fetchOIDCConfiguration } from "./oauth/discovery.js";
import { refreshAccessToken, getAppSessionToken } from "./oauth/token.js";
import { buildOpenURL } from "./oauth/authorize.js";
import { verifyJWT } from "./jwt/verify.js";
import { parseUserInfo } from "./user.js";

async function tryRefreshSessionData(
  refreshToken: string,
  sessionData: SessionData,
  resolved: ReturnType<typeof resolveConfig>
): Promise<SessionData | null> {
  try {
    const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
    const tokenResponse = await refreshAccessToken(oidcConfig, {
      refreshToken,
      clientID: resolved.clientID,
    });
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? sessionData.refreshToken,
      idToken: tokenResponse.id_token ?? sessionData.idToken,
      expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
    };
  } catch {
    return null;
  }
}

async function persistSessionCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  sessionData: SessionData,
  resolved: ReturnType<typeof resolveConfig>
): Promise<void> {
  try {
    const newCookie = buildSessionCookie(
      resolved.cookieName,
      sessionData,
      resolved.sessionSecret
    );
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
}

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

  let sessionData =
    sessionCookieValue !== undefined && sessionCookieValue !== ""
      ? decryptSession(sessionCookieValue, resolved.sessionSecret)
      : null;

  // Auto-refresh expired token so callers (e.g. Server Actions) always get a valid access token
  if (
    sessionData !== null &&
    isTokenExpired(sessionData.expiresAt) &&
    sessionData.refreshToken !== null &&
    sessionData.refreshToken !== ""
  ) {
    const refreshed = await tryRefreshSessionData(
      sessionData.refreshToken,
      sessionData,
      resolved
    );
    if (refreshed !== null) {
      sessionData = refreshed;
      await persistSessionCookie(cookieStore, sessionData, resolved);
    } else {
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
export async function currentUser(
  config: AuthgearConfig
): Promise<UserInfo | null> {
  const resolved = resolveConfig(config);
  const cookieStore = await cookies();
  const sessionCookieValue = cookieStore.get(resolved.cookieName)?.value;

  if (sessionCookieValue === undefined || sessionCookieValue === "")
    return null;

  let sessionData = decryptSession(sessionCookieValue, resolved.sessionSecret);
  if (sessionData === null) return null;

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);

  // Auto-refresh expired token
  if (
    isTokenExpired(sessionData.expiresAt) &&
    sessionData.refreshToken !== null &&
    sessionData.refreshToken !== ""
  ) {
    const refreshed = await tryRefreshSessionData(
      sessionData.refreshToken,
      sessionData,
      resolved
    );
    if (refreshed === null) return null;
    sessionData = refreshed;
    // Persist the updated session (with rotated refresh token) back to the cookie.
    // This succeeds in Route Handlers but throws in Server Components (Next.js restriction).
    // In Server Components the proxy will write the updated cookie on the next page navigation.
    await persistSessionCookie(cookieStore, sessionData, resolved);
  }

  const userinfoRes = await fetch(oidcConfig.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${sessionData.accessToken}` },
  });

  if (!userinfoRes.ok) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const raw = (await userinfoRes.json()) as unknown as Record<string, unknown>;
  return parseUserInfo(raw);
}

/**
 * Verify a JWT access token (from Authorization: Bearer header).
 * Useful for protecting API routes.
 *
 * @throws If the token is invalid, expired, or has wrong issuer/audience
 */
export async function verifyAccessToken(
  token: string,
  config: AuthgearConfig
): Promise<JWTPayload> {
  const resolved = resolveConfig(config);
  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  return verifyJWT(token, oidcConfig);
}

/**
 * Get a URL that opens an Authgear page (e.g. `/settings`) with the current
 * user already authenticated — no re-login required.
 *
 * Exchanges the user's refresh token for a short-lived `app_session_token`
 * via `POST /oauth2/app_session_token`, then builds an authorization URL
 * that uses that token as a `login_hint` so Authgear can authenticate the
 * user silently.
 *
 * @param page - A `Page` enum value (e.g. `Page.Settings`) or an arbitrary path string.
 * @param config - The Authgear SDK config.
 * @returns A URL string. Open it in a new tab (`window.open(url, "_blank")`).
 * @throws If the user is not authenticated or has no refresh token.
 *
 * @example
 * ```ts
 * // Server Action
 * "use server";
 * import { getOpenURL, Page } from "@authgear/nextjs/server";
 * import { authgearConfig } from "@/lib/authgear";
 *
 * export async function getSettingsURLAction() {
 *   return getOpenURL(Page.Settings, authgearConfig);
 * }
 * ```
 */
export async function getOpenURL(
  page: Page | string,
  config: AuthgearConfig
): Promise<string> {
  const resolved = resolveConfig(config);
  const cookieStore = await cookies();
  const sessionCookieValue = cookieStore.get(resolved.cookieName)?.value;
  if (sessionCookieValue === undefined || sessionCookieValue === "")
    throw new Error("Not authenticated");
  const sessionData = decryptSession(
    sessionCookieValue,
    resolved.sessionSecret
  );
  if (sessionData === null) throw new Error("Not authenticated");
  if (sessionData.refreshToken === null || sessionData.refreshToken === "")
    throw new Error("No refresh token in session");
  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  const { app_session_token } = await getAppSessionToken(
    resolved.endpoint,
    sessionData.refreshToken
  );
  return buildOpenURL(oidcConfig, {
    clientID: resolved.clientID,
    appSessionToken: app_session_token,
    targetPath: page,
    scopes: resolved.scopes,
  });
}

export { SessionState, Page, PromptOption };
export type { Session, UserInfo, JWTPayload };
