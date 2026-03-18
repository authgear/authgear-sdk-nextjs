import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { exchangeCode } from "../oauth/token.js";
import { decryptPKCECookie, buildSessionCookie } from "../session/cookie.js";

export async function handleCallback(
  request: NextRequest,
  config: AuthgearConfig,
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    return NextResponse.json(
      { error, error_description: errorDescription },
      { status: 400 },
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "missing_params", error_description: "Missing code or state parameter" },
      { status: 400 },
    );
  }

  // Validate PKCE state
  const pkceCookieValue = request.cookies.get("authgear.pkce")?.value;
  if (!pkceCookieValue) {
    return NextResponse.json(
      { error: "invalid_state", error_description: "Missing PKCE cookie" },
      { status: 400 },
    );
  }

  const pkceData = decryptPKCECookie(pkceCookieValue, resolved.sessionSecret);
  if (!pkceData || pkceData.state !== state) {
    return NextResponse.json(
      { error: "invalid_state", error_description: "State mismatch" },
      { status: 400 },
    );
  }

  // Exchange code for tokens
  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  const tokenResponse = await exchangeCode(oidcConfig, {
    code,
    codeVerifier: pkceData.codeVerifier,
    clientID: resolved.clientID,
    redirectURI: resolved.redirectURI,
  });

  // Build session cookie
  const sessionCookie = buildSessionCookie(
    resolved.cookieName,
    {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? null,
      idToken: tokenResponse.id_token ?? null,
      expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
    },
    resolved.sessionSecret,
  );

  const returnTo = pkceData.returnTo || "/";
  const redirectURL = new URL(returnTo, request.nextUrl.origin);
  const response = NextResponse.redirect(redirectURL);

  // Set session cookie
  response.cookies.set(sessionCookie.name, sessionCookie.value, {
    httpOnly: sessionCookie.httpOnly,
    secure: sessionCookie.secure,
    sameSite: sessionCookie.sameSite,
    path: sessionCookie.path,
    maxAge: sessionCookie.maxAge,
  });

  // Clear PKCE cookie
  response.cookies.set("authgear.pkce", "", { maxAge: 0, path: "/" });

  return response;
}
