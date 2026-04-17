import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig, SessionData } from "./types.js";
import { resolveConfig } from "./config.js";
import { decryptSession, buildSessionCookie } from "./session/cookie.js";
import { isTokenExpired } from "./session/state.js";
import { fetchOIDCConfiguration } from "./oauth/discovery.js";
import { refreshAccessToken } from "./oauth/token.js";

export interface AuthgearProxyOptions extends AuthgearConfig {
  /**
   * Paths that require authentication. Unauthenticated requests are redirected to login.
   * Supports exact paths and prefix patterns ending with `*` (e.g. "/dashboard/*").
   */
  protectedPaths?: string[];

  /**
   * Paths that are always public (never redirected to login).
   * Takes precedence over protectedPaths.
   * Defaults to ["/api/auth/*"].
   */
  publicPaths?: string[];

  /**
   * URL to redirect unauthenticated users. Defaults to "/api/auth/login".
   */
  loginPath?: string;
}

function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith("*")) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern;
  });
}

async function tryRefreshSession(
  sessionData: SessionData,
  resolved: ReturnType<typeof resolveConfig>,
): Promise<SessionData | null> {
  try {
    const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
    const tokenResponse = await refreshAccessToken(oidcConfig, {
      refreshToken: sessionData.refreshToken ?? "",
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

async function loadSession(
  request: NextRequest,
  resolved: ReturnType<typeof resolveConfig>,
): Promise<{ sessionData: SessionData | null; sessionCookieValue: string | undefined }> {
  const sessionCookieValue = request.cookies.get(resolved.cookieName)?.value;
  let sessionData = (sessionCookieValue !== undefined && sessionCookieValue !== "")
    ? decryptSession(sessionCookieValue, resolved.sessionSecret)
    : null;

  if (
    sessionData !== null &&
    isTokenExpired(sessionData.expiresAt) &&
    sessionData.refreshToken !== null &&
    sessionData.refreshToken !== ""
  ) {
    sessionData = await tryRefreshSession(sessionData, resolved);
  }

  return { sessionData, sessionCookieValue };
}

function applySessionCookie(
  response: NextResponse,
  sessionData: SessionData | null,
  sessionCookieValue: string | undefined,
  cookieName: string,
  sessionSecret: string,
): void {
  if (sessionData !== null) {
    const newCookie = buildSessionCookie(cookieName, sessionData, sessionSecret);
    response.cookies.set(newCookie.name, newCookie.value, {
      httpOnly: newCookie.httpOnly,
      secure: newCookie.secure,
      sameSite: newCookie.sameSite,
      path: newCookie.path,
      maxAge: newCookie.maxAge,
    });
  } else if (sessionCookieValue !== undefined && sessionCookieValue !== "") {
    // Refresh failed — clear the stale cookie so Server Components don't see a broken session
    response.cookies.set(cookieName, "", { maxAge: 0, path: "/" });
  }
}

/**
 * Create a Next.js 16 proxy function for Authgear authentication.
 *
 * Usage in `proxy.ts`:
 * ```ts
 * import { createAuthgearProxy } from "@authgear/nextjs/proxy";
 * export const proxy = createAuthgearProxy({ ...config, protectedPaths: ["/dashboard/*"] });
 * ```
 */
export function createAuthgearProxy(options: AuthgearProxyOptions) {
  const resolved = resolveConfig(options);
  const protectedPaths = options.protectedPaths ?? [];
  const publicPaths = options.publicPaths ?? ["/api/auth/*"];
  const loginPath = options.loginPath ?? "/api/auth/login";

  return async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    if (matchesPath(pathname, publicPaths)) {
      return NextResponse.next();
    }

    const { sessionData, sessionCookieValue } = await loadSession(request, resolved);

    if (sessionData === null && matchesPath(pathname, protectedPaths)) {
      const loginURL = new URL(loginPath, request.nextUrl.origin);
      loginURL.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginURL);
    }

    const response = NextResponse.next();
    applySessionCookie(response, sessionData, sessionCookieValue, resolved.cookieName, resolved.sessionSecret);

    return response;
  };
}
