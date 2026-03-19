import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { generateCodeVerifier } from "../oauth/pkce.js";
import { buildAuthorizeURL, generateState } from "../oauth/authorize.js";
import { buildPKCECookie } from "../session/cookie.js";

export async function handleLogin(
  request: NextRequest,
  config: AuthgearConfig,
): Promise<NextResponse> {
  const resolved = resolveConfig(config);
  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);

  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/";
  const codeVerifier = generateCodeVerifier();
  const state = generateState();

  const authorizeURL = buildAuthorizeURL(oidcConfig, {
    clientID: resolved.clientID,
    redirectURI: resolved.redirectURI,
    scopes: resolved.scopes,
    codeVerifier,
    state,
    prompt: resolved.isSSOEnabled ? undefined : "login",
  });

  const pkceCookie = buildPKCECookie({ codeVerifier, state, returnTo }, resolved.sessionSecret);

  const response = NextResponse.redirect(authorizeURL);
  response.cookies.set(pkceCookie.name, pkceCookie.value, {
    httpOnly: pkceCookie.httpOnly,
    secure: pkceCookie.secure,
    sameSite: pkceCookie.sameSite,
    path: pkceCookie.path,
    maxAge: pkceCookie.maxAge,
  });

  return response;
}
