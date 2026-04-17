import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { refreshAccessToken } from "../oauth/token.js";
import { decryptSession, buildSessionCookie } from "../session/cookie.js";

export async function handleRefresh(
  request: NextRequest,
  config: AuthgearConfig
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  const sessionCookieValue = request.cookies.get(resolved.cookieName)?.value;
  if (sessionCookieValue === undefined || sessionCookieValue === "") {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const session = decryptSession(sessionCookieValue, resolved.sessionSecret);
  if (session?.refreshToken == null || session.refreshToken === "") {
    return NextResponse.json({ error: "no_refresh_token" }, { status: 401 });
  }

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  const tokenResponse = await refreshAccessToken(oidcConfig, {
    refreshToken: session.refreshToken,
    clientID: resolved.clientID,
  });

  const newSession = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? session.refreshToken,
    idToken: tokenResponse.id_token ?? session.idToken,
    expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
  };

  const sessionCookie = buildSessionCookie(
    resolved.cookieName,
    newSession,
    resolved.sessionSecret
  );
  const response = NextResponse.json({ ok: true });

  response.cookies.set(sessionCookie.name, sessionCookie.value, {
    httpOnly: sessionCookie.httpOnly,
    secure: sessionCookie.secure,
    sameSite: sessionCookie.sameSite,
    path: sessionCookie.path,
    maxAge: sessionCookie.maxAge,
  });

  return response;
}
