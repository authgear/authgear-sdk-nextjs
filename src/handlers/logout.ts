import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { revokeToken } from "../oauth/token.js";
import { decryptSession, buildClearCookie } from "../session/cookie.js";

export async function handleLogout(
  request: NextRequest,
  config: AuthgearConfig,
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  // Revoke refresh token if present
  const sessionCookieValue = request.cookies.get(resolved.cookieName)?.value;
  if (sessionCookieValue !== undefined && sessionCookieValue !== "") {
    const session = decryptSession(sessionCookieValue, resolved.sessionSecret);
    if (session !== null && session.refreshToken !== null && session.refreshToken !== "") {
      const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
      try {
        await revokeToken(oidcConfig, session.refreshToken);
      } catch {
        // Best-effort revocation
      }
    }
  }

  const clearCookie = buildClearCookie(resolved.cookieName);
  const redirectURL = new URL(resolved.postLogoutRedirectURI, request.nextUrl.origin);
  const response = NextResponse.redirect(redirectURL);

  response.cookies.set(clearCookie.name, clearCookie.value, {
    httpOnly: clearCookie.httpOnly,
    secure: clearCookie.secure,
    sameSite: clearCookie.sameSite,
    path: clearCookie.path,
    maxAge: clearCookie.maxAge,
  });

  return response;
}
