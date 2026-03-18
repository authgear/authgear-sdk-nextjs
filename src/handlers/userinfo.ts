import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig, UserInfo } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { decryptSession } from "../session/cookie.js";
import { isTokenExpired } from "../session/state.js";
import { refreshAccessToken } from "../oauth/token.js";
import { buildSessionCookie } from "../session/cookie.js";
import { parseUserInfo } from "../user.js";

export async function handleUserInfo(
  request: NextRequest,
  config: AuthgearConfig,
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  const sessionCookieValue = request.cookies.get(resolved.cookieName)?.value;
  if (!sessionCookieValue) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  let session = decryptSession(sessionCookieValue, resolved.sessionSecret);
  if (!session) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);

  // Auto-refresh if access token is expired
  if (isTokenExpired(session.expiresAt) && session.refreshToken) {
    const tokenResponse = await refreshAccessToken(oidcConfig, {
      refreshToken: session.refreshToken,
      clientID: resolved.clientID,
    });
    session = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? session.refreshToken,
      idToken: tokenResponse.id_token ?? session.idToken,
      expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
    };
  }

  // Fetch user info from Authgear
  const userinfoRes = await fetch(oidcConfig.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!userinfoRes.ok) {
    return NextResponse.json({ error: "userinfo_failed" }, { status: userinfoRes.status });
  }

  const raw = (await userinfoRes.json()) as Record<string, unknown>;
  const userInfo: UserInfo = parseUserInfo(raw);

  const response = NextResponse.json(userInfo);

  // Update session cookie if tokens were refreshed
  const newCookie = buildSessionCookie(resolved.cookieName, session, resolved.sessionSecret);
  response.cookies.set(newCookie.name, newCookie.value, {
    httpOnly: newCookie.httpOnly,
    secure: newCookie.secure,
    sameSite: newCookie.sameSite,
    path: newCookie.path,
    maxAge: newCookie.maxAge,
  });

  return response;
}
