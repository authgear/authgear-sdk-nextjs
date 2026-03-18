import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "./types.js";
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

    // Always allow public paths
    if (matchesPath(pathname, publicPaths)) {
      return NextResponse.next();
    }

    const sessionCookieValue = request.cookies.get(resolved.cookieName)?.value;
    let sessionData = sessionCookieValue
      ? decryptSession(sessionCookieValue, resolved.sessionSecret)
      : null;

    // Try to refresh expired token
    if (sessionData && isTokenExpired(sessionData.expiresAt) && sessionData.refreshToken) {
      try {
        const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
        const tokenResponse = await refreshAccessToken(oidcConfig, {
          refreshToken: sessionData.refreshToken,
          clientID: resolved.clientID,
        });
        sessionData = {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token ?? sessionData.refreshToken,
          idToken: tokenResponse.id_token ?? sessionData.idToken,
          expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
        };
      } catch {
        sessionData = null;
      }
    }

    // Redirect unauthenticated requests on protected paths
    if (!sessionData && matchesPath(pathname, protectedPaths)) {
      const loginURL = new URL(loginPath, request.nextUrl.origin);
      loginURL.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginURL);
    }

    const response = NextResponse.next();

    if (sessionData) {
      // Update session cookie (captures rotated refresh token if server rotated it)
      const newCookie = buildSessionCookie(resolved.cookieName, sessionData, resolved.sessionSecret);
      response.cookies.set(newCookie.name, newCookie.value, {
        httpOnly: newCookie.httpOnly,
        secure: newCookie.secure,
        sameSite: newCookie.sameSite,
        path: newCookie.path,
        maxAge: newCookie.maxAge,
      });
    } else if (sessionCookieValue) {
      // Refresh failed — clear the stale cookie so Server Components don't see a broken session
      response.cookies.set(resolved.cookieName, "", { maxAge: 0, path: "/" });
    }

    return response;
  };
}
