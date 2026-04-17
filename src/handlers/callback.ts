import { NextResponse, type NextRequest } from "next/server";
import type { AuthgearConfig } from "../types.js";
import { resolveConfig } from "../config.js";
import { fetchOIDCConfiguration } from "../oauth/discovery.js";
import { exchangeCode } from "../oauth/token.js";
import {
  decryptPKCECookie,
  buildSessionCookie,
  type CookieOptions,
} from "../session/cookie.js";

interface CallbackParams {
  code: string;
  state: string;
}

function parseCallbackParams(
  request: NextRequest
): CallbackParams | NextResponse {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription =
    request.nextUrl.searchParams.get("error_description");

  if (error !== null && error !== "") {
    return NextResponse.json(
      { error, error_description: errorDescription },
      { status: 400 }
    );
  }
  if (code === null || code === "" || state === null || state === "") {
    return NextResponse.json(
      {
        error: "missing_params",
        error_description: "Missing code or state parameter",
      },
      { status: 400 }
    );
  }
  return { code, state };
}

function validatePKCE(
  request: NextRequest,
  sessionSecret: string,
  state: string
): { codeVerifier: string; returnTo: string } | NextResponse {
  const pkceCookieValue = request.cookies.get("authgear.pkce")?.value;
  if (pkceCookieValue === undefined || pkceCookieValue === "") {
    return NextResponse.json(
      { error: "invalid_state", error_description: "Missing PKCE cookie" },
      { status: 400 }
    );
  }

  const pkceData = decryptPKCECookie(pkceCookieValue, sessionSecret);
  if (pkceData?.state !== state) {
    return NextResponse.json(
      { error: "invalid_state", error_description: "State mismatch" },
      { status: 400 }
    );
  }

  return { codeVerifier: pkceData.codeVerifier, returnTo: pkceData.returnTo };
}

function applyCookie(response: NextResponse, cookie: CookieOptions): void {
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
}

export async function handleCallback(
  request: NextRequest,
  config: AuthgearConfig
): Promise<NextResponse> {
  const resolved = resolveConfig(config);

  const params = parseCallbackParams(request);
  if (params instanceof NextResponse) return params;

  const pkceResult = validatePKCE(
    request,
    resolved.sessionSecret,
    params.state
  );
  if (pkceResult instanceof NextResponse) return pkceResult;

  const oidcConfig = await fetchOIDCConfiguration(resolved.endpoint);
  const tokenResponse = await exchangeCode(oidcConfig, {
    code: params.code,
    codeVerifier: pkceResult.codeVerifier,
    clientID: resolved.clientID,
    redirectURI: resolved.redirectURI,
  });

  const sessionCookie = buildSessionCookie(
    resolved.cookieName,
    {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? null,
      idToken: tokenResponse.id_token ?? null,
      expiresAt: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
    },
    resolved.sessionSecret
  );

  const returnTo = pkceResult.returnTo !== "" ? pkceResult.returnTo : "/";
  const response = NextResponse.redirect(
    new URL(returnTo, request.nextUrl.origin)
  );
  applyCookie(response, sessionCookie);
  response.cookies.set("authgear.pkce", "", { maxAge: 0, path: "/" });

  return response;
}
